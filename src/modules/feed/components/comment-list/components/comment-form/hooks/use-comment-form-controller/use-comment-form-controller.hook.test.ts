import { act, renderHookWithProviders, waitFor } from '@/test/test-utils';

import { useCommentFormController } from './use-comment-form-controller.hook';

type Controller = ReturnType<typeof useCommentFormController>;

// `shouldValidate` runs the resolver on each set, which is what the `onTouched` bindings do on
// blur. Without it `isValid` and `errors` would only settle on submit.
const fill = async (result: { current: Controller }, values: Record<string, string>) => {
  for (const [name, value] of Object.entries(values)) {
    await act(async () => {
      result.current.setValue(name as 'name' | 'email' | 'body', value, { shouldValidate: true });
    });
  }
};

const validValues = { name: 'Ada', email: 'ada@example.com', body: 'A comment' };

describe('useCommentFormController', () => {
  const onSubmit = jest.fn();

  it('should start with an invalid form and no errors shown', async () => {
    const { result } = await renderHookWithProviders(() => useCommentFormController({ postId: 1, onSubmit }));

    expect(result.current.isValid).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  it('should stay invalid and surface the email key while the address is malformed', async () => {
    const { result } = await renderHookWithProviders(() => useCommentFormController({ postId: 1, onSubmit }));

    await fill(result, { ...validValues, email: 'not-an-email' });

    await waitFor(() => expect(result.current.isValid).toBe(false));
    expect(result.current.errors.email?.message).toBe('postDetail.commentForm.validation.emailInvalid');
  });

  it('should surface the required key for a blank field', async () => {
    const { result } = await renderHookWithProviders(() => useCommentFormController({ postId: 1, onSubmit }));

    await fill(result, { ...validValues, name: '' });

    await waitFor(() => expect(result.current.isValid).toBe(false));
    expect(result.current.errors.name?.message).toBe('postDetail.commentForm.validation.nameRequired');
  });

  it('should become valid once every field satisfies the create-comment schema', async () => {
    const { result } = await renderHookWithProviders(() => useCommentFormController({ postId: 1, onSubmit }));

    await fill(result, validValues);

    await waitFor(() => expect(result.current.isValid).toBe(true));
    expect(result.current.errors).toEqual({});
  });

  it('should submit the typed input carrying the post id it was given', async () => {
    const { result } = await renderHookWithProviders(() => useCommentFormController({ postId: 42, onSubmit }));

    await fill(result, validValues);
    await act(async () => result.current.submit());

    expect(onSubmit).toHaveBeenCalledWith({ postId: 42, ...validValues }, expect.any(Function));
  });

  it('should not submit while the form is invalid', async () => {
    const { result } = await renderHookWithProviders(() => useCommentFormController({ postId: 1, onSubmit }));

    await fill(result, { ...validValues, email: 'not-an-email' });
    await act(async () => result.current.submit());

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should clear every field back to an invalid form', async () => {
    const { result } = await renderHookWithProviders(() => useCommentFormController({ postId: 1, onSubmit }));

    await fill(result, validValues);
    await act(async () => result.current.clear());

    await waitFor(() => expect(result.current.isValid).toBe(false));
    expect(result.current.errors).toEqual({});
  });
});
