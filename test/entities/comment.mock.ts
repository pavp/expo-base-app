import { faker } from '@faker-js/faker';

import type { Comment } from '@/modules/feed';

/**
 * Builds a comment, overriding any field the test cares about:
 *
 * ```ts
 * createMockComment({ postId: 1 });
 * ```
 */
export const createMockComment = (overrides: Partial<Comment> = {}): Comment => ({
  postId: faker.number.int(),
  id: faker.number.int(),
  name: faker.lorem.words(),
  body: faker.lorem.paragraph(),
  email: faker.internet.email(),
  ...overrides,
});

/**
 * Builds a list of comments with sequential ids, so a test asserting on one
 * item cannot collide with another.
 */
export const generateMockComments = (count: number, overrides: Partial<Comment> = {}): Comment[] =>
  Array.from({ length: count }, (_, index) => createMockComment({ id: index + 1, ...overrides }));

/** A single comment, stable for the whole run. Use it when the values do not matter. */
export const mockComment: Comment = createMockComment();
