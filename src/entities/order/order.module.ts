import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '@entities/order/models/order.entity';
import { OrderController } from '@entities/order/controller/order.controller';
import { OrderService } from '@entities/order/service/order.service';
import { OrderItem } from '@entities/order/models/order-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
