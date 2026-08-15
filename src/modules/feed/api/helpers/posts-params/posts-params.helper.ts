import { FeedFilters } from '../../../feed.types';
// `FeedPage` is imported type-only so the helper -> feed-api edge is erased at compile time and
// never becomes a runtime require cycle back into the module that consumes this helper.
import type { FeedPage } from '../../feed-api';

/**
 * Builds the jsonplaceholder query parameters axios serializes into the URL. `q` is sent only when
 * truthy and `userId` only when defined, so an absent filter never becomes an empty parameter.
 * @param page - The page and limit the request asks for
 * @param filters - The optional feed filters to translate into query parameters
 * @returns Query parameters object ready for the HTTP request
 */
export const buildPostsParams = ({ page, limit }: FeedPage, { q, userId }: FeedFilters) => ({
  _page: page,
  _limit: limit,
  ...(q ? { q } : {}),
  ...(userId !== undefined ? { userId } : {}),
});
