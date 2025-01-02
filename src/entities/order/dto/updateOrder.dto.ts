import { Column } from 'typeorm';
import { E_OrderStatus } from '@entities/order/models/types';

export class UpdateOrderDto {
  @Column({
    name: 'status',
    type: 'enum',
    enum: E_OrderStatus,
  })
  status: E_OrderStatus;
}
