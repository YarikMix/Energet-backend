import * as process from 'process';
import { DataSource, DataSourceOptions } from 'typeorm';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import pgConfig from '../db/db.config';
import { DraftFactory } from './draft.factory';
import { FavouriteFactory } from './favourite.factory';
import {
  ItemFactory,
  ItemProducerFactory,
  ItemTypeFactory,
} from './item.factory';
import { MainSeeder } from './main.seeder';
import { OrderFactory } from './order.factory';
import { OrderItemFactory } from './orderItem.factory';
import { UserFactory } from './user.factory';

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
