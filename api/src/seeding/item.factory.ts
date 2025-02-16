import { setSeederFactory } from 'typeorm-extension';
import { Item } from '@entities/items/models/item.entity';
import { E_ItemStatus } from '@entities/items/models/types';
import { faker } from '@faker-js/faker';
import { ItemType } from '@entities/items/models/item-type.entity';

export const ItemFactory = setSeederFactory(Item, () => {
  const item = new Item();
  item.name = faker.vehicle.model();
  item.weight = faker.helpers.rangeToNumber({ min: 1, max: 100 });
  item.status = E_ItemStatus.Confirmed;
  return item;
});

export const ItemTypeFactory = setSeederFactory(ItemType, () => {
  return new ItemType();
});
