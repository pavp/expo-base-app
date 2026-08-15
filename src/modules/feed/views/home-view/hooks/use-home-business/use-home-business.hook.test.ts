import { mockPost } from '@/test/entities';
import { renderHookWithProviders } from '@/test/test-utils';

import { usePostAuthors } from '../../../../hooks';
import { feedRepository } from '../../../../repositories/feed';

import { useHomeBusiness } from './use-home-business.hook';

jest.mock('../../../../repositories/feed');
jest.mock('../../../../hooks');

describe('useHomeBusiness', () => {
  const fetchNextPage = jest.fn();
  const refetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePostAuthors as jest.Mock).mockReturnValue(new Map());
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

    const { result } = await renderHookWithProviders(() => useHomeBusiness());

    expect(result.current.postsData).toEqual([mockPost, mockPost]);
  });

  it('should default to an empty list while there is no data yet', async () => {
    (feedRepository.queries.useFeedPosts as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      isRefetching: false,
      refetch,
      fetchNextPage,
    });

    const { result } = await renderHookWithProviders(() => useHomeBusiness());

    expect(result.current.postsData).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('should request the next page only when there is one', async () => {
    (feedRepository.queries.useFeedPosts as jest.Mock).mockReturnValue({
      data: { pages: [[mockPost]] },
      isLoading: false,
      isError: false,
      hasNextPage: true,
      isFetchingNextPage: false,
      isRefetching: false,
      refetch,
      fetchNextPage,
    });

    const { result } = await renderHookWithProviders(() => useHomeBusiness());

    result.current.onEndReached();

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it('should not request the next page when there is none', async () => {
    (feedRepository.queries.useFeedPosts as jest.Mock).mockReturnValue({
      data: { pages: [[mockPost]] },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      isRefetching: false,
      refetch,
      fetchNextPage,
    });

    const { result } = await renderHookWithProviders(() => useHomeBusiness());

    result.current.onEndReached();

    expect(fetchNextPage).not.toHaveBeenCalled();
  });
});
