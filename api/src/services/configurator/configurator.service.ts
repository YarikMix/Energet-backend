import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from '@entities/items/models/item.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

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

      if (data[0] != 0) {
        const solarPower = data[0];
        const invertorPower = solarPower / 1.1;
        // console.log('solarPower', solarPower);
        // console.log('invertorPower', invertorPower);

        const solar_items = await this.itemRepository.find({
          relations: ['item_type'],
          where: {
            item_type: {
              id: 3,
            },
          },
        } as FindOneOptions<Item>);

        let min_solar_price = Number.MAX_VALUE;
        let min_solar_count;
        let min_solar_item;

        for (const item of solar_items) {
          const count = Math.ceil(solarPower / item.power);
          const total_price = item.price * count;

          if (total_price < min_solar_price) {
            min_solar_count = count;
            min_solar_price = total_price;
            min_solar_item = item;
          }
        }

        // console.log('min_solar_price', min_solar_price);
        // console.log('min_solar_count', min_solar_count);
        // console.log(min_solar_item);

        const invertor_items = await this.itemRepository.find({
          relations: ['item_type'],
          where: {
            item_type: {
              id: 1,
            },
          },
        } as FindOneOptions<Item>);

        // console.log('invertor_items', invertor_items);

        let min_invertor_price = Number.MAX_VALUE;
        let min_invertor_count;
        let min_invertor_item;

        for (const item of invertor_items) {
          const count = Math.ceil(invertorPower / item.power);
          const total_price = item.price * count;

          if (total_price < min_solar_price) {
            min_invertor_count = count;
            min_invertor_price = total_price;
            min_invertor_item = item;
          }
        }

        // console.log('min_invertor_price', min_invertor_price);
        // console.log('min_invertor_count', min_invertor_count);
        // console.log(min_invertor_item);

        const items = [
          {
            // item: min_solar_item,
            item: faker.helpers.arrayElement(solar_items),
            total_count: min_solar_count,
            total_price: min_solar_price,
          },
          {
            // item: min_invertor_item,
            item: faker.helpers.arrayElement(invertor_items),
            total_count: min_invertor_count,
            total_price: min_invertor_price,
          },
        ];

        return {
          price: items.reduce((acc, cur) => acc + cur.total_price, 0),
          items,
        };
      }

      return data;
    } catch {
      return null;
    }
  }
}
