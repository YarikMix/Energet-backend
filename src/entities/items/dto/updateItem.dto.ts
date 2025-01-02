import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './createItem.dto';
import { Column } from 'typeorm';
import { E_ItemStatus } from '@entities/items/models/types';

export class UpdateItemDto extends PartialType(CreateItemDto) {
  @Column({
    name: 'status',
    type: 'enum',
    enum: E_ItemStatus,
    nullable: false,
    default: E_ItemStatus.Created,
  })
  status: E_ItemStatus;
}
