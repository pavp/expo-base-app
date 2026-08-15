import { mockComment } from '@/test/entities/comment.mock';
import { generateMockPosts, mockPost } from '@/test/entities/post.mock';

// Zod schemas are runtime values, not type-only imports, so `@babel/preset-typescript` cannot
// erase this import before module resolution runs (unlike the type-only-import gotcha documented
// in `react-query.types.test.ts`). Verified: before this file existed, running this suite failed
// with `Cannot find module './feed.types'` — a genuine RED, no side-effect import needed here.
import { CommentSchema, FeedFiltersSchema, PostSchema } from './feed.types';

describe('feed.types', () => {
  describe('PostSchema', () => {
    it('parses a single post fixture', () => {
      const result = PostSchema.safeParse(mockPost);

      expect(result.success).toBe(true);
    });

    it('parses every post in a generated fixture batch', () => {
      const posts = generateMockPosts(5);
      const results = posts.map((post) => PostSchema.safeParse(post));

      expect(results.every((result) => result.success)).toBe(true);
    });

    it('rejects a payload missing a required field', () => {
      const { title, ...withoutTitle } = mockPost;
      const result = PostSchema.safeParse(withoutTitle);

      expect(result.success).toBe(false);
    });

    it('rejects a payload with a mistyped field', () => {
      const result = PostSchema.safeParse({ ...mockPost, userId: String(mockPost.userId) });

      expect(result.success).toBe(false);
    });
  });

  describe('CommentSchema', () => {
    it('parses a single comment fixture', () => {
      const result = CommentSchema.safeParse(mockComment);

      expect(result.success).toBe(true);
    });

    it('rejects a payload missing a required field', () => {
      const { email, ...withoutEmail } = mockComment;
      const result = CommentSchema.safeParse(withoutEmail);

      expect(result.success).toBe(false);
    });

    it('rejects a payload with a mistyped field', () => {
      const result = CommentSchema.safeParse({ ...mockComment, postId: String(mockComment.postId) });

      expect(result.success).toBe(false);
    });
  });

  describe('FeedFiltersSchema', () => {
    it('accepts an empty object — every filter is optional', () => {
      const result = FeedFiltersSchema.safeParse({});

      expect(result.success).toBe(true);
    });

    it('accepts a partial filter set', () => {
      const result = FeedFiltersSchema.safeParse({ q: 'hello' });

      expect(result.success).toBe(true);
    });

    it('rejects a mistyped userId filter', () => {
      const result = FeedFiltersSchema.safeParse({ userId: 'not-a-number' });

      expect(result.success).toBe(false);
    });
  });
});
