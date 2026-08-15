import { mockComment } from '@/test/entities/comment.mock';
import { renderWithProviders, screen } from '@/test/test-utils';

import { CommentList } from './comment-list';
import * as useCommentListBusinessHook from './hooks';

jest.mock('./hooks');

describe('CommentList', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the comment count and every comment body', async () => {
    jest.spyOn(useCommentListBusinessHook, 'useCommentListBusiness').mockReturnValue({
      comments: [mockComment],
    });

    await renderWithProviders(<CommentList postId="1" />);

    expect(screen.getByText('postDetail.comments (1)')).toBeTruthy();
    expect(screen.getByText(mockComment.body)).toBeTruthy();
  });

  it('should render a zero count when there are no comments yet', async () => {
    jest.spyOn(useCommentListBusinessHook, 'useCommentListBusiness').mockReturnValue({
      comments: [],
    });

    await renderWithProviders(<CommentList postId="1" />);

    expect(screen.getByText('postDetail.comments (0)')).toBeTruthy();
  });
});
