import { User } from '@entities/user/models/user.entity';

export type AuthPayload = {
  token: string;
  user: Partial<User>;
};
