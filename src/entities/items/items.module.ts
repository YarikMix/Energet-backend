import { Module } from '@nestjs/common';
import { ItemsService } from './service/items.service';
import { ItemsController } from './controller/items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from '@entities/items/models/item.entity';
import { Order } from '@entities/order/models/order.entity';
import { OrderItem } from '@entities/orderItem/models/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item, OrderItem, Order])],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
