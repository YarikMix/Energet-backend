import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from '@entities/items/models/item.entity';
import { User } from '@entities/user/models/user.entity';

@Entity('favourite')
export class Favourite {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @PrimaryColumn()
  ownerId: number;

  @PrimaryColumn()
  itemId: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @ManyToOne(() => Item, (item) => item.id)
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  created_date: Date;

  @BeforeInsert()
  updateDates() {
    this.created_date = new Date();
  }
}
