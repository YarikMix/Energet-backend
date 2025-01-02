import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Order } from '@entities/order/models/order.entity';
import { Item } from '@entities/items/models/item.entity';

@Entity('orders_items')
export class OrderItem {
  @PrimaryColumn()
  orderId: number;

  @PrimaryColumn()
  itemId: number;

  @ManyToOne(() => Order, (order) => order.id)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Item, (item) => item.id)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({
    type: 'int',
    default: 0,
  })
  count: number;
}
