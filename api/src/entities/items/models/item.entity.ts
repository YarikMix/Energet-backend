import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { E_ItemStatus } from '@entities/items/models/types';
import { User } from '@entities/user/models/user.entity';
import { ItemType } from '@entities/items/models/item-type.entity';
import { ItemProducer } from '@entities/items/models/item-producer.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @ManyToOne(() => ItemType, (itemType) => itemType.id)
  item_type: ItemType;

  @ManyToOne(() => ItemProducer, (itemProducer) => itemProducer.id)
  item_producer: ItemProducer;

  @Column({ name: 'price', type: 'int' })
  price: number;

  @Column({ name: 'float', type: 'float' })
  weight: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: E_ItemStatus,
    default: E_ItemStatus.Created,
  })
  status: E_ItemStatus;

  @Column({
    name: 'image',
    type: 'varchar',
    default: 'http://localhost:9000/images/items/default.jpg',
  })
  image: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  owner: User;
}
