import { setSeederFactory } from 'typeorm-extension';
import { User } from '@entities/user/models/user.entity';
import { Faker } from '@faker-js/faker';
import { E_UserType } from '@entities/user/models/types';

export const UserFactory = setSeederFactory(User, (faker: Faker) => {
  const user = new User();
  user.name = faker.person.firstName() + ' ' + faker.person.lastName();
  user.email = faker.internet.email();
  user.phone = faker.phone.number();
  user.password = faker.internet.password();
  user.role = E_UserType.Buyer;
  return user;
});
