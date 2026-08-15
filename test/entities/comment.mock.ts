import { faker } from '@faker-js/faker';

import { Comment } from '@/modules/feed';

export const mockComment: Comment = {
  postId: faker.number.int(),
  id: faker.number.int(),
  name: faker.lorem.words(),
  body: faker.lorem.words(),
  email: faker.lorem.words(),
};
