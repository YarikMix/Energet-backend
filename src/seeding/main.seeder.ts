import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Item } from '@entities/items/models/item.entity';
import { User } from '@entities/user/models/user.entity';
import { Order } from '@entities/order/models/order.entity';
import { OrderItem } from '@entities/order/models/order-item.entity';
import { faker } from '@faker-js/faker';
import { E_OrderStatus } from '@entities/order/models/types';
import { E_UserType } from '@entities/user/models/types';

export class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const { users, producers } = await this.generateUsers(factoryManager);

    const items = await this.generateItems(
      factoryManager,
      dataSource,
      producers,
    );

    await this.generateOrders(factoryManager, dataSource, users, items);
  }

  generateUsers = async (
    factoryManager,
  ): Promise<{ users: User[]; producers: User[] }> => {
    console.log('seeding users');
    const userFactory = factoryManager.get(User);

    // Создаем покупателей
    const users = await userFactory.saveMany(10);

    // Создаем поставщиков
    const producers = await userFactory.saveMany(5, {
      role: E_UserType.Producer,
    });

    // Создаем модераторов
    await userFactory.saveMany(3, {
      role: E_UserType.Moderator,
    });

    return { users, producers };
  };

  generateItems = async (
    factoryManager: SeederFactoryManager,
    dataSource: DataSource,
    producers: User[],
  ): Promise<Item[]> => {
    console.log('seeding items');
    const itemFactory = factoryManager.get(Item);
    const itemsRepo = dataSource.getRepository(Item);
    const items = await Promise.all(
      Array(10)
        .fill('')
        .map(async () => {
          return await itemFactory.make({
            owner: faker.helpers.arrayElement(producers),
          });
        }),
    );
    return await itemsRepo.save(items);
  };

  generateOrders = async (
    factoryManager: SeederFactoryManager,
    dataSource: DataSource,
    users: User[],
    items: Item[],
  ) => {
    console.log('seeding orders');
    const ordersRepo = dataSource.getRepository(Order);
    const orderFactory = factoryManager.get(Order);

    await Promise.all(
      users.map(async (user) => {
        // Создаем черновые заказы покупателю
        await orderFactory.save({
          owner: user,
          status: E_OrderStatus.Draft,
        });

        // Создаем остальные заказы покупателю
        const orders = await Promise.all(
          Array(3)
            .fill('')
            .map(async () => {
              return await orderFactory.make({
                owner: user,
              });
            }),
        );
        await ordersRepo.save(orders);

        // Наполняем заказы оборудованием
        const orderItemFactory = factoryManager.get(OrderItem);
        await Promise.all(
          orders.map(async (order) => {
            const orderItems = faker.helpers.arrayElements(items, 3);
            await Promise.all(
              orderItems.map(async (item) => {
                await orderItemFactory.save({
                  orderId: order.id,
                  itemId: item.id,
                });
              }),
            );
          }),
        );
      }),
    );
  };
}
