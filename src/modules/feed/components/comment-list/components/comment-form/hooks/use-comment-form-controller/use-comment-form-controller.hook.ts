import { useCallback, useMemo, useState } from 'react';

import type { CreateCommentInput } from '../../../../../../feed.types';
import { CreateCommentInputSchema } from '../../../../../../feed.types';

/**
 * Validity comes from the same schema the api layer validates against, so the button cannot
 * enable for an input the request would then reject.
 */
export const useCommentFormController = (postId: number) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');

  const input: CreateCommentInput = useMemo(
    () => ({ postId, name, email, body }),
    [postId, name, email, body],
  );

  const isValid = useMemo(() => CreateCommentInputSchema.safeParse(input).success, [input]);

  const clear = useCallback(() => {
    setName('');
    setEmail('');
    setBody('');
  }, []);

  return { name, setName, email, setEmail, body, setBody, input, isValid, clear };
};
