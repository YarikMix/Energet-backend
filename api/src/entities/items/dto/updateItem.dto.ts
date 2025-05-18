import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './createItem.dto';

export class UpdateItemDto extends PartialType(CreateItemDto) {
  name?: string;
  price?: number;
  power?: number;
  type?: number;
  producer?: number;
}
