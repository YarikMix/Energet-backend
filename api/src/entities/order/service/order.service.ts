import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, FindOptions, Repository } from 'typeorm';
import { Order } from '@entities/order/models/order.entity';
import { UpdateOrderDto } from '@entities/order/dto/updateOrder.dto';
import { OrderItem } from '@entities/order/models/order-item.entity';
import { User } from '@entities/user/models/user.entity';
import { E_OrderStatus } from '@entities/order/models/types';
import { UpdateOrderItemCountDto } from '@entities/order/dto/updateOrderItemCount.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async getOrders(user: User) {
    return await this.orderRepository.find({
      relations: ['owner'],
      where: { owner: { id: user.id } },
      select: {
        owner: {
          id: true,
          name: true,
        },
      },
    } as FindOneOptions<Order>);
  }

  async getOrder(id: number, userId?: number) {
    const rawItems = await this.orderItemRepository.find({
      relations: ['item'],
      where: { orderId: id },
    });

    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['owner'],
      select: {
        owner: {
          id: true,
          name: true,
        },
      },
    } as FindOneOptions<Order>);

    let items = rawItems.map((rawItem) => ({
      count: rawItem.count,
      ...rawItem.item,
    }));

    if (userId) {
      const user = await this.userRepository.findOne({
        relations: {
          items: {
            item_type: true,
            item_producer: true,
          },
        },
        where: {
          id: userId,
        },
      } as FindOneOptions<User>);

      items = items.map((item) => {
        return {
          ...item,
          favourite: user.items.find((i) => i.id == item.id) !== undefined,
        };
      });
    }

    return { ...order, items };
  }

  public async getDraftOrder(userId: number) {
    const order = await this.orderRepository.findOne({
      relations: ['owner'],
      where: { status: E_OrderStatus.Draft, owner: { id: userId } },
      select: {
        owner: {
          id: true,
          name: true,
        },
      },
    } as FindOneOptions<Order>);

    if (!order) {
      return null;
    }

    const rawItems = await this.orderItemRepository.find({
      relations: ['item'],
      where: { orderId: order.id },
    });

    const user = await this.userRepository.findOne({
      relations: {
        items: true,
      },
      where: {
        id: userId,
      },
    } as FindOneOptions<User>);

    console.log(user.items);

    const items = await Promise.all(
      rawItems.map(async (rawItem) => {
        const favourite =
          user.items.find((i) => i.id == rawItem.itemId) != undefined;

        return {
          count: rawItem.count,
          ...rawItem.item,
          favourite,
        };
      }),
    );

    return { ...order, items } as Order;
  }

  public async createOrder(owner: User) {
    const newOrder = this.orderRepository.create();
    newOrder.owner = owner;
    newOrder.created_date = new Date();
    return await this.orderRepository.save(newOrder);
  }

  public async deleteOrder(id: number) {
    return await this.orderRepository.delete(id);
  }

  public async updateOrder(id: number, updateOrderDto: UpdateOrderDto) {
    return await this.orderRepository.update({ id }, updateOrderDto);
  }

  public async updateItemCount(
    order_id: number,
    item_id: number,
    dto: UpdateOrderItemCountDto,
  ) {
    return await this.orderItemRepository.update(
      { orderId: order_id, itemId: item_id },
      dto,
    );
  }

  public async removeItemFromOrder(order_id: number, item_id: number) {
    return await this.orderItemRepository.delete({
      orderId: order_id,
      itemId: item_id,
    });
  }

  public async addItemToOrder(order_id: number, item_id: number) {
    const item = this.orderItemRepository.create({
      orderId: order_id,
      itemId: item_id,
    });

    return await this.orderItemRepository.save(item);
  }
}
