import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
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

  async getOrder(id: number) {
    const rawItems = await this.orderItemRepository.find({
      relations: ['item'],
      where: { orderId: id },
    });

    const items = rawItems.map((rawItem) => ({
      count: rawItem.count,
      ...rawItem.item,
    }));

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

    return { ...order, items };
  }

  public async getDraftOrder(user: User) {
    const order = await this.orderRepository.findOne({
      relations: ['owner'],
      where: { status: E_OrderStatus.Draft, owner: { id: user.id } },
      select: {
        owner: {
          id: true,
          name: true,
        },
      },
    } as FindOneOptions<Order>);

    const rawItems = await this.orderItemRepository.find({
      relations: ['item'],
      where: { orderId: order.id },
    });

    const items = rawItems.map((rawItem) => ({
      count: rawItem.count,
      ...rawItem.item,
    }));

    return { ...order, items };
  }

  public async createOrder() {
    const newOrder = this.orderRepository.create();
    newOrder.created_date = new Date();
    return await this.orderRepository.save(newOrder);
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
