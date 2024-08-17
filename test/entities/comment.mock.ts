import { faker } from '@faker-js/faker';

import { Comment } from '@/api/comment';

export const mockComment: Comment = {
  postId: faker.number.int(),
  id: faker.number.int(),
  name: faker.lorem.words(),
  body: faker.lorem.words(),
  email: faker.lorem.words(),
};
