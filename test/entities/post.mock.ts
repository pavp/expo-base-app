import { faker } from '@faker-js/faker';

import type { Post } from '@/modules/feed';

/**
 * Builds a post, overriding any field the test cares about:
 *
 * ```ts
 * createMockPost({ userId: 7 });
 * ```
 */
export const createMockPost = (overrides: Partial<Post> = {}): Post => ({
  id: faker.number.int(),
  title: faker.lorem.words(),
  body: faker.lorem.paragraph(),
  userId: faker.number.int(),
  ...overrides,
});

/**
 * Builds a list of posts with sequential ids, so a test asserting on one item
 * cannot collide with another.
 */
export const generateMockPosts = (count: number, overrides: Partial<Post> = {}): Post[] =>
  Array.from({ length: count }, (_, index) => createMockPost({ id: index + 1, ...overrides }));

/** A single post, stable for the whole run. Use it when the values do not matter. */
export const mockPost: Post = createMockPost();
