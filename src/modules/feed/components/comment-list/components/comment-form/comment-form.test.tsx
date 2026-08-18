import { fireEvent, renderWithProviders, screen, waitFor } from '@/test/test-utils';

import { CommentForm } from './comment-form';

/**
 * Each field is settled before the next is typed. Three un-awaited `changeText` calls batch into
 * one pending update that outlives the test and leaves the following render unmounted.
 */
const type = async (testID: string, value: string) => {
  fireEvent.changeText(screen.getByTestId(testID), value);

  await screen.findByDisplayValue(value);
};

const valueOf = (testID: string) => screen.getByTestId(testID).props.value;

const submit = () => fireEvent.press(screen.getByTestId('comment-form-submit'));

const fillValidFields = async () => {
  await type('comment-form-name', 'Ada');
  await type('comment-form-email', 'ada@example.com');
  await type('comment-form-body', 'A comment');
};

describe('CommentForm', () => {
  const onSubmit = jest.fn();

  it('should not submit while the form is empty', async () => {
    await renderWithProviders(<CommentForm postId={1} onSubmit={onSubmit} isPending={false} isError={false} />);

    submit();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should not submit while the email is not a valid address', async () => {
    await renderWithProviders(<CommentForm postId={1} onSubmit={onSubmit} isPending={false} isError={false} />);

    await type('comment-form-name', 'Ada');
    await type('comment-form-email', 'nope');
    await type('comment-form-body', 'A comment');
    submit();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should submit the typed values as a create-comment input', async () => {
    await renderWithProviders(<CommentForm postId={7} onSubmit={onSubmit} isPending={false} isError={false} />);

    await fillValidFields();
    submit();

    expect(onSubmit).toHaveBeenCalledWith(
      { postId: 7, name: 'Ada', email: 'ada@example.com', body: 'A comment' },
      expect.any(Function),
    );
  });

  it('should clear every field when the submit reports success', async () => {
    await renderWithProviders(<CommentForm postId={1} onSubmit={onSubmit} isPending={false} isError={false} />);

    await fillValidFields();
    submit();

    const [, onSuccess] = onSubmit.mock.calls[0];
    onSuccess();

    await waitFor(() => expect(valueOf('comment-form-name')).toBe(''));
    expect(valueOf('comment-form-email')).toBe('');
    expect(valueOf('comment-form-body')).toBe('');
  });

  it('should not submit while the mutation is pending, even with a valid form', async () => {
    await renderWithProviders(<CommentForm postId={1} onSubmit={onSubmit} isPending isError={false} />);

    await fillValidFields();
    submit();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should show the error message once the submit has failed', async () => {
    await renderWithProviders(<CommentForm postId={1} onSubmit={onSubmit} isPending={false} isError />);

    expect(screen.getByText('postDetail.commentForm.error')).toBeTruthy();
  });
});
