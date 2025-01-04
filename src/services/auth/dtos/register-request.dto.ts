import { E_UserType } from '@entities/user/models/types';

export type RegisterRequestDto = {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: E_UserType | null;
};
