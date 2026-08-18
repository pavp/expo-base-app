import { userRepository } from '@/shared/user';
import { mockPost, mockUser } from '@/test/entities';
import { renderHookWithProviders } from '@/test/test-utils';

import { usePostAuthors } from '../../../../hooks';
import { feedRepository } from '../../../../repositories/feed';

import { useExploreBusiness } from './use-explore-business.hook';

jest.mock('@/shared/user');
jest.mock('../../../../repositories/feed');
jest.mock('../../../../hooks');

describe('useExploreBusiness', () => {
  const fetchNextPage = jest.fn();
  const refetch = jest.fn();

  beforeEach(() => {
    (usePostAuthors as jest.Mock).mockReturnValue(new Map());
    jest.spyOn(userRepository.queries, 'useUsers').mockReturnValue({ data: [mockUser] } as any);
  });

  it('should query the feed repository with the given filters and enabled flag', async () => {
    const useFeedPostsSpy = (feedRepository.queries.useFeedPosts as jest.Mock).mockReturnValue({
      data: { pages: [[mockPost]] },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      isRefetching: false,
      refetch,
      fetchNextPage,
    });

    await renderHookWithProviders(() => useExploreBusiness({ q: 'lorem', userId: 1 }, true));

    expect(useFeedPostsSpy).toHaveBeenCalledWith({ q: 'lorem', userId: 1 }, undefined, { enabled: true });
  });

  it('should flatten the paginated posts into a single list', async () => {
    (feedRepository.queries.useFeedPosts as jest.Mock).mockReturnValue({
      data: { pages: [[mockPost], [mockPost]] },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      isRefetching: false,
      refetch,
      fetchNextPage,
    });

    const { result } = await renderHookWithProviders(() => useExploreBusiness({}, false));

    expect(result.current.postsData).toEqual([mockPost, mockPost]);
  });

  it('should expose the users list for author filtering', async () => {
    (feedRepository.queries.useFeedPosts as jest.Mock).mockReturnValue({
      data: { pages: [[]] },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      isRefetching: false,
      refetch,
      fetchNextPage,
    });

    const { result } = await renderHookWithProviders(() => useExploreBusiness({}, false));

    expect(result.current.users).toEqual([mockUser]);
  });
});
