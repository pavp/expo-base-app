import { faker } from '@faker-js/faker';

import { User } from '@/api/user';

export const mockUser: User = {
  id: faker.number.int(),
  name: faker.lorem.words(),
  email: faker.internet.email(),
  username: faker.lorem.word(),
};
