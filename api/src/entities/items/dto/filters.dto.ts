import { IsOptional, IsString } from 'class-validator';

export class ItemsFiltersDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  types?: string;

  @IsString()
  @IsOptional()
  producers?: string;
}
