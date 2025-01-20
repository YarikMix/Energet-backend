import { Column } from 'typeorm';

export class CreateItemDto {
  @Column({ name: 'email', type: 'varchar' })
  name: string;

  @Column({ name: 'price', type: 'int' })
  price: number;

  @Column({ name: 'weight', type: 'float' })
  weight: number;

  @Column({ name: 'type', type: 'int' })
  type: number;
}
