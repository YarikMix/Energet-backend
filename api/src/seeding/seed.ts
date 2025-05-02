import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import pgConfig from '../db/db.config';
import { MainSeeder } from './main.seeder';
import * as process from 'process';
import { UserFactory } from './user.factory';
import { OrderFactory } from './order.factory';
import {
  ItemFactory,
  ItemProducerFactory,
  ItemTypeFactory,
} from './item.factory';
import { OrderItemFactory } from './orderItem.factory';
import { FavouriteFactory } from './favourite.factory';
import { DraftFactory } from './draft.factory';

const options: DataSourceOptions & SeederOptions = {
  ...pgConfig(),
  factories: [
    UserFactory,
    OrderFactory,
    ItemFactory,
    OrderItemFactory,
    FavouriteFactory,
    ItemTypeFactory,
    DraftFactory,
    ItemProducerFactory,
  ],
  seeds: [MainSeeder],
};

const datasource = new DataSource(options);
datasource.initialize().then(async () => {
  await datasource.synchronize(true);
  await runSeeders(datasource);
  process.exit();
});
