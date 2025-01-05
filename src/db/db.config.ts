import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { registerAs } from '@nestjs/config';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: process.cwd() + '/.env' });

export default registerAs(
  'dbconfig.dev',
  (): PostgresConnectionOptions => ({
    type: 'postgres',
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    synchronize: true,
    entities: [
      path.resolve(__dirname, '..') + '/**/**/models/*.entity{.ts,.js}',
    ],
  }),
);
