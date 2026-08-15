import MockAdapter from 'axios-mock-adapter';

import { HttpValidationError } from '@/api/api.types';
import { client } from '@/api/common/client';
import { generateMockUsers, mockUser } from '@/test/entities/user.mock';

import { userApi } from './user-api';

describe('userApi', () => {
  const mock = new MockAdapter(client);

  afterEach(() => {
    mock.reset();
    jest.clearAllMocks();
  });

  describe('contract', () => {
    it('exposes the whole query surface as callable operations on a single singleton', () => {
      expect(typeof userApi.getAll).toBe('function');
      expect(typeof userApi.getById).toBe('function');
    });
  });

  describe('getAll', () => {
    it('requests the users endpoint and returns the parsed list', async () => {
      const users = generateMockUsers(3);
      mock.onGet('users').reply(200, users);

      const result = await userApi.getAll();

      expect(result).toEqual(users);
    });

    it('strips unknown keys from a full live-shaped payload, keeping only the declared fields', async () => {
      const fullPayload = [
        {
          ...mockUser,
          address: { street: 'Main St', suite: 'Apt. 1', city: 'Gwenborough', zipcode: '92998-3874' },
          phone: '1-770-736-8031 x56442',
          website: 'hildegard.org',
          company: { name: 'Romaguera-Crona', catchPhrase: 'Multi-layered client-server neural-net' },
        },
      ];
      mock.onGet('users').reply(200, fullPayload);

      const result = await userApi.getAll();

      expect(result).toEqual([mockUser]);
      expect(result[0]).not.toHaveProperty('address');
      expect(result[0]).not.toHaveProperty('phone');
      expect(result[0]).not.toHaveProperty('website');
      expect(result[0]).not.toHaveProperty('company');
    });

    it('validates the response against UserArraySchema and throws HttpValidationError on mismatch', async () => {
      mock.onGet('users').reply(200, [{ ...mockUser, id: 'not-a-number' }]);

      await expect(userApi.getAll()).rejects.toBeInstanceOf(HttpValidationError);
    });

    it('forwards the abort signal to the underlying request', async () => {
      const controller = new AbortController();
      mock.onGet('users').reply(() => {
        controller.abort();

        return [200, generateMockUsers(1)];
      });

      await userApi.getAll({ signal: controller.signal }).catch((reason: unknown) => reason);

      expect(controller.signal.aborted).toBe(true);
    });
  });

  describe('getById', () => {
    it('builds the exact URL for a single user and validates against UserSchema', async () => {
      mock.onGet(`users/${mockUser.id}`).reply(200, mockUser);

      // `userApi.getById` is an async httpClient call, not an RTL `getBy*` DOM query — the rule
      // below matches on name alone.
      // eslint-disable-next-line testing-library/no-await-sync-queries
      const result = await userApi.getById(mockUser.id);

      expect(result).toEqual(mockUser);
    });

    it('throws HttpValidationError when the payload does not match UserSchema', async () => {
      mock.onGet('users/999').reply(200, { id: 999 });

      await expect(userApi.getById(999)).rejects.toBeInstanceOf(HttpValidationError);
    });

    it('forwards the abort signal to the underlying request', async () => {
      const controller = new AbortController();
      mock.onGet(`users/${mockUser.id}`).reply(() => {
        controller.abort();

        return [200, mockUser];
      });

      await userApi.getById(mockUser.id, { signal: controller.signal }).catch((reason: unknown) => reason);

      expect(controller.signal.aborted).toBe(true);
    });
  });
});
