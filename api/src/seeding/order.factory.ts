import { setSeederFactory } from 'typeorm-extension';
import { Order } from '@entities/order/models/order.entity';
import { faker } from '@faker-js/faker';
import { E_OrderStatus } from '@entities/order/models/types';

export const OrderFactory = setSeederFactory(Order, () => {
  const order = new Order();
  order.status = faker.helpers.arrayElement([
    E_OrderStatus.InWork,
    E_OrderStatus.Rejected,
    E_OrderStatus.Deleted,
    E_OrderStatus.Completed,
  ]);
  order.created_date = faker.date.past();

  if (order.status == E_OrderStatus.InWork) {
    order.formation_date = faker.date.past();
  }

  if (
    order.status == E_OrderStatus.Completed ||
    order.status == E_OrderStatus.Rejected
  ) {
    order.formation_date = faker.date.past();
    order.complete_date = faker.date.past({ refDate: order.formation_date });
  }

  return order;
});
