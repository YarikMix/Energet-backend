import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { E_UserType } from '@entities/user/models/types';

export class UpdateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  @IsEnum(E_UserType)
  role: E_UserType;
}
