import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { E_ItemStatus } from '@entities/items/models/types';
import { User } from '@entities/user/models/user.entity';

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

  @Column({
    name: 'image',
    type: 'varchar',
    default: 'http://localhost:9000/images/items/default.jpg',
  })
  image: string;

  @ManyToOne(() => User, (user) => user)
  owner: User;
}
