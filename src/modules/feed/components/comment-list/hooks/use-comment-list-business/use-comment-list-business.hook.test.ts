import { createMockComment, mockComment } from '@/test/entities';
import { renderHookWithProviders } from '@/test/test-utils';

import { feedRepository } from '../../../../repositories/feed';

import { useCommentListBusiness } from './use-comment-list-business.hook';

jest.mock('../../../../repositories/feed');

describe('useCommentListBusiness', () => {
  // The repository is auto-mocked, so every hook on it returns `undefined` until stubbed. The
  // read tests only care about the query, but the hook still destructures the mutation.
  beforeEach(() => {
    jest
      .spyOn(feedRepository.mutations, 'useCreateComment')
      .mockReturnValue({ mutate: jest.fn(), isPending: false, isError: false } as any);
    jest.spyOn(feedRepository.queries, 'useFeedComments').mockReturnValue({ data: [] } as any);
  });

  it('should return the comments returned by the feed repository', async () => {
    jest.spyOn(feedRepository.queries, 'useFeedComments').mockReturnValue({
      data: [mockComment],
    } as any);

    const { result } = await renderHookWithProviders(() => useCommentListBusiness('1'));

    expect(result.current.comments).toEqual([mockComment]);
  });

  it('should default to an empty array when the repository has not resolved data yet', async () => {
    jest.spyOn(feedRepository.queries, 'useFeedComments').mockReturnValue({
      data: undefined,
    } as any);

    const { result } = await renderHookWithProviders(() => useCommentListBusiness('1'));

    expect(result.current.comments).toEqual([]);
  });

  it('should query the repository with the given post id', async () => {
    const useFeedCommentsSpy = jest.spyOn(feedRepository.queries, 'useFeedComments').mockReturnValue({
      data: [],
    } as any);

    await renderHookWithProviders(() => useCommentListBusiness('42'));

    expect(useFeedCommentsSpy).toHaveBeenCalledWith('42');
  });

  it('should forward a create-comment input, and its success callback, to the mutation', async () => {
    jest.spyOn(feedRepository.queries, 'useFeedComments').mockReturnValue({ data: [] } as any);
    const mutate = jest.fn();
    jest.spyOn(feedRepository.mutations, 'useCreateComment').mockReturnValue({ mutate, isPending: false } as any);

    const { result } = await renderHookWithProviders(() => useCommentListBusiness('1'));

    const input = { postId: 1, name: 'Ada', email: 'ada@example.com', body: 'A comment' };
    const onSuccess = jest.fn();
    result.current.createComment(input, onSuccess);

    expect(mutate).toHaveBeenCalledWith(input, { onSuccess });
  });

  it('should expose the mutation pending and error flags', async () => {
    jest.spyOn(feedRepository.queries, 'useFeedComments').mockReturnValue({ data: [] } as any);
    jest
      .spyOn(feedRepository.mutations, 'useCreateComment')
      .mockReturnValue({ mutate: jest.fn(), isPending: true, isError: true } as any);

    const { result } = await renderHookWithProviders(() => useCommentListBusiness('1'));

    expect(result.current.isCreating).toBe(true);
    expect(result.current.isCreateError).toBe(true);
  });

  describe('merging locally stored comments', () => {
    const serverComment = createMockComment({ id: 1, postId: 1 });
    const localComment = createMockComment({ id: -1750000000000, postId: 1 });

    const mockSources = (server: unknown[], local: unknown[]) => {
      jest.spyOn(feedRepository.queries, 'useFeedComments').mockImplementation(((
        _postId: string,
        dataSource?: string,
      ) => ({ data: dataSource === 'asyncStorage' ? local : server })) as any);
    };

    it('should read the same post from both the server and local storage', async () => {
      const useFeedCommentsSpy = jest
        .spyOn(feedRepository.queries, 'useFeedComments')
        .mockReturnValue({ data: [] } as any);

      await renderHookWithProviders(() => useCommentListBusiness('42'));

      expect(useFeedCommentsSpy).toHaveBeenCalledWith('42');
      expect(useFeedCommentsSpy).toHaveBeenCalledWith('42', 'asyncStorage');
    });

    it('should append a locally stored comment the server does not know about', async () => {
      mockSources([serverComment], [localComment]);

      const { result } = await renderHookWithProviders(() => useCommentListBusiness('1'));

      expect(result.current.comments).toEqual([serverComment, localComment]);
    });

    it('should not duplicate a comment present in both the server list and local storage', async () => {
      mockSources([serverComment], [serverComment, localComment]);

      const { result } = await renderHookWithProviders(() => useCommentListBusiness('1'));

      expect(result.current.comments).toEqual([serverComment, localComment]);
    });

    it('should keep the server copy when both sources hold the same id', async () => {
      mockSources([serverComment], [createMockComment({ id: serverComment.id, body: 'stale local copy' })]);

      const { result } = await renderHookWithProviders(() => useCommentListBusiness('1'));

      expect(result.current.comments).toEqual([serverComment]);
    });

    it('should return only the server list when nothing was stored locally', async () => {
      mockSources([serverComment], []);

      const { result } = await renderHookWithProviders(() => useCommentListBusiness('1'));

      expect(result.current.comments).toEqual([serverComment]);
    });
  });
});
