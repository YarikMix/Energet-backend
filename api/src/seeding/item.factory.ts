import { setSeederFactory } from 'typeorm-extension';
import { Item } from '@entities/items/models/item.entity';
import { E_ItemStatus, E_ItemType } from '@entities/items/models/types';
import { faker } from '@faker-js/faker';

export const ItemFactory = setSeederFactory(Item, () => {
  const item = new Item();
  item.name = faker.vehicle.model();
  item.price = faker.helpers.rangeToNumber({ min: 100, max: 1000 });
  item.status = E_ItemStatus.Confirmed;
  item.type = faker.helpers.enumValue(E_ItemType);
  return item;
});
