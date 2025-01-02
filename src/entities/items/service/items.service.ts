import { Injectable } from '@nestjs/common';
import { CreateItemDto } from '../dto/createItem.dto';
import { UpdateItemDto } from '../dto/updateItem.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '@entities/items/models/item.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async findAll() {
    return await this.itemRepository.find();
  }

  async findOne(id: number) {
    return await this.itemRepository.find({
      where: { id },
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
}
