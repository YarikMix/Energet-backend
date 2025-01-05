import { setSeederFactory } from 'typeorm-extension';
import { Item } from '@entities/items/models/item.entity';
import { E_ItemStatus } from '@entities/items/models/types';
import { Faker } from '@faker-js/faker';

export const ItemFactory = setSeederFactory(Item, (faker: Faker) => {
  const item = new Item();
  item.name = faker.vehicle.model();
  item.price = faker.helpers.rangeToNumber({ min: 100, max: 1000 });
  item.status = E_ItemStatus.Confirmed;
  return item;
});
