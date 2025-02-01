import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { E_UserType } from '@entities/user/models/types';
import { Item } from '@entities/items/models/item.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column({ name: 'email', type: 'varchar' })
  email: string;

  @Column({ name: 'password', type: 'varchar' })
  password: string;

  @Column({ name: 'name', type: 'varchar' })
  name: string;

  @Column({ name: 'phone', type: 'varchar' })
  phone: string;

  @Column({
    name: 'role',
    type: 'enum',
    enum: E_UserType,
    nullable: true,
  })
  role: E_UserType | null;

  @ManyToMany(() => Item, { onDelete: 'NO ACTION', onUpdate: 'NO ACTION' })
  @JoinTable()
  items?: Item[];
}
