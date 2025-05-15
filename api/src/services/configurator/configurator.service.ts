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
        this.httpService.post('http://configurator:5000/api/optim/', {
          ...body,
          Econ: {
            ElCost: 8,
            Disc_Rate: 0.2,
            Lifetime: 25,
          },
          OptTarget: {
            target: 'Надежность энергоснабжения (минимизация LCOE)',
            value: 0.9,
            d_target: 0.02,
          },
          Additions: {
            pitch: 100,
            shading: [],
            WTorient: 22,
            WTheight: 10,
            gamma: [0],
            betta: [30],
            AB_place: 'Дом',
            bPV: 0,
          },
          Options: {
            N_steps: 10,
            step: 0.3333,
            Test: 0,
            Zero_S: 0,
          },
          Optimisator_Version: 2,
        }),
      );

      console.log('data', data);

      if (!data) {
        return null;
      }

      const vars = data['Vars'];
      if (!vars) {
        return null;
      }

      console.log('vars', vars);

      const result = {
        total_price: 0,
        items: [],
      };

      const solarPower = Math.floor(vars[0]);
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

        console.log('calculateItemCategory');
        console.log('item_category', item_category);

        let result;

        const items = await this.itemRepository.find({
          relations: ['item_type'],
          where: {
            item_type: {
              id: item_category,
            },
          },
        } as FindOneOptions<Item>);

        console.log('items[0]', items[0]);

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
          power: vars[0],
          id: 3,
        },
        {
          power: vars[1],
          id: 4,
        },
        {
          power: vars[2],
          id: 5,
        },
        {
          power: vars[3],
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

      return {
        ...result,
        params: {
          RPS: data.RPS?.toFixed(2),
          LCOE: data.LCOE?.toFixed(2),
          CapEx: data.CapEx?.toFixed(2),
          OpEx: data.OpEx?.toFixed(2),
          Economy: data.Economy?.toFixed(2),
          NPV: data.NPV?.toFixed(2),
        },
      };
    } catch {
      return null;
    }
  }
}
