import { Injectable } from '@nestjs/common';
import { CreateItemDto } from '../dto/createItem.dto';
import { UpdateItemDto } from '../dto/updateItem.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Item } from '@entities/items/models/item.entity';
import { OrderItem } from '@entities/order/models/order-item.entity';
import { Order } from '@entities/order/models/order.entity';
import { ItemType } from '@entities/items/models/item-type.entity';
import { ItemProducer } from '@entities/items/models/item-producer.entity';
import { isNumeric } from '../../../utils/helpers';
import { PaginationDto } from '@entities/items/dto/pagination.dto';
import { ItemsFiltersDto } from '@entities/items/dto/filters.dto';
import { DEFAULT_PAGE_SIZE } from '../../../utils/constants';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(ItemType)
    private readonly itemTypeRepository: Repository<ItemType>,
    @InjectRepository(ItemProducer)
    private readonly itemProducerRepository: Repository<ItemProducer>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  async search({
    name,
    types,
    producers,
    offset,
    limit,
  }: PaginationDto & ItemsFiltersDto) {
    const filters = {};

    if (name) {
      filters['name'] = ILike(`%${name}%`);
    }

    if (types) {
      if (isNumeric(types)) {
        filters['item_type'] = {
          id: parseInt(types),
        };
      } else if (types.split(',').length > 1) {
        filters['item_type'] = In(types.split(',').map((i) => parseInt(i)));
      }
    }

    if (producers) {
      if (isNumeric(producers)) {
        filters['item_producer'] = {
          id: parseInt(producers),
        };
      } else if (producers.split(',').length > 1) {
        filters['item_producer'] = In(
          producers.split(',').map((i) => parseInt(i)),
        );
      }
    }

    const items = await this.itemRepository.find({
      relations: ['owner', 'item_type', 'item_producer'],
      select: {
        owner: {
          id: true,
          name: true,
        },
      },
      where: filters,
      skip: offset,
      take: limit ?? DEFAULT_PAGE_SIZE,
    });

    const totalCount = await this.itemRepository.count({ where: filters });

    return {
      items,
      total_pages: Math.ceil(totalCount / DEFAULT_PAGE_SIZE),
    };
  }

  async findOne(id: number) {
    return await this.itemRepository.findOne({
      where: { id },
      select: {
        owner: {
          id: true,
          name: true,
        },
      },
      relations: ['owner', 'item_type', 'item_producer'],
    });
  }

  async findTypes() {
    return await this.itemTypeRepository.find();
  }

  async findProducers() {
    return await this.itemProducerRepository.find();
  }

  async remove(id: number) {
    return await this.itemRepository.delete(id);
  }

  async update(id: number, updateItemDto: UpdateItemDto) {
    return await this.itemRepository.update({ id }, updateItemDto);
  }

  async create(createItemDto: CreateItemDto, fileName?: string) {
    const itemData = this.itemRepository.create(createItemDto);

    const item = await this.itemRepository.save(itemData);

    if (fileName) {
      item.image = `http://localhost:9000/images/items/${item.id}/${fileName}`;
    }

    return item;
  }

  async updateImage(itemId: number, fileName?: string) {
    return await this.itemRepository.update(itemId, {
      image: `http://localhost:9000/images/items/${itemId}/${fileName}`,
    });
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
