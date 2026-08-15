import { mockComment } from '@/test/entities/comment.mock';
import { renderHookWithProviders } from '@/test/test-utils';

import { feedRepository } from '../../../../repositories/feed';

import { useCommentListBusiness } from './use-comment-list-business.hook';

jest.mock('../../../../repositories/feed');

describe('useCommentListBusiness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
