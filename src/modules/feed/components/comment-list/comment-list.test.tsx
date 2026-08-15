import { mockComment } from '@/test/entities/comment.mock';
import { renderWithProviders, screen } from '@/test/test-utils';

import { feedRepository } from '../../repositories/feed';

import { CommentList } from './comment-list';

jest.mock('../../repositories/feed');

describe('CommentList', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the comment count and every comment body', async () => {
    jest.spyOn(feedRepository.queries, 'useFeedComments').mockReturnValue({
      data: [mockComment],
    } as any);

    await renderWithProviders(<CommentList postId="1" />);

    expect(screen.getByText('postDetail.comments (1)')).toBeTruthy();
    expect(screen.getByText(mockComment.body)).toBeTruthy();
  });

  it('should render a zero count when there are no comments yet', async () => {
    jest.spyOn(feedRepository.queries, 'useFeedComments').mockReturnValue({
      data: undefined,
    } as any);

    await renderWithProviders(<CommentList postId="1" />);

    expect(screen.getByText('postDetail.comments (0)')).toBeTruthy();
  });
});
