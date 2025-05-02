import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from '@entities/items/models/item.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { findOptimalCombinationUnbounded } from '../../utils/optimum';

@Injectable()
export class ConfiguratorService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    private readonly httpService: HttpService,
  ) {}

  async calc(body) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post('http://configurator:5000/api/optim/', body),
      );

      if (!data) {
        return null;
      }

      const result = {
        total_price: 0,
        items: [],
      };

      const solarPower = Math.floor(data[0]);
      if (solarPower > 0) {
        const invertor_items = await this.itemRepository.find({
          relations: ['item_type'],
          where: {
            item_type: {
              id: 1,
            },
          },
        } as FindOneOptions<Item>);

        const maxInvertorPower = solarPower / 1.1;

        let min_invertor_price = Infinity;
        let min_invertor_count;
        let min_invertor_item;

        for (const item of invertor_items) {
          const count = Math.ceil(maxInvertorPower / item.power);
          const total_price = item.price * count;

          if (total_price < min_invertor_price) {
            min_invertor_count = count;
            min_invertor_price = total_price;
            min_invertor_item = item;
          }
        }

        result.items.push({ ...min_invertor_item, count: min_invertor_count });
        result.total_price += min_invertor_price;
      }

      const calculateItemCategory = async (item_category, power) => {
        if (!power) {
          return;
        }

        let result;

        const items = await this.itemRepository.find({
          relations: ['item_type'],
          where: {
            item_type: {
              id: item_category,
            },
          },
        } as FindOneOptions<Item>);

        const optimal_items = findOptimalCombinationUnbounded(
          items,
          Math.floor(power),
        );

        if (optimal_items.length > 0) {
          result = {
            total_price: optimal_items.reduce((acc, cur) => acc + cur.price, 0),
            items: optimal_items,
          };
        } else {
          const min_item = await this.itemRepository.findOne({
            relations: ['item_type'],
            order: {
              price: 'ASC',
            },
            where: {
              item_type: {
                id: item_category,
              },
            },
          } as FindOneOptions<Item>);

          result = {
            total_price: min_item.price,
            items: [{ ...min_item, count: 1 }],
          };
        }

        return result;
      };

      const categories = [
        {
          power: data[0],
          id: 3,
        },
        {
          power: data[1],
          id: 4,
        },
        {
          power: data[2],
          id: 5,
        },
        {
          power: data[3],
          id: 6,
        },
      ];

      for (const category of categories) {
        const optimalKit = await calculateItemCategory(
          category.id,
          category.power,
        );

        if (optimalKit) {
          result.total_price += optimalKit.total_price;
          result.items.push(...optimalKit.items);
        }
      }

      return result;
    } catch {
      return null;
    }
  }
}
