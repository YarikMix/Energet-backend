import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { E_ItemStatus } from '@entities/items/models/types';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'email', type: 'varchar' })
  name: string;

  @Column({ name: 'password', type: 'int' })
  price: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: E_ItemStatus,
    nullable: false,
    default: E_ItemStatus.Created,
  })
  status: E_ItemStatus;
}
