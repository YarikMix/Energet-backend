import { ItemProducer } from '@entities/items/models/item-producer.entity';
import { ItemType } from '@entities/items/models/item-type.entity';
import { E_ItemStatus } from '@entities/items/models/types';
import { User } from '@entities/user/models/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({ name: 'price', type: 'int', nullable: true })
  price: number;

  @Column({ name: 'weight', type: 'float' })
  weight: number;

  @Column({ name: 'power', type: 'int', nullable: true })
  power: number;

  @Column({ name: 'warehouse_count', type: 'int', nullable: true })
  warehouse_count: number;

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
    default: 'items/default.png',
  })
  image: string;

  @ManyToOne(() => User, (user) => user.id)
  // @JoinColumn({ name: 'user_id' })
  owner: User;
}
