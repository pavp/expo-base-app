// `CommentList` and `PostDetailView` moved into `@/modules/feed` in Phase B Slice 4a. This module
// has no more public barrel consumers — `home-view`/`explore-view` still reach into
// `@/modules/post/components` and `@/modules/post/hooks` directly (their own TD-6 debt, absorbed
// in Slice 4b). Slice 5 deletes this module entirely once 4b lands.
export {};
