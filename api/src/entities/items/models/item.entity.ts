import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { E_ItemStatus } from '@entities/items/models/types';
import { User } from '@entities/user/models/user.entity';
import { ItemType } from '@entities/items/models/item-type.entity';
import { ItemProducer } from '@entities/items/models/item-producer.entity';

@Entity('item')
export class Item {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  // @Column({ name: 'itemTypeId', type: 'int' })
  // itemTypeId: number;

  @ManyToOne(() => ItemType, (itemType) => itemType.id)
  // @JoinColumn({ name: 'itemTypeId' })
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
