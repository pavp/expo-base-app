import * as hooks from '@/hooks';
import { mockPost, mockUser } from '@/test/entities';
import { renderHookWithProviders } from '@/test/test-utils';

import { useDetailPost } from './use-detail-post';

jest.mock('@/hooks');

describe('useDetailPost', () => {
  const post = mockPost;
  const user = mockUser;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should returns post and user data with loading state false when both hooks resolve successfully', () => {
    jest.spyOn(hooks, 'useGetPostById').mockReturnValue({
      data: post,
      isLoading: false,
    } as any);

    jest.spyOn(hooks, 'useGetUser').mockReturnValue({
      data: user,
      isLoading: false,
    } as any);

    const { result } = renderHookWithProviders(() => useDetailPost({ id: '1', userId: '1' }));

    expect(result.current.post).toEqual(post);
    expect(result.current.user).toEqual(user);
    expect(result.current.isLoading).toBe(false);
  });

  it('should returns loading state true when post data is still loading', () => {
    jest.spyOn(hooks, 'useGetPostById').mockReturnValue({
      data: {},
      isLoading: true,
    } as any);

    jest.spyOn(hooks, 'useGetUser').mockReturnValue({
      data: user,
      isLoading: false,
    } as any);

    const { result } = renderHookWithProviders(() => useDetailPost({ id: '1', userId: '1' }));

    expect(result.current.post).toEqual({});
    expect(result.current.user).toEqual(user);
    expect(result.current.isLoading).toBe(true);
  });

  it('should returns loading state true when user data is still loading', () => {
    jest.spyOn(hooks, 'useGetPostById').mockReturnValue({
      data: post,
      isLoading: false,
    } as any);

    jest.spyOn(hooks, 'useGetUser').mockReturnValue({
      data: {},
      isLoading: true,
    } as any);

    const { result } = renderHookWithProviders(() => useDetailPost({ id: '1', userId: '1' }));

    expect(result.current.post).toEqual(post);
    expect(result.current.user).toEqual({});
    expect(result.current.isLoading).toBe(true);
  });

  it('should returns loading state true when both post and user data are loading', () => {
    jest.spyOn(hooks, 'useGetPostById').mockReturnValue({
      data: {},
      isLoading: true,
    } as any);

    jest.spyOn(hooks, 'useGetUser').mockReturnValue({
      data: {},
      isLoading: true,
    } as any);

    const { result } = renderHookWithProviders(() => useDetailPost({ id: '1', userId: '1' }));

    expect(result.current.post).toEqual({});
    expect(result.current.user).toEqual({});
    expect(result.current.isLoading).toBe(true);
  });

  it('should returns default post value when useGetPostById returns undefined', () => {
    jest.spyOn(hooks, 'useGetPostById').mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    jest.spyOn(hooks, 'useGetUser').mockReturnValue({
      data: user,
      isLoading: false,
    } as any);

    const { result } = renderHookWithProviders(() => useDetailPost({ id: '1', userId: '1' }));

    // Expect the post to be the default value (empty object cast as Post)
    expect(result.current.post).toEqual({});
    expect(result.current.user).toEqual(user);
    expect(result.current.isLoading).toBe(false);
  });

  it('should returns default user value when useGetUser returns undefined', () => {
    jest.spyOn(hooks, 'useGetPostById').mockReturnValue({
      data: post,
      isLoading: false,
    } as any);

    jest.spyOn(hooks, 'useGetUser').mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    const { result } = renderHookWithProviders(() => useDetailPost({ id: '1', userId: '1' }));

    // Expect the user to be the default value (empty object cast as User)
    expect(result.current.post).toEqual(post);
    expect(result.current.user).toEqual({});
    expect(result.current.isLoading).toBe(false);
  });
});
