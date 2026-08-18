import { act, renderHookWithProviders } from '@/test/test-utils';

import { useCommentFormController } from './use-comment-form-controller.hook';

const fillValidFields = (setters: {
  setName: (value: string) => void;
  setEmail: (value: string) => void;
  setBody: (value: string) => void;
}) => {
  setters.setName('Ada');
  setters.setEmail('ada@example.com');
  setters.setBody('A comment');
};

describe('useCommentFormController', () => {
  it('should start with empty fields and an invalid form', async () => {
    const { result } = await renderHookWithProviders(() => useCommentFormController(1));

    expect(result.current.name).toBe('');
    expect(result.current.email).toBe('');
    expect(result.current.body).toBe('');
    expect(result.current.isValid).toBe(false);
  });

  it('should stay invalid while the email is not a valid address', async () => {
    const { result } = await renderHookWithProviders(() => useCommentFormController(1));

    await act(async () => {
      result.current.setName('Ada');
      result.current.setEmail('not-an-email');
      result.current.setBody('A comment');
    });

    expect(result.current.isValid).toBe(false);
  });

  it('should stay invalid while a required field is blank', async () => {
    const { result } = await renderHookWithProviders(() => useCommentFormController(1));

    await act(async () => {
      result.current.setEmail('ada@example.com');
      result.current.setBody('A comment');
    });

    expect(result.current.isValid).toBe(false);
  });

  it('should become valid once every field satisfies the create-comment schema', async () => {
    const { result } = await renderHookWithProviders(() => useCommentFormController(1));

    await act(async () => fillValidFields(result.current));

    expect(result.current.isValid).toBe(true);
  });

  it('should expose the typed input carrying the post id it was given', async () => {
    const { result } = await renderHookWithProviders(() => useCommentFormController(42));

    await act(async () => fillValidFields(result.current));

    expect(result.current.input).toEqual({
      postId: 42,
      name: 'Ada',
      email: 'ada@example.com',
      body: 'A comment',
    });
  });

  it('should clear every field', async () => {
    const { result } = await renderHookWithProviders(() => useCommentFormController(1));

    await act(async () => fillValidFields(result.current));
    await act(async () => result.current.clear());

    expect(result.current.name).toBe('');
    expect(result.current.email).toBe('');
    expect(result.current.body).toBe('');
    expect(result.current.isValid).toBe(false);
  });
});
