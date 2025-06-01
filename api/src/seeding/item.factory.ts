import { ItemProducer } from '@entities/items/models/item-producer.entity';
import { ItemType } from '@entities/items/models/item-type.entity';
import { Item } from '@entities/items/models/item.entity';
import { E_ItemStatus } from '@entities/items/models/types';
import { faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';

export const ItemFactory = setSeederFactory(Item, () => {
  const item = new Item();
  item.name = faker.vehicle.model();
  item.weight = faker.helpers.rangeToNumber({ min: 1, max: 100 });
  item.status = E_ItemStatus.Created;
  item.warehouse_count = faker.helpers.rangeToNumber({ min: 10, max: 50 });
  return item;
});

export const ItemTypeFactory = setSeederFactory(ItemType, () => {
  return new ItemType();
});

export const ItemProducerFactory = setSeederFactory(ItemProducer, () => {
  return new ItemProducer();
});
