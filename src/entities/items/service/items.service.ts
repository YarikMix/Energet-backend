import { Injectable } from '@nestjs/common';
import { CreateItemDto } from '../dto/createItem.dto';
import { UpdateItemDto } from '../dto/updateItem.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '@entities/items/models/item.entity';
import { OrderItem } from '@entities/order/models/order-item.entity';
import { Order } from '@entities/order/models/order.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async findAll() {
    return await this.itemRepository.find({
      relations: ['owner'],
      loadRelationIds: true,
    });
  }

  async findOne(id: number) {
    return await this.itemRepository.find({
      where: { id },
      relations: ['owner'],
      loadRelationIds: true,
    });
  }

  async remove(id: number) {
    return await this.itemRepository.delete(id);
  }

  async update(id: number, updateItemDto: UpdateItemDto) {
    return await this.itemRepository.update({ id }, updateItemDto);
  }

  async create(createItemDto: CreateItemDto) {
    const newItem = this.itemRepository.create(createItemDto);
    return await this.itemRepository.save(newItem);
  }

  async addItemTodOrder(itemId: number, orderId: number) {
    const orderItem = await this.orderItemRepository.create({
      orderId: orderId,
      itemId: itemId,
    });

    await this.orderItemRepository.save(orderItem);

    const data = await this.orderRepository.findOne({
      where: {
        id: orderId,
      },
    });

    const itemsIds = await this.orderItemRepository.find({
      where: {
        orderId: orderId,
      },
      select: {
        itemId: true,
      },
    });

    const items = [];

    for (const item of itemsIds) {
      const itemData = await this.itemRepository.findOne({
        where: {
          id: item.itemId,
        },
      });
      items.push(itemData);
    }

    return { ...data, items };
  }

  async deleteItemFromOrder(itemId: number, orderId: number) {
    await this.orderItemRepository.delete({
      orderId: orderId,
      itemId: itemId,
    });

    const data = await this.orderRepository.findOne({
      where: {
        id: orderId,
      },
    });

    const itemsIds = await this.orderItemRepository.find({
      where: {
        orderId: orderId,
      },
      select: {
        itemId: true,
      },
    });

    const items = [];

    for (const item of itemsIds) {
      const itemData = await this.itemRepository.findOne({
        where: {
          id: item.itemId,
        },
      });
      items.push(itemData);
    }

    return { ...data, items };
  }
}
