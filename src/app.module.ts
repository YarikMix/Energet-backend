import { Module } from '@nestjs/common';
import { UserModule } from '@entities/user/user.module';
import { OrderModule } from '@entities/order/order.module';
import { TypeOrmModule } from '@db/typeorm.module';
import { ConfigModule } from './config.module';
import { ItemsModule } from '@entities/items/items.module';

@Module({
  imports: [ConfigModule, TypeOrmModule, UserModule, OrderModule, ItemsModule],
})
export class AppModule {}
