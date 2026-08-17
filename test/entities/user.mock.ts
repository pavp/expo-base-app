import { faker } from '@faker-js/faker';

import type { User } from '@/shared/user';

/**
 * Builds a user, overriding any field the test cares about:
 *
 * ```ts
 * createMockUser({ name: 'Specific Name' });
 * ```
 */
export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: faker.number.int(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  username: faker.internet.username(),
  ...overrides,
});

/**
 * Builds a list of users with sequential ids, so a test asserting on one item
 * cannot collide with another.
 */
export const generateMockUsers = (count: number, overrides: Partial<User> = {}): User[] =>
  Array.from({ length: count }, (_, index) => createMockUser({ id: index + 1, ...overrides }));

/** A single user, stable for the whole run. Use it when the values do not matter. */
export const mockUser: User = createMockUser();
