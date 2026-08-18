import { userRepository } from '@/shared/user';
import { mockPost, mockUser } from '@/test/entities';
import { renderHookWithProviders } from '@/test/test-utils';

import { feedRepository } from '../../../../repositories/feed';
import { useFavoritesStore } from '../../../../stores/favorites.store';

import { usePostDetailBusiness } from './use-post-detail-business.hook';

jest.mock('@/shared/user');
jest.mock('../../../../repositories/feed');

// The store is mocked rather than exercised for real: the auto-reset in
// test/__mocks__/zustand wraps its reset in `act`, which unmounts the rendered
// hook between cases in this suite.
jest.mock('../../../../stores/favorites.store', () => ({
  useFavoritesStore: jest.fn(),
}));

describe('usePostDetailBusiness', () => {
  const post = mockPost;
  const user = mockUser;

  const toggleFavorite = jest.fn();

  const mockFavoritesStore = (postIds: number[] = []) => {
    const state = { postIds, actions: { toggleFavorite } };

    (useFavoritesStore as unknown as jest.Mock).mockImplementation(
      (selector: (value: typeof state) => unknown) => selector(state),
    );
  };

  beforeEach(() => {
    mockFavoritesStore();
  });

  it('should returns post and user data with loading state false when both hooks resolve successfully', async () => {
    jest.spyOn(feedRepository.queries, 'useFeedPost').mockReturnValue({
      data: post,
      isLoading: false,
    } as any);

    jest.spyOn(userRepository.queries, 'useUser').mockReturnValue({
      data: user,
      isLoading: false,
    } as any);

    const { result } = await renderHookWithProviders(() => usePostDetailBusiness({ id: '1', userId: '1' }));

    expect(result.current.post).toEqual(post);
    expect(result.current.user).toEqual(user);
    expect(result.current.isLoading).toBe(false);
  });

  it('should returns loading state true when post data is still loading', async () => {
    jest.spyOn(feedRepository.queries, 'useFeedPost').mockReturnValue({
      data: {},
      isLoading: true,
    } as any);

    jest.spyOn(userRepository.queries, 'useUser').mockReturnValue({
      data: user,
      isLoading: false,
    } as any);

    const { result } = await renderHookWithProviders(() => usePostDetailBusiness({ id: '1', userId: '1' }));

    expect(result.current.post).toEqual({});
    expect(result.current.user).toEqual(user);
    expect(result.current.isLoading).toBe(true);
  });

  it('should returns loading state true when user data is still loading', async () => {
    jest.spyOn(feedRepository.queries, 'useFeedPost').mockReturnValue({
      data: post,
      isLoading: false,
    } as any);

    jest.spyOn(userRepository.queries, 'useUser').mockReturnValue({
      data: {},
      isLoading: true,
    } as any);

    const { result } = await renderHookWithProviders(() => usePostDetailBusiness({ id: '1', userId: '1' }));

    expect(result.current.post).toEqual(post);
    expect(result.current.user).toEqual({});
    expect(result.current.isLoading).toBe(true);
  });

  it('should returns loading state true when both post and user data are loading', async () => {
    jest.spyOn(feedRepository.queries, 'useFeedPost').mockReturnValue({
      data: {},
      isLoading: true,
    } as any);

    jest.spyOn(userRepository.queries, 'useUser').mockReturnValue({
      data: {},
      isLoading: true,
    } as any);

    const { result } = await renderHookWithProviders(() => usePostDetailBusiness({ id: '1', userId: '1' }));

    expect(result.current.post).toEqual({});
    expect(result.current.user).toEqual({});
    expect(result.current.isLoading).toBe(true);
  });

  it('should report an error when the settled post request yields no post', async () => {
    jest.spyOn(feedRepository.queries, 'useFeedPost').mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    jest.spyOn(userRepository.queries, 'useUser').mockReturnValue({
      data: user,
      isLoading: false,
    } as any);

    const { result } = await renderHookWithProviders(() => usePostDetailBusiness({ id: '1', userId: '1' }));

    // Reporting `undefined` rather than an empty object is what stops the view
    // from reaching for `post.id` on a post that never arrived.
    expect(result.current.post).toBeUndefined();
    expect(result.current.user).toEqual(user);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
  });

  it('should not report an error when only the user request fails', async () => {
    jest.spyOn(feedRepository.queries, 'useFeedPost').mockReturnValue({
      data: post,
      isLoading: false,
    } as any);

    jest.spyOn(userRepository.queries, 'useUser').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    const { result } = await renderHookWithProviders(() => usePostDetailBusiness({ id: '1', userId: '1' }));

    expect(result.current.post).toEqual(post);
    expect(result.current.isError).toBe(false);
  });

  it('should report no user when useGetUser returns undefined', async () => {
    jest.spyOn(feedRepository.queries, 'useFeedPost').mockReturnValue({
      data: post,
      isLoading: false,
    } as any);

    jest.spyOn(userRepository.queries, 'useUser').mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    const { result } = await renderHookWithProviders(() => usePostDetailBusiness({ id: '1', userId: '1' }));

    expect(result.current.post).toEqual(post);
    expect(result.current.user).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('should mark the current post as favorite when the store holds its id', async () => {
    jest.spyOn(feedRepository.queries, 'useFeedPost').mockReturnValue({ data: post, isLoading: false } as any);
    jest.spyOn(userRepository.queries, 'useUser').mockReturnValue({ data: user, isLoading: false } as any);
    mockFavoritesStore([post.id]);

    const { result } = await renderHookWithProviders(() => usePostDetailBusiness({ id: '1', userId: '1' }));

    expect(result.current.isFavorite).toBe(true);
  });

  it('should toggle the current post through the store action', async () => {
    jest.spyOn(feedRepository.queries, 'useFeedPost').mockReturnValue({ data: post, isLoading: false } as any);
    jest.spyOn(userRepository.queries, 'useUser').mockReturnValue({ data: user, isLoading: false } as any);

    const { result } = await renderHookWithProviders(() => usePostDetailBusiness({ id: '1', userId: '1' }));

    expect(result.current.isFavorite).toBe(false);

    result.current.onToggleFavorite();

    expect(toggleFavorite).toHaveBeenCalledWith(post.id);
  });
});
