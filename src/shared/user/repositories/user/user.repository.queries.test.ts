import MockAdapter from 'axios-mock-adapter';

import { client } from '@/api/common/client';
import { generateMockUsers, mockUser } from '@/test/entities/user.mock';
import { queryClient, renderHookWithProviders, waitFor } from '@/test/test-utils';

import { userRepositoryQueries } from './user.repository.queries';

describe('userRepositoryQueries', () => {
  const mock = new MockAdapter(client);

  afterEach(() => {
    queryClient.clear();
    mock.reset();
    jest.clearAllMocks();
  });

  it('exposes only query operations — no create/update/delete member exists', () => {
    expect(userRepositoryQueries).not.toHaveProperty('create');
    expect(userRepositoryQueries).not.toHaveProperty('update');
    expect(userRepositoryQueries).not.toHaveProperty('delete');
  });

  describe('useUsers', () => {
    it('resolves the user list', async () => {
      const users = generateMockUsers(3);
      mock.onGet('users').reply(200, users);

      const { result } = await renderHookWithProviders(() => userRepositoryQueries.useUsers());

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(users);
    });

    it('suppresses the initial fetch when options.enabled is false', async () => {
      mock.onGet('users').reply(200, generateMockUsers(3));

      const { result } = await renderHookWithProviders(() => userRepositoryQueries.useUsers({ enabled: false }));

      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useUser', () => {
    it('fetches a single user by id', async () => {
      mock.onGet(`users/${mockUser.id}`).reply(200, mockUser);

      const { result } = await renderHookWithProviders(() => userRepositoryQueries.useUser(mockUser.id));

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockUser);
    });

    it('suppresses fetch when id is falsy', async () => {
      mock.onGet('users/0').reply(200, mockUser);

      const { result } = await renderHookWithProviders(() => userRepositoryQueries.useUser(0));

      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.data).toBeUndefined();
    });
  });
});
