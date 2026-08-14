import MockAdapter from 'axios-mock-adapter';

import { client, User } from '@/api';
import { API_ENDPOINT } from '@/api/endpoints';
import { generateMockUsers } from '@/test/entities';
import { queryClient, renderHookWithProviders, waitFor } from '@/test/test-utils';

import { useGetUsers } from './use-get-users.hook';

describe('useGetUsers', () => {
  const mock = new MockAdapter(client);

  afterEach(() => {
    queryClient.clear();
    mock.reset();

    jest.clearAllMocks();
  });

  it('should fetch the list of users', async () => {
    const mockUsers: User[] = generateMockUsers(10);

    mock.onGet(API_ENDPOINT.USERS).reply(200, mockUsers);

    const { result } = await renderHookWithProviders(() => useGetUsers());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockUsers);
  });

  it('should handle an error when fetching users', async () => {
    mock.onGet(API_ENDPOINT.USERS).reply(500);

    const { result } = await renderHookWithProviders(() => useGetUsers());

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
