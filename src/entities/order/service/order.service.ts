import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '@entities/order/models/order.entity';
import { UpdateOrderDto } from '@entities/order/dto/updateOrder.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  public async getOrders() {
    return await this.orderRepository.find();
  }

  async getOrder(id: number) {
    return await this.orderRepository.findOne({
      where: { id },
    });
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
