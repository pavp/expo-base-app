import { getItem } from '@/core/lib/async-storage';

import { Comment, CommentArraySchema } from '../../../../../../feed.types';
import { FEED_COMMENTS_STORAGE_KEY_PREFIX } from '../../async-storage-gateway.constants';

/**
 * Reads the stored comments for a single post, falling back to an empty array whenever nothing was
 * ever written or the stored payload no longer matches the schema.
 * @param postId - The post whose comments key is read
 * @param signal - Optional abort signal, checked before the read is issued
 * @returns The parsed comments, or an empty array when absent or malformed
 * @throws DOMException when the signal is already aborted
 */
export const readStoredComments = async (postId: string, signal?: AbortSignal): Promise<Comment[]> => {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const stored = await getItem(`${FEED_COMMENTS_STORAGE_KEY_PREFIX}${postId}`);
  const parsed = CommentArraySchema.safeParse(stored);

  return parsed.success ? parsed.data : [];
};
