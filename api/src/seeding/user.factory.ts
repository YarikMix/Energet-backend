import { setSeederFactory } from 'typeorm-extension';
import { User } from '@entities/user/models/user.entity';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { E_UserType } from '@entities/user/models/types';

export const UserFactory = setSeederFactory(User, async () => {
  const user = new User();
  user.name = faker.person.firstName() + ' ' + faker.person.lastName();
  user.email = faker.internet.email();
  user.phone = faker.phone.number();
  user.password = await bcrypt.hash('1234', 10);
  // user.password = await bcrypt.hash(faker.internet.password(), 10);
  user.role = E_UserType.Buyer;
  return user;
});
