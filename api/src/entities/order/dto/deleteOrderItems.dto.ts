import { Column } from 'typeorm';

export class DeleteOrderItemsDto {
  @Column({
    name: 'items',
    type: 'array',
  })
  items: number[];
}
