import { IsString } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  password: string;
}
