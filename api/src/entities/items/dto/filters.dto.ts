import { IsOptional, IsString } from 'class-validator';

export class ItemsFiltersDto {
  @IsString()
  @IsOptional()
  name: number;

  @IsString()
  @IsOptional()
  types: string;

  @IsString()
  @IsOptional()
  producers: string;
}
