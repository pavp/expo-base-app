// Deliberate parity placeholder (design decision D7 / ruling Q2): no Phase B consumer seeds these
// keys or writes through from the HTTP gateway, so an empty read is expected and correct, not a
// bug. `local` storage being indistinguishable from an API failure is accepted for this phase.
export const FEED_POSTS_STORAGE_KEY = 'feed.posts';
export const FEED_COMMENTS_STORAGE_KEY_PREFIX = 'feed.comments.';
