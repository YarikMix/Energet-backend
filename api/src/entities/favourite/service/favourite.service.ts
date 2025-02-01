import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from '@entities/items/models/item.entity';
import { FindOneOptions, ILike, In, Repository } from 'typeorm';
import { ItemType } from '@entities/items/models/item-type.entity';
import { PaginationDto } from '@entities/items/dto/pagination.dto';
import { ItemsFiltersDto } from '@entities/items/dto/filters.dto';
import { isNumeric } from '../../../utils/helpers';
import { User } from '@entities/user/models/user.entity';

@Injectable()
export class FavouriteService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(ItemType)
    private readonly favouriteRepository: Repository<ItemType>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async search({
    name,
    types,
    producers,
    userId,
  }: PaginationDto & ItemsFiltersDto & { userId: number }) {
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

    return user.items.map((item) => {
      return {
        ...item,
        favourite: true,
      };
    });
  }
}
