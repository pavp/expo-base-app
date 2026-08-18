import { mockComment } from '@/test/entities';
import { fireEvent, renderWithProviders, screen } from '@/test/test-utils';

import { CommentList } from './comment-list';
import * as useCommentListBusinessHook from './hooks';

jest.mock('./hooks');

// Settled per field: batched `changeText` calls leave an update pending past the test.
const type = async (testID: string, value: string) => {
  fireEvent.changeText(screen.getByTestId(testID), value);

  await screen.findByDisplayValue(value);
};

const businessResult = (overrides = {}) => ({
  comments: [],
  createComment: jest.fn(),
  isCreating: false,
  isCreateError: false,
  ...overrides,
});

describe('CommentList', () => {
  it('should render the comment count and every comment body', async () => {
    jest
      .spyOn(useCommentListBusinessHook, 'useCommentListBusiness')
      .mockReturnValue(businessResult({ comments: [mockComment] }));

    await renderWithProviders(<CommentList postId="1" />);

    expect(screen.getByText('postDetail.comments (1)')).toBeTruthy();
    expect(screen.getByText(mockComment.body)).toBeTruthy();
  });

  it('should render a zero count when there are no comments yet', async () => {
    jest.spyOn(useCommentListBusinessHook, 'useCommentListBusiness').mockReturnValue(businessResult());

    await renderWithProviders(<CommentList postId="1" />);

    expect(screen.getByText('postDetail.comments (0)')).toBeTruthy();
  });

  it('should pass a submitted comment to the business hook', async () => {
    const createComment = jest.fn();
    jest.spyOn(useCommentListBusinessHook, 'useCommentListBusiness').mockReturnValue(businessResult({ createComment }));

    await renderWithProviders(<CommentList postId="3" />);

    await type('comment-form-name', 'Ada');
    await type('comment-form-email', 'ada@example.com');
    await type('comment-form-body', 'A comment');
    fireEvent.press(screen.getByTestId('comment-form-submit'));

    expect(createComment).toHaveBeenCalledWith(
      { postId: 3, name: 'Ada', email: 'ada@example.com', body: 'A comment' },
      expect.any(Function),
    );
  });
});
