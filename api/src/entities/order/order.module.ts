import { Favourite } from '@entities/favourite/models/favourite.entity';
import { Item } from '@entities/items/models/item.entity';
import { OrderController } from '@entities/order/controller/order.controller';
import { OrderItem } from '@entities/order/models/order-item.entity';
import { Order } from '@entities/order/models/order.entity';
import { OrderService } from '@entities/order/service/order.service';
import { User } from '@entities/user/models/user.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Item, User, Favourite]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
