import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '@entities/order/models/order.entity';
import { OrderController } from '@entities/order/controller/order.controller';
import { OrderService } from '@entities/order/service/order.service';
import { OrderItem } from '@entities/order/models/order-item.entity';
import { User } from '@entities/user/models/user.entity';
import { Favourite } from '@entities/favourite/models/favourite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, User, Favourite])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
