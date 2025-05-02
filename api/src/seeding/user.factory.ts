import { setSeederFactory } from 'typeorm-extension';
import { User } from '@entities/user/models/user.entity';
import { Faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { E_UserType } from '@entities/user/models/types';
import { ru } from '@faker-js/faker';

export const UserFactory = setSeederFactory(User, async () => {
  const user = new User();

  const customFaker = new Faker({
    locale: [ru],
  });
  user.name = `${customFaker.person.firstName()} ${customFaker.person.lastName()}`;
  user.email = customFaker.internet.email();
  user.phone = customFaker.phone.number({ style: 'international' });
  user.password = await bcrypt.hash('1234', 10);
  // user.password = await bcrypt.hash(faker.internet.password(), 10);
  user.role = E_UserType.Buyer;
  return user;
});
