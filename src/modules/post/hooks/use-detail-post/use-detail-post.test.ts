import * as postHooks from '@/api/post';
import * as userHooks from '@/api/user';
import { mockPost, mockUser } from '@/test/entities';
import { renderHookWithProviders } from '@/test/test-utils';

import { useDetailPost } from './use-detail-post';

jest.mock('@/api/post');
jest.mock('@/api/user');

describe('useDetailPost', () => {
  const post = mockPost;
  const user = mockUser;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should returns post and user data with loading state false when both hooks resolve successfully', async () => {
    jest.spyOn(postHooks, 'useGetPostById').mockReturnValue({
      data: post,
      isLoading: false,
    } as any);

    jest.spyOn(userHooks, 'useGetUser').mockReturnValue({
      data: user,
      isLoading: false,
    } as any);

    const { result } = await renderHookWithProviders(() => useDetailPost({ id: '1', userId: '1' }));

    expect(result.current.post).toEqual(post);
    expect(result.current.user).toEqual(user);
    expect(result.current.isLoading).toBe(false);
  });

  it('should returns loading state true when post data is still loading', async () => {
    jest.spyOn(postHooks, 'useGetPostById').mockReturnValue({
      data: {},
      isLoading: true,
    } as any);

    jest.spyOn(userHooks, 'useGetUser').mockReturnValue({
      data: user,
      isLoading: false,
    } as any);

    const { result } = await renderHookWithProviders(() => useDetailPost({ id: '1', userId: '1' }));

    expect(result.current.post).toEqual({});
    expect(result.current.user).toEqual(user);
    expect(result.current.isLoading).toBe(true);
  });

  it('should returns loading state true when user data is still loading', async () => {
    jest.spyOn(postHooks, 'useGetPostById').mockReturnValue({
      data: post,
      isLoading: false,
    } as any);

    jest.spyOn(userHooks, 'useGetUser').mockReturnValue({
      data: {},
      isLoading: true,
    } as any);

    const { result } = await renderHookWithProviders(() => useDetailPost({ id: '1', userId: '1' }));

    expect(result.current.post).toEqual(post);
    expect(result.current.user).toEqual({});
    expect(result.current.isLoading).toBe(true);
  });

  it('should returns loading state true when both post and user data are loading', async () => {
    jest.spyOn(postHooks, 'useGetPostById').mockReturnValue({
      data: {},
      isLoading: true,
    } as any);

    jest.spyOn(userHooks, 'useGetUser').mockReturnValue({
      data: {},
      isLoading: true,
    } as any);

    const { result } = await renderHookWithProviders(() => useDetailPost({ id: '1', userId: '1' }));

    expect(result.current.post).toEqual({});
    expect(result.current.user).toEqual({});
    expect(result.current.isLoading).toBe(true);
  });

  it('should returns default post value when useGetPostById returns undefined', async () => {
    jest.spyOn(postHooks, 'useGetPostById').mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    jest.spyOn(userHooks, 'useGetUser').mockReturnValue({
      data: user,
      isLoading: false,
    } as any);

    const { result } = await renderHookWithProviders(() => useDetailPost({ id: '1', userId: '1' }));

    // Expect the post to be the default value (empty object cast as Post)
    expect(result.current.post).toEqual({});
    expect(result.current.user).toEqual(user);
    expect(result.current.isLoading).toBe(false);
  });

  it('should returns default user value when useGetUser returns undefined', async () => {
    jest.spyOn(postHooks, 'useGetPostById').mockReturnValue({
      data: post,
      isLoading: false,
    } as any);

    jest.spyOn(userHooks, 'useGetUser').mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    const { result } = await renderHookWithProviders(() => useDetailPost({ id: '1', userId: '1' }));

    // Expect the user to be the default value (empty object cast as User)
    expect(result.current.post).toEqual(post);
    expect(result.current.user).toEqual({});
    expect(result.current.isLoading).toBe(false);
  });
});
