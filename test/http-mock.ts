import MockAdapter from 'axios-mock-adapter';

import { client } from '@/api/common/client';

/**
 * Attaches a mock adapter to the shared axios instance and resets it after each
 * test in the calling suite.
 *
 * Call it at describe scope and keep the returned adapter:
 *
 * ```ts
 * const mock = setupHttpMock();
 * ```
 *
 * Handlers do not need clearing separately — `jest.config.ts` sets
 * `clearMocks: true`, which resets mock function state before every test.
 */
export const setupHttpMock = (): MockAdapter => {
  const mock = new MockAdapter(client);

  afterEach(() => {
    mock.reset();
  });

  return mock;
};
