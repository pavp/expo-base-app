import { z } from 'zod';

/**
 * Verified against a live `jsonplaceholder` response (`GET /posts?_limit=1`) on 2026-08-15: the
 * real payload shape matches `test/entities/post.mock.ts` exactly — `id`, `userId` numbers,
 * `title`/`body` strings, no extra or missing fields. No schema/fixture drift found.
 */
export const PostSchema = z.object({
  id: z.number(),
  title: z.string(),
  body: z.string(),
  userId: z.number(),
});

export const PostArraySchema = z.array(PostSchema);

export type Post = z.infer<typeof PostSchema>;

/**
 * Verified against a live `jsonplaceholder` response (`GET /comments?postId=1&_limit=1`) on
 * 2026-08-15: the real payload shape matches `test/entities/comment.mock.ts` exactly — `postId`,
 * `id` numbers, `name`/`body`/`email` strings, no extra or missing fields.
 */
export const CommentSchema = z.object({
  postId: z.number(),
  id: z.number(),
  name: z.string(),
  body: z.string(),
  email: z.string(),
});

export const CommentArraySchema = z.array(CommentSchema);

export type Comment = z.infer<typeof CommentSchema>;

/**
 * Verified against the live `jsonplaceholder` endpoint (`POST /comments`) on 2026-08-18: the body
 * `{ postId, name, email, body }` is accepted with HTTP 201 and echoed back with a server-assigned
 * `id`, so the input carries no `id` of its own. The server does not persist — a later GET still
 * returns the original comments.
 */
export const CreateCommentInputSchema = z.object({
  postId: z.number(),
  name: z.string().min(1),
  email: z.email(),
  body: z.string().min(1),
});

export type CreateCommentInput = z.infer<typeof CreateCommentInputSchema>;

export const FeedFiltersSchema = z.object({
  /** Full-text search across the post title and body. */
  q: z.string().optional(),
  /** Restrict results to a single author. */
  userId: z.number().optional(),
});

export type FeedFilters = z.infer<typeof FeedFiltersSchema>;
