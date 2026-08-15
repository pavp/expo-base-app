// `usePostAuthors` moved into `@/modules/feed/hooks` in Phase B Slice 4a (`useDetailPost` became
// `post-detail-view`'s own view-private `usePostDetailBusiness`, since only that view used it).
// This barrel stays only to keep `home-view`/`explore-view` compiling until Slice 4b absorbs
// them too. Do not add anything new here — new feed code belongs in `@/modules/feed`.
export { usePostAuthors } from '@/modules/feed/hooks';
