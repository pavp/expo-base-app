import { faker } from '@faker-js/faker';

import { Post } from '@/api/post';

export const mockPost: Post = {
  id: faker.number.int(),
  title: faker.lorem.words(),
  body: faker.lorem.words(),
  userId: faker.number.int(),
};

export const generateMockPosts = (count: number): Post[] => {
  const posts: Post[] = [];

  for (let i = 0; i < count; i++) {
    const mockPost: Post = {
      id: faker.number.int(),
      title: faker.lorem.words(),
      body: faker.lorem.words(),
      userId: faker.number.int(),
    };

    posts.push(mockPost);
  }

  return posts;
};
