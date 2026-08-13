import { faker } from '@faker-js/faker';

import { User } from '@/api/user';

export const mockUser: User = {
  id: faker.number.int(),
  name: faker.lorem.words(),
  email: faker.internet.email(),
  username: faker.lorem.word(),
};

export const generateMockUsers = (count: number): User[] =>
  Array.from({ length: count }, () => ({
    id: faker.number.int(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    username: faker.internet.username(),
  }));
