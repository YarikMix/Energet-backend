import { Module } from '@nestjs/common';
import { ItemsService } from './service/items.service';
import { ItemsController } from './controller/items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from '@entities/items/models/item.entity';
import { Order } from '@entities/order/models/order.entity';
import { OrderItem } from '@entities/order/models/order-item.entity';
import { MinioService } from '@services/minio/minio.service';
import { ItemType } from '@entities/items/models/item-type.entity';
import { ItemProducer } from '@entities/items/models/item-producer.entity';
import { Favourite } from '@entities/favourite/models/favourite.entity';
import { User } from '@entities/user/models/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Item,
      OrderItem,
      Order,
      ItemType,
      ItemProducer,
      Favourite,
      User,
    ]),
  ],
  controllers: [ItemsController],
  providers: [ItemsService, MinioService],
})
export class ItemsModule {}
