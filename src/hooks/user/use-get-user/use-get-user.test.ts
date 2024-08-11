import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { UserAPI } from '@/api/services/user';
import { mockUser } from '@/test/entities';
import { renderHookWithProviders, waitFor } from '@/test/test-utils';

import { useGetUser } from './use-get-user';

jest.mock('@/api/services/user');

describe('useGetUser', () => {
  const queryClient = new QueryClient();
  const user = mockUser;

  afterEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  it('fetches and returns post data successfully', async () => {
    jest.spyOn(UserAPI, 'getUser').mockResolvedValueOnce(user);

    const { result } = renderHookWithProviders(() => useGetUser({ variables: user.id.toString() }));

    await waitFor(() => expect(result.current.data).toEqual(user));
    expect(UserAPI.getUser).toHaveBeenCalled();
  });

  it('handles error when fetching post data', async () => {
    const mockError = new AxiosError('Error fetching post');
    jest.spyOn(UserAPI, 'getUser').mockRejectedValueOnce(mockError);

    const { result } = renderHookWithProviders(() => useGetUser({ variables: user.id.toString() }));

    await waitFor(() => expect(result.current.error).toEqual(mockError));
    expect(UserAPI.getUser).toHaveBeenCalled();
  });
});
