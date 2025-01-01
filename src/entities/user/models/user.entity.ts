import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { E_UserType } from '@entities/user/models/types';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
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
    name: 'userEntity',
    type: 'enum',
    enum: E_UserType,
    nullable: true,
  })
  userType: E_UserType | null;
}
