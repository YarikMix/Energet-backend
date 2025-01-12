import { Column } from 'typeorm';

export class CreateItemDto {
  @Column({ name: 'email', type: 'varchar' })
  name: string;

  @Column({ name: 'password', type: 'int' })
  price: number;

  @Column({ name: 'type', type: 'int' })
  type: number;
}
