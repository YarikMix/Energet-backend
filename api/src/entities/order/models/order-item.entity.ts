import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Order } from '@entities/order/models/order.entity';
import { Item } from '@entities/items/models/item.entity';

@Entity('orders_items')
export class OrderItem {
  @PrimaryColumn()
  orderId: number;

  @PrimaryColumn()
  itemId: number;

  @ManyToOne(() => Order, (order) => order.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Item, (item) => item.id)
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  created_date: Date;

  @Column({
    type: 'int',
    default: 1,
  })
  count: number;

  @BeforeInsert()
  updateDates() {
    this.created_date = new Date();
  }
}
