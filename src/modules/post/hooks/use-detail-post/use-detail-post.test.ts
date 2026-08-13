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

  it('should report an error when the settled post request yields no post', async () => {
    jest.spyOn(postHooks, 'useGetPostById').mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    jest.spyOn(userHooks, 'useGetUser').mockReturnValue({
      data: user,
      isLoading: false,
    } as any);

    const { result } = await renderHookWithProviders(() => useDetailPost({ id: '1', userId: '1' }));

    // Reporting `undefined` rather than an empty object is what stops the view
    // from reaching for `post.id` on a post that never arrived.
    expect(result.current.post).toBeUndefined();
    expect(result.current.user).toEqual(user);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
  });

  it('should not report an error when only the user request fails', async () => {
    jest.spyOn(postHooks, 'useGetPostById').mockReturnValue({
      data: post,
      isLoading: false,
    } as any);

    jest.spyOn(userHooks, 'useGetUser').mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as any);

    const { result } = await renderHookWithProviders(() => useDetailPost({ id: '1', userId: '1' }));

    expect(result.current.post).toEqual(post);
    expect(result.current.isError).toBe(false);
  });

  it('should report no user when useGetUser returns undefined', async () => {
    jest.spyOn(postHooks, 'useGetPostById').mockReturnValue({
      data: post,
      isLoading: false,
    } as any);

    jest.spyOn(userHooks, 'useGetUser').mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    const { result } = await renderHookWithProviders(() => useDetailPost({ id: '1', userId: '1' }));

    expect(result.current.post).toEqual(post);
    expect(result.current.user).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });
});
