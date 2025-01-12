import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('item_producer')
export class ItemProducer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'varchar' })
  name: string;
}
