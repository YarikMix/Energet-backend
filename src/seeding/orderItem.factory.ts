import { setSeederFactory } from 'typeorm-extension';
import { OrderItem } from '@entities/order/models/order-item.entity';
import { Faker } from '@faker-js/faker';

export const OrderItemFactory = setSeederFactory(OrderItem, (faker: Faker) => {
  const orderItem = new OrderItem();
  orderItem.count = faker.helpers.rangeToNumber({ min: 1, max: 10 });
  return orderItem;
});
