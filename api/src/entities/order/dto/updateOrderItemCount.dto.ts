import { Column } from 'typeorm';

export class UpdateOrderItemCountDto {
  @Column({
    name: 'value',
    type: 'int',
  })
  count: number;
}
