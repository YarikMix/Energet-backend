import { Column } from 'typeorm';
import { E_ItemType } from '@entities/items/models/types';

export class CreateItemDto {
  @Column({ name: 'email', type: 'varchar' })
  name: string;

  @Column({ name: 'password', type: 'int' })
  price: number;

  @Column({ name: 'type', type: 'enum', enum: E_ItemType })
  type: E_ItemType;
}
