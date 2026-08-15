import MockAdapter from 'axios-mock-adapter';

import { HttpValidationError } from '@/api/api.types';
import { client } from '@/api/common/client';
import { mockComment } from '@/test/entities/comment.mock';
import { generateMockPosts, mockPost } from '@/test/entities/post.mock';

import { fetchComments, fetchPostById, fetchPosts } from './feed-api';

describe('feed-api', () => {
  const mock = new MockAdapter(client);

  afterEach(() => {
    mock.reset();
    jest.clearAllMocks();
  });

  describe('fetchPosts', () => {
    it('builds the exact URL and query string for a page with no filters', async () => {
      const posts = generateMockPosts(10);
      mock.onGet('posts?_page=1&_limit=10').reply(200, posts);

      const result = await fetchPosts({}, { page: 1, limit: 10 });

      expect(result).toEqual(posts);
    });

    it('includes q and userId in the query string when supplied', async () => {
      const posts = generateMockPosts(3);
      mock.onGet('posts?_page=2&_limit=10&q=hello&userId=5').reply(200, posts);

      const result = await fetchPosts({ q: 'hello', userId: 5 }, { page: 2, limit: 10 });

      expect(result).toEqual(posts);
    });

    it('omits q when not supplied and omits userId when undefined', async () => {
      const posts = generateMockPosts(2);
      mock.onGet('posts?_page=1&_limit=10&q=only-q').reply(200, posts);

      const result = await fetchPosts({ q: 'only-q', userId: undefined }, { page: 1, limit: 10 });

      expect(result).toEqual(posts);
    });

    it('validates the response against PostArraySchema and throws HttpValidationError on mismatch', async () => {
      mock.onGet('posts?_page=1&_limit=10').reply(200, [{ id: 'not-a-number' }]);

      await expect(fetchPosts({}, { page: 1, limit: 10 })).rejects.toBeInstanceOf(HttpValidationError);
    });

    it('forwards the abort signal to the underlying request', async () => {
      const controller = new AbortController();
      mock.onGet('posts?_page=1&_limit=10').reply(() => {
        controller.abort();

        return [200, generateMockPosts(1)];
      });

      await fetchPosts({}, { page: 1, limit: 10, signal: controller.signal }).catch((reason: unknown) => reason);

      expect(controller.signal.aborted).toBe(true);
    });
  });

  describe('fetchPostById', () => {
    it('builds the exact URL for a single post and validates against PostSchema', async () => {
      mock.onGet(`posts/${mockPost.id}`).reply(200, mockPost);

      const result = await fetchPostById(String(mockPost.id));

      expect(result).toEqual(mockPost);
    });

    it('throws HttpValidationError when the payload does not match PostSchema', async () => {
      mock.onGet('posts/999').reply(200, { id: 999 });

      await expect(fetchPostById('999')).rejects.toBeInstanceOf(HttpValidationError);
    });
  });

  describe('fetchComments', () => {
    it('builds the exact URL for a post’s comments and validates against CommentArraySchema', async () => {
      const comments = [mockComment];
      mock.onGet(`posts/${mockComment.postId}/comments`).reply(200, comments);

      const result = await fetchComments(String(mockComment.postId));

      expect(result).toEqual(comments);
    });

    it('throws HttpValidationError when a comment payload does not match CommentArraySchema', async () => {
      mock.onGet('posts/1/comments').reply(200, [{ id: 1 }]);

      await expect(fetchComments('1')).rejects.toBeInstanceOf(HttpValidationError);
    });
  });
});
