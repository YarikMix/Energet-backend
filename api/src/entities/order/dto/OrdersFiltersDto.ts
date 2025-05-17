import { IsOptional, IsString } from 'class-validator';

export class OrdersFiltersDto {
  @IsString()
  @IsOptional()
  status?: string;
}
