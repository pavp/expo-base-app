import { faker } from '@faker-js/faker';

import { Post } from '@/api/post';

export const mockPost: Post = {
  id: faker.number.int(),
  title: faker.lorem.words(),
  body: faker.lorem.words(),
  userId: faker.number.int(),
};
