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
import { Favourite } from '@entities/favourite/models/favourite.entity';
import { generateRandomFloat } from '../utils/helpers';
import { Logger } from '@nestjs/common';

const ITEMS_COUNT = 51;
const ITEMS_IN_ORDER_COUNT = 3;
const USERS_COUNT = 10;
const MODERATORS_COUNT = 3;
const PRODUCERS_COUNT = 5;
const USER_ORDERS_COUNT = 3;
const FAVOURITES_FOR_USER_COUNT = 5;

export class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const { users, producers } = await this.generateUsers(
      factoryManager,
      dataSource,
    );

    const items = await this.generateItems(
      factoryManager,
      dataSource,
      producers,
    );

    // await this.generateFavourites(factoryManager, dataSource, users, items);

    // await this.generateOrders(factoryManager, dataSource, users, items);
  }

  generateFavourites = async (
    factoryManager: SeederFactoryManager,
    dataSource: DataSource,
    users: User[],
    items: Item[],
  ) => {
    console.log('seeding favourites');

    const favouritesRepo = dataSource.getRepository(Favourite);
    const favouriteFactory = factoryManager.get(Favourite);

    await Promise.all(
      users.map(async (user) => {
        const randomItems = faker.helpers.arrayElements(
          items,
          FAVOURITES_FOR_USER_COUNT,
        );

        const favourites = await Promise.all(
          randomItems.map(async (item) => {
            return await favouriteFactory.make({
              itemId: item.id,
              ownerId: user.id,
            });
          }),
        );

        await favouritesRepo.save(favourites);
      }),
    );
  };

  generateUsers = async (
    factoryManager: SeederFactoryManager,
    dataSource: DataSource,
  ): Promise<{ users: User[]; producers: User[] }> => {
    console.log('seeding users');
    const userFactory = factoryManager.get(User);
    const usersRepo = dataSource.getRepository(User);

    const testUser = await userFactory.make({
      email: 'user@user.com',
    });
    await usersRepo.save(testUser);

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

    return { users: [testUser, ...users], producers };
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
    const itemsTypeFactory = factoryManager.get(ItemType);
    const itemsProducerRepo = dataSource.getRepository(ItemProducer);

    let itemsTypes = await Promise.all(
      [
        'Инвертор',
        'Аккумулятор',
        'Солнечная панель',
        'Ветрогенератор',
        'Дизель',
        'Генераторная установка',
      ].map(async (name) => {
        return await itemsTypeFactory.make({
          name,
        });
      }),
    );
    itemsTypes = await itemsTypeRepo.save(itemsTypes);

    const logger = new Logger('HTTPS');
    logger.log('itemsTypes.length: ' + itemsTypes.length);

    for (const itemType of itemsTypes) {
      console.log('itemType(' + itemType.id + '): ' + itemType.name);
    }

    logger.log('itemsTypes[0]: ' + itemsTypes[0].name);
    logger.log('itemsTypes[1]: ' + itemsTypes[1].name);
    logger.log('itemsTypes[2]: ' + itemsTypes[2].name);
    logger.log('itemsTypes[3]: ' + itemsTypes[3].name);
    logger.log(
      'itemsTypes[4]: ' + itemsTypes[4].name + ' id(' + itemsTypes[4].id + ')',
    );
    logger.log('itemsTypes[5]: ' + itemsTypes[5].name);

    let itemProducers = [
      'Hevel',
      'ROSVETRO',
      'Sila',
      'SilaSolar',
      'SunStonePower',
    ].map((name) => {
      const itemProducer = new ItemProducer();
      itemProducer.name = name;
      return itemProducer;
    });
    itemProducers = await itemsProducerRepo.save(itemProducers);

    const solarPanelPowerRange = [
      ...Array.from({ length: 7 }, (_, i) => 360 + i * 5),
      ...Array.from({ length: 8 }, (_, i) => 460 + i * 5),
    ]; // Самые распространенные 360-390, 460-495 с шагом 5

    const items = await Promise.all(
      Array(ITEMS_COUNT)
        .fill('')
        .map(async () => {
          const item = await itemFactory.make({
            owner: faker.helpers.arrayElement(producers),
            itemTypeId: 5,
            item_producer: faker.helpers.arrayElement(itemProducers),
          });

          console.log('item', item.itemTypeId);
          console.log(
            'item.item_type == undefined',
            item.item_type == undefined,
          );

          if (item.itemTypeId == 1) {
            item.power = 500 * faker.helpers.rangeToNumber({ min: 1, max: 10 });
            item.price = Math.round(
              1000 * (item.power / 5000) * generateRandomFloat(0.9, 1.1),
            );
            item.image =
              'http://localhost:9000/images/items/' +
              faker.helpers.rangeToNumber({ min: 1, max: 4 }) +
              '.png';
          } else if (item.itemTypeId == 2) {
            item.power = 500 * faker.helpers.rangeToNumber({ min: 1, max: 4 });
          } else if ((item.itemTypeId = 3)) {
            item.power = faker.helpers.arrayElement(solarPanelPowerRange);
            item.price = Math.round(
              1000 * (item.power / 490) * generateRandomFloat(0.9, 1.1),
            );
            item.image =
              'http://localhost:9000/images/items/' +
              faker.helpers.rangeToNumber({ min: 5, max: 8 }) +
              '.png';
          } else if (item.itemTypeId == 4) {
            item.power = 500 * faker.helpers.rangeToNumber({ min: 1, max: 8 });
          } else if (item.itemTypeId == 5) {
            item.power = 1000 * faker.helpers.rangeToNumber({ min: 1, max: 5 });
          } else if (item.itemTypeId == 6) {
            item.power = 1000 * faker.helpers.rangeToNumber({ min: 1, max: 5 });
          }

          return item;
        }),
    );

    const minio = new MinioService();
    await minio.uploadLocalFile(
      'items',
      'default.png',
      'src/assets/default.png',
    );

    await Promise.all(
      Array(4)
        .fill(null)
        .map((_, i) => i + 1)
        .map(async (i) => {
          const serverImageName = i + '.png';
          const localImageName = i + '.png';
          return await minio.uploadLocalFile(
            'items',
            serverImageName,
            'src/assets/invertor/' + localImageName,
          );
        }),
    );

    await Promise.all(
      Array(4)
        .fill(null)
        .map((_, i) => i + 1)
        .map(async (i) => {
          const serverImageName = i + 4 + '.png';
          const localImageName = i + '.png';
          return await minio.uploadLocalFile(
            'items',
            serverImageName,
            'src/assets/solar/' + localImageName,
          );
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
        const draftOrder = await orderFactory.save({
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
          [draftOrder, ...orders].map(async (order) => {
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
