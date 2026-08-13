import MockAdapter from 'axios-mock-adapter';

import { client } from '@/api';
import { API_ENDPOINT } from '@/api/endpoints';
import { mockUser } from '@/test/entities';
import { queryClient, renderHookWithProviders, waitFor } from '@/test/test-utils';

import { useGetUser } from './use-get-user';

describe('useGetUser', () => {
  const mock = new MockAdapter(client);
  const user = mockUser;

  afterEach(() => {
    queryClient.clear();
    mock.reset();
    jest.clearAllMocks();
  });

  it('should fetches and returns post data successfully', async () => {
    mock.onGet(API_ENDPOINT.GET_USER + user.id).reply(200, user);

    const { result } = await renderHookWithProviders(() => useGetUser({ variables: user.id.toString() }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(user);
  });

  it('should handles error when fetching post data', async () => {
    // Mock a 500 server error
    mock.onGet(API_ENDPOINT.GET_POSTS).reply(500);

    const { result } = await renderHookWithProviders(() => useGetUser({ variables: user.id.toString() }));

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});
