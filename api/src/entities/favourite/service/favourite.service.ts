import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from '@entities/items/models/item.entity';
import { FindManyOptions, Repository } from 'typeorm';
import { PaginationDto } from '@entities/items/dto/pagination.dto';
import { ItemsFiltersDto } from '@entities/items/dto/filters.dto';
import { isNumeric } from '../../../utils/helpers';
import { Favourite } from '@entities/favourite/models/favourite.entity';

@Injectable()
export class FavouriteService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Favourite)
    private readonly favouriteRepository: Repository<Favourite>,
  ) {}

  async search({
    name,
    types,
    producers,
    userId,
  }: PaginationDto & ItemsFiltersDto & { userId: number }) {
    const favourites = await this.favouriteRepository.find({
      relations: {
        item: {
          owner: true,
          item_type: true,
          item_producer: true,
        },
      },
      select: {
        owner: {
          id: true,
          name: true,
        },
      },
      where: { ownerId: userId },
      order: {
        created_date: 'ASC',
      },
    } as FindManyOptions<Favourite>);

    let items = favourites.map((favourite) => {
      return {
        ...favourite.item,
        favourite: true,
      };
    });

    if (name) {
      items = items.filter((item) => {
        return item.name.toLowerCase().includes(name);
      });
    }

    if (types) {
      if (isNumeric(types)) {
        items = items.filter((item) => {
          return item.item_type.id == parseInt(types);
        });
      } else if (types.split(',').length > 1) {
        items = items.filter((item) => {
          return types
            .split(',')
            .map((i) => parseInt(i))
            .includes(item.item_type.id);
        });
      }
    }

    if (producers) {
      if (isNumeric(producers)) {
        items = items.filter((item) => {
          return item.item_producer.id == parseInt(producers);
        });
      } else if (producers.split(',').length > 1) {
        items = items.filter((item) => {
          return producers
            .split(',')
            .map((i) => parseInt(i))
            .includes(item.item_producer.id);
        });
      }
    }

    return items;
  }
}
