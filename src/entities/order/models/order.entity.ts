import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { E_OrderStatus } from '@entities/order/models/types';
import { User } from '@entities/user/models/user.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  created_date: Date;

  @Column({
    name: 'status',
    type: 'enum',
    enum: E_OrderStatus,
    nullable: false,
    default: E_OrderStatus.Draft,
  })
  status: E_OrderStatus;

  @OneToMany(() => User, (user) => user)
  owner: User;
}
