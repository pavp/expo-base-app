import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { CreateCommentInput } from '../../../../../../feed.types';
import { CreateCommentInputSchema } from '../../../../../../feed.types';

interface UseCommentFormControllerParams {
  postId: number;
  onSubmit: (input: CreateCommentInput, onSuccess: () => void) => void;
}

// `postId` is a default value rather than a field, so the resolver validates the exact object
// the api layer will receive against the one schema both layers share.
export const useCommentFormController = ({ postId, onSubmit }: UseCommentFormControllerParams) => {
  const {
    control,
    formState: { errors, isValid },
    handleSubmit,
    reset,
    setValue,
  } = useForm<CreateCommentInput>({
    mode: 'onTouched',
    defaultValues: { postId, name: '', email: '', body: '' },
    resolver: zodResolver(CreateCommentInputSchema),
  });

  const clear = useCallback(() => reset({ postId, name: '', email: '', body: '' }), [postId, reset]);

  const submit = handleSubmit((input) => onSubmit(input, clear));

  return { control, errors, isValid, submit, clear, setValue };
};
