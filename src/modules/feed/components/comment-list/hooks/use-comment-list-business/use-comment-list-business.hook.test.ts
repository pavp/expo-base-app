import { mockComment } from '@/test/entities';
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
});
