import { IsBoolean, IsOptional, IsString } from 'class-validator';

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

  @IsBoolean()
  @IsOptional()
  favourites: boolean;
}
