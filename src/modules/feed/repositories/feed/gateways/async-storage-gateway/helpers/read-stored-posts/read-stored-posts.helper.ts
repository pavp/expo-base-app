import { getItem } from '@/core/lib/async-storage';

import { Post, PostArraySchema } from '../../../../../../feed.types';
import { FEED_POSTS_STORAGE_KEY } from '../../async-storage-gateway.constants';

/**
 * Reads the stored posts array, falling back to an empty array whenever nothing was ever written
 * or the stored payload no longer matches the schema.
 * @param signal - Optional abort signal, checked before the read is issued
 * @returns The parsed posts, or an empty array when absent or malformed
 * @throws DOMException when the signal is already aborted
 */
export const readStoredPosts = async (signal?: AbortSignal): Promise<Post[]> => {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const stored = await getItem(FEED_POSTS_STORAGE_KEY);
  const parsed = PostArraySchema.safeParse(stored);

  return parsed.success ? parsed.data : [];
};
