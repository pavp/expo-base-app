// Nothing in the app writes to these keys yet — the HTTP gateway does not write through, and no
// screen seeds them — so a read here returning empty is expected, not a bug. The local gateway
// exists to keep the two gateways interchangeable until a caller starts populating them; until
// then an empty `local` result is indistinguishable from an API failure, which is accepted.
export const FEED_POSTS_STORAGE_KEY = 'feed.posts';
export const FEED_COMMENTS_STORAGE_KEY_PREFIX = 'feed.comments.';
