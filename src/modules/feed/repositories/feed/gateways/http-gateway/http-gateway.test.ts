import MockAdapter from 'axios-mock-adapter';

import { HttpValidationError } from '@/api/api.types';
import { client } from '@/api/common/client';
import { generateMockPosts, mockComment, mockPost } from '@/test/entities';

import { httpGateway } from './http-gateway';

describe('httpGateway', () => {
  const mock = new MockAdapter(client);

  afterEach(() => {
    mock.reset();
    jest.clearAllMocks();
  });

  it('reports its source info as http, online, with persistence and no realtime', () => {
    const info = httpGateway.getSourceInfo();

    expect(info).toEqual({
      type: 'http',
      name: 'http',
      capabilities: { offline: false, realtime: false, persistence: true },
    });
  });

  describe('findPosts', () => {
    it('delegates to feed-api and returns the validated page', async () => {
      const posts = generateMockPosts(10);
      mock.onGet('posts', { params: { _page: 1, _limit: 10 } }).reply(200, posts);

      const result = await httpGateway.findPosts({ page: 1, limit: 10 });

      expect(result).toEqual(posts);
    });

    it('propagates HttpValidationError when the payload fails PostArraySchema', async () => {
      mock.onGet('posts', { params: { _page: 1, _limit: 10 } }).reply(200, [{ id: 'not-a-number' }]);

      await expect(httpGateway.findPosts({ page: 1, limit: 10 })).rejects.toBeInstanceOf(HttpValidationError);
    });
  });

  describe('findPostById', () => {
    it('delegates to feed-api and returns the validated post', async () => {
      mock.onGet(`posts/${mockPost.id}`).reply(200, mockPost);

      const result = await httpGateway.findPostById(String(mockPost.id));

      expect(result).toEqual(mockPost);
    });
  });

  describe('findCommentsByPostId', () => {
    it('delegates to feed-api and returns the validated comments', async () => {
      const comments = [mockComment];
      mock.onGet(`posts/${mockComment.postId}/comments`).reply(200, comments);

      const result = await httpGateway.findCommentsByPostId(String(mockComment.postId));

      expect(result).toEqual(comments);
    });
  });
});
