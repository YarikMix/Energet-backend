import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Item } from '@entities/items/models/item.entity';
import { User } from '@entities/user/models/user.entity';
import { Order } from '@entities/order/models/order.entity';
import { OrderItem } from '@entities/order/models/order-item.entity';
import { faker } from '@faker-js/faker';
import { E_OrderStatus } from '@entities/order/models/types';
import { E_UserType } from '@entities/user/models/types';
import { MinioService } from '@services/minio/minio.service';
import { ItemType } from '@entities/items/models/item-type.entity';
import { ItemProducer } from '@entities/items/models/item-producer.entity';

const ITEMS_COUNT = 51;
const ITEMS_IN_ORDER_COUNT = 3;
const USERS_COUNT = 10;
const MODERATORS_COUNT = 3;
const PRODUCERS_COUNT = 5;
const USER_ORDERS_COUNT = 3;

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
    const users = await userFactory.saveMany(USERS_COUNT);

    // Создаем поставщиков
    const producers = await userFactory.saveMany(PRODUCERS_COUNT, {
      role: E_UserType.Producer,
    });

    // Создаем модераторов
    await userFactory.saveMany(MODERATORS_COUNT, {
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
    const itemsTypeRepo = dataSource.getRepository(ItemType);
    const itemsProducerRepo = dataSource.getRepository(ItemProducer);

    let itemsTypes = ['Аккамулятор', 'Солнечная панель', 'Турбина'].map(
      (name) => {
        const itemType = new ItemType();
        itemType.name = name;
        return itemType;
      },
    );
    itemsTypes = await itemsTypeRepo.save(itemsTypes);

    let itemProducers = ['asdf', 'sdfasdf', 'asd234r'].map((name) => {
      const itemProducer = new ItemProducer();
      itemProducer.name = name;
      return itemProducer;
    });
    itemProducers = await itemsProducerRepo.save(itemProducers);

    const images = ['1.jpg', '2.jpg', '3.jpg', '4.jpg'];

    const items = await Promise.all(
      Array(ITEMS_COUNT)
        .fill('')
        .map(async () => {
          return await itemFactory.make({
            image:
              'http://localhost:9000/images/items/' +
              faker.helpers.arrayElement(images),
            owner: faker.helpers.arrayElement(producers),
            item_type: faker.helpers.arrayElement(itemsTypes),
            item_producer: faker.helpers.arrayElement(itemProducers),
          });
        }),
    );

    const minio = new MinioService();
    await minio.uploadLocalFile('items', 'default.jpg', 'src/assets/1.jpg');
    await Promise.all(
      images.map(
        async (image) =>
          await minio.uploadLocalFile('items', image, 'src/assets/1.jpg'),
      ),
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
          Array(USER_ORDERS_COUNT)
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
            const orderItems = faker.helpers.arrayElements(
              items,
              ITEMS_IN_ORDER_COUNT,
            );
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
