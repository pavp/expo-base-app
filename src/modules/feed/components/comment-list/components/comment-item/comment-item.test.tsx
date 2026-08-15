import { mockComment } from '@/test/entities/comment.mock';
import { render, screen } from '@/test/test-utils';

import { CommentItem } from './comment-item';

describe('CommentItem', () => {
  it('should render the comment name, email and body', async () => {
    await render(<CommentItem comment={mockComment} />);

    expect(screen.getByText(mockComment.name)).toBeTruthy();
    expect(screen.getByText(mockComment.email)).toBeTruthy();
    expect(screen.getByText(mockComment.body)).toBeTruthy();
  });

  it('should render an avatar for the comment author', async () => {
    await render(<CommentItem comment={mockComment} />);

    expect(screen.getByTestId('comment-avatar')).toBeTruthy();
  });
});
