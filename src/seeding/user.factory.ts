import { setSeederFactory } from 'typeorm-extension';
import { User } from '@entities/user/models/user.entity';
import { E_UserType } from '@entities/user/models/types';
import { faker } from '@faker-js/faker';

export const UserFactory = setSeederFactory(User, () => {
  const user = new User();
  user.name = faker.person.firstName() + ' ' + faker.person.lastName();
  user.email = faker.internet.email();
  user.phone = faker.phone.number();
  user.password = faker.internet.password();
  user.role = E_UserType.Buyer;
  return user;
});
