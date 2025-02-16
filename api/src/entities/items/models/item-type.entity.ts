import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('item_type')
export class ItemType {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column({ name: 'name', type: 'varchar' })
  name: string;
}
