import { Favourite } from '@entities/favourite/models/favourite.entity';
import { Item } from '@entities/items/models/item.entity';
import { UpdateOrderDto } from '@entities/order/dto/updateOrder.dto';
import { UpdateOrderItemCountDto } from '@entities/order/dto/updateOrderItemCount.dto';
import { OrderItem } from '@entities/order/models/order-item.entity';
import { Order } from '@entities/order/models/order.entity';
import { E_OrderStatus } from '@entities/order/models/types';
import { E_UserType } from '@entities/user/models/types';
import { User } from '@entities/user/models/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  And,
  Equal,
  FindManyOptions,
  FindOneOptions,
  In,
  Not,
  Repository,
} from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Favourite)
    private readonly favouriteRepository: Repository<Favourite>,
  ) {}

  public async getOrders(userId: number, status?: string) {
    // TODO: FindOptionsWhere<Order>
    const filters: any = {
      status: And(
        Not(Equal(E_OrderStatus.Deleted)),
        Not(Equal(E_OrderStatus.Draft)),
      ),
    };

    if (status) {
      filters.status = Equal(status);
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (user.role == E_UserType.Buyer) {
      filters.owner = { id: userId };
    }

    const orders = await this.orderRepository.find({
      relations: ['owner'],
      where: filters,
      select: {
        owner: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      order: {
        // formation_date: 'DESC',
        id: 'ASC',
      },
    } as FindOneOptions<Order>);

    return await Promise.all(
      orders.map(async (order) => {
        return {
          ...order,
          price: await this.calculationTotalPrice(order),
        };
      }),
    );
  }

  async getOrder(id: number, userId?: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['owner'],
      select: {
        owner: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    } as FindOneOptions<Order>);

    const rawItems = await this.orderItemRepository.find({
      relations: ['item'],
      where: { orderId: id },
    });
    let items = rawItems.map((rawItem) => ({
      count: rawItem.count,
      ...rawItem.item,
    }));

    if (userId) {
      items = await Promise.all(
        items.map(async (item) => {
          const favourite = await this.favouriteRepository.exists({
            where: {
              itemId: item.id,
              ownerId: userId,
            },
          });

          return {
            ...item,
            favourite,
          };
        }),
      );
    }

    return { ...order, items, price: await this.calculationTotalPrice(order) };
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
      relations: {
        item: true,
      },
      where: { orderId: order.id },
      order: {
        created_date: 'ASC',
      },
    } as FindManyOptions<OrderItem>);

    const items = await Promise.all(
      rawItems.map(async (rawItem) => {
        const favourite = await this.favouriteRepository.exists({
          where: {
            itemId: rawItem.item.id,
            ownerId: userId,
          },
        });

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
    return await this.orderRepository.save(newOrder);
  }

  public async deleteOrder(id: number) {
    return await this.orderRepository.delete(id);
  }

  public async updateOrder(id: number, updateOrderDto: UpdateOrderDto) {
    if (
      updateOrderDto.status == E_OrderStatus.Completed ||
      updateOrderDto.status == E_OrderStatus.Rejected
    ) {
      await this.orderRepository.update(
        { id },
        {
          complete_date: new Date(),
        },
      );
    }
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

  public async removeItemsFromOrder(order_id: number, items: number[]) {
    return await this.orderItemRepository.delete({
      orderId: order_id,
      itemId: In(items),
    });
  }

  public async addItemToOrder(order_id: number, item_id: number) {
    const item = this.orderItemRepository.create({
      orderId: order_id,
      itemId: item_id,
      created_date: new Date(),
    });

    return await this.orderItemRepository.save(item);
  }

  public async updateOrderStatusUser(id: number) {
    const orderItems = await this.orderItemRepository.find({
      relations: {
        item: true,
      },
      where: { orderId: id },
    } as FindManyOptions<OrderItem>);

    for (const orderItem of orderItems) {
      await this.itemRepository.update(orderItem.itemId, {
        warehouse_count: orderItem.item.warehouse_count - orderItem.count,
      });
    }

    return await this.orderRepository.update(
      { id },
      { status: E_OrderStatus.InWork, formation_date: new Date() },
    );
  }

  public async addItemsToOrder(order_id: number, items) {
    for (const i of items) {
      const isExists = await this.orderItemRepository.exists({
        where: {
          orderId: order_id,
          itemId: i.id,
        },
      });

      if (isExists) {
        const item = await this.orderItemRepository.findOne({
          where: {
            orderId: order_id,
            itemId: i.id,
          },
        });

        await this.orderItemRepository.update(
          { orderId: order_id, itemId: i.id },
          { count: item.count + i.count },
        );
      } else {
        const item = this.orderItemRepository.create({
          orderId: order_id,
          itemId: i.id,
          count: i.count,
          created_date: new Date(),
        });

        await this.orderItemRepository.save(item);
      }
    }
  }

  calculationTotalPrice = async (order) => {
    const query = await this.orderRepository
      .createQueryBuilder('order')
      .select()
      .where('order.owner = :userId AND order.id = :orderId', {
        userId: order.owner.id,
        orderId: order.id,
      })
      .leftJoinAndSelect(OrderItem, 'mm', 'mm.orderId = order.id')
      .leftJoinAndSelect(Item, 'item', 'mm.itemId = item.id')
      .select('SUM(mm.count * item.price)')
      .getRawOne();

    return parseInt(query.sum);
  };
}
