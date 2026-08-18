import { HttpValidationError } from '@/api/api.types';
import { createMockComment, generateMockPosts, mockComment, mockPost } from '@/test/entities';
import { setupHttpMock } from '@/test/http-mock';

import { feedApi } from './feed-api';

describe('feedApi', () => {
  const mock = setupHttpMock();


  describe('contract', () => {
    it('exposes the whole query surface as callable operations on a single singleton', () => {
      expect(typeof feedApi.getPosts).toBe('function');
      expect(typeof feedApi.getPostById).toBe('function');
      expect(typeof feedApi.getCommentsByPostId).toBe('function');
      expect(typeof feedApi.createComment).toBe('function');
    });
  });

  describe('getPosts', () => {
    it('requests the posts endpoint with page and limit params and no filter params', async () => {
      const posts = generateMockPosts(10);
      mock.onGet('posts', { params: { _page: 1, _limit: 10 } }).reply(200, posts);

      const result = await feedApi.getPosts({}, { page: 1, limit: 10 });

      expect(result).toEqual(posts);
    });

    it('includes q and userId params when supplied', async () => {
      const posts = generateMockPosts(3);
      mock.onGet('posts', { params: { _page: 2, _limit: 10, q: 'hello', userId: 5 } }).reply(200, posts);

      const result = await feedApi.getPosts({ q: 'hello', userId: 5 }, { page: 2, limit: 10 });

      expect(result).toEqual(posts);
    });

    it('omits userId when undefined and omits q when empty, sending neither as a param', async () => {
      const posts = generateMockPosts(2);
      mock.onGet('posts', { params: { _page: 1, _limit: 10, q: 'only-q' } }).reply(200, posts);

      const result = await feedApi.getPosts({ q: 'only-q', userId: undefined }, { page: 1, limit: 10 });

      expect(result).toEqual(posts);
    });

    it('sends userId without q when only userId is supplied', async () => {
      const posts = generateMockPosts(2);
      mock.onGet('posts', { params: { _page: 1, _limit: 10, userId: 5 } }).reply(200, posts);

      const result = await feedApi.getPosts({ userId: 5 }, { page: 1, limit: 10 });

      expect(result).toEqual(posts);
    });

    it('serializes the params into the same query string the endpoint received', async () => {
      mock.onGet('posts').reply(200, generateMockPosts(1));

      await feedApi.getPosts({ q: 'hello', userId: 5 }, { page: 2, limit: 10 });

      expect(mock.history.get[0].params).toEqual({ _page: 2, _limit: 10, q: 'hello', userId: 5 });
    });

    it('validates the response against PostArraySchema and throws HttpValidationError on mismatch', async () => {
      mock.onGet('posts').reply(200, [{ id: 'not-a-number' }]);

      await expect(feedApi.getPosts({}, { page: 1, limit: 10 })).rejects.toBeInstanceOf(HttpValidationError);
    });

    it('forwards the abort signal to the underlying request', async () => {
      const controller = new AbortController();
      mock.onGet('posts').reply(() => {
        controller.abort();

        return [200, generateMockPosts(1)];
      });

      await feedApi
        .getPosts({}, { page: 1, limit: 10 }, { signal: controller.signal })
        .catch((reason: unknown) => reason);

      expect(controller.signal.aborted).toBe(true);
    });
  });

  describe('getPostById', () => {
    it('builds the exact URL for a single post and validates against PostSchema', async () => {
      mock.onGet(`posts/${mockPost.id}`).reply(200, mockPost);

      const result = await feedApi.getPostById(String(mockPost.id));

      expect(result).toEqual(mockPost);
    });

    it('throws HttpValidationError when the payload does not match PostSchema', async () => {
      mock.onGet('posts/999').reply(200, { id: 999 });

      await expect(feedApi.getPostById('999')).rejects.toBeInstanceOf(HttpValidationError);
    });

    it('forwards the abort signal to the underlying request', async () => {
      const controller = new AbortController();
      mock.onGet('posts/1').reply(() => {
        controller.abort();

        return [200, mockPost];
      });

      await feedApi.getPostById('1', { signal: controller.signal }).catch((reason: unknown) => reason);

      expect(controller.signal.aborted).toBe(true);
    });
  });

  describe('getCommentsByPostId', () => {
    it('builds the exact URL for a post’s comments and validates against CommentArraySchema', async () => {
      const comments = [mockComment];
      mock.onGet(`posts/${mockComment.postId}/comments`).reply(200, comments);

      const result = await feedApi.getCommentsByPostId(String(mockComment.postId));

      expect(result).toEqual(comments);
    });

    it('throws HttpValidationError when a comment payload does not match CommentArraySchema', async () => {
      mock.onGet('posts/1/comments').reply(200, [{ id: 1 }]);

      await expect(feedApi.getCommentsByPostId('1')).rejects.toBeInstanceOf(HttpValidationError);
    });

    it('rejects an otherwise complete comment whose postId arrives as a string', async () => {
      mock.onGet('posts/1/comments').reply(200, [{ ...mockComment, postId: String(mockComment.postId) }]);

      await expect(feedApi.getCommentsByPostId('1')).rejects.toBeInstanceOf(HttpValidationError);
    });
  });

  describe('createComment', () => {
    it('posts the submitted comment to the flat comments collection and returns the created comment', async () => {
      const created = createMockComment({ postId: 1, email: 'a@b.com', body: 'hello world' });
      mock.onPost('comments').reply(201, created);

      const result = await feedApi.createComment({
        postId: created.postId,
        name: created.name,
        email: created.email,
        body: created.body,
      });

      expect(result).toEqual(created);
      expect(mock.history.post[0].url).toBe('comments');
      expect(JSON.parse(String(mock.history.post[0].data))).toEqual({
        postId: created.postId,
        name: created.name,
        email: created.email,
        body: created.body,
      });
    });

    it('rejects an input whose email is not an address without reaching the network', async () => {
      mock.onPost('comments').reply(201, mockComment);

      await expect(
        feedApi.createComment({ postId: 1, name: 'someone', email: 'not-an-email', body: 'hello world' }),
      ).rejects.toBeInstanceOf(Error);
      expect(mock.history.post).toHaveLength(0);
    });

    it('rejects an empty body without reaching the network', async () => {
      mock.onPost('comments').reply(201, mockComment);

      await expect(
        feedApi.createComment({ postId: 1, name: 'someone', email: 'a@b.com', body: '' }),
      ).rejects.toBeInstanceOf(Error);
      expect(mock.history.post).toHaveLength(0);
    });

    it('throws HttpValidationError when the created comment payload does not match CommentSchema', async () => {
      mock.onPost('comments').reply(201, { postId: 1 });

      await expect(
        feedApi.createComment({ postId: 1, name: 'someone', email: 'a@b.com', body: 'hello world' }),
      ).rejects.toBeInstanceOf(HttpValidationError);
    });
  });
});
