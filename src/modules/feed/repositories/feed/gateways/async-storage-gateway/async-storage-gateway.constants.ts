// The comments key now has a writer: `useCreateComment` persists the post's list on success, so a
// read here returns real data and a locally created comment survives a restart.
// The posts key is still never written — nothing seeds it and the HTTP gateway does not write
// through — so an empty `local` posts result remains expected, not a bug.
export const FEED_POSTS_STORAGE_KEY = 'feed.posts';
export const FEED_COMMENTS_STORAGE_KEY_PREFIX = 'feed.comments.';
