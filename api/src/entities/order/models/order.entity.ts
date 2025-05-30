import { E_OrderStatus } from '@entities/order/models/types';
import { User } from '@entities/user/models/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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
    type: 'timestamptz',
    nullable: true,
  })
  formation_date: Date;

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  complete_date: Date;

  @Column({
    name: 'status',
    type: 'enum',
    enum: E_OrderStatus,
    nullable: false,
    default: E_OrderStatus.Draft,
  })
  status: E_OrderStatus;

  @ManyToOne(() => User, (user) => user)
  // @JoinColumn()
  owner: User;

  // // TODO;
  // @BeforeInsert()
  // update() {
  //   this.created_date = new Date();
  // }
}
