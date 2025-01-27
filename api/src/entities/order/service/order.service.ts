import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Order } from '@entities/order/models/order.entity';
import { UpdateOrderDto } from '@entities/order/dto/updateOrder.dto';
import { OrderItem } from '@entities/order/models/order-item.entity';
import { User } from '@entities/user/models/user.entity';
import { E_OrderStatus } from '@entities/order/models/types';

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
    const items = await this.orderItemRepository.find({
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
}
