import { getItem } from '@/core/lib/async-storage';
import { mockComment } from '@/test/entities/comment.mock';
import { generateMockPosts, mockPost } from '@/test/entities/post.mock';

import { asyncStorageGateway } from './async-storage-gateway';

jest.mock('@/core/lib/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockedGetItem = getItem as jest.MockedFunction<typeof getItem>;

describe('asyncStorageGateway', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('reports its source info as asyncStorage, offline, with persistence and no realtime', () => {
    const info = asyncStorageGateway.getSourceInfo();

    expect(info).toEqual({
      type: 'asyncStorage',
      name: 'asyncStorage',
      capabilities: { offline: true, realtime: false, persistence: true },
    });
  });

  describe('findPosts', () => {
    it('resolves an empty array when no prior write exists — no seeding, no write-through', async () => {
      mockedGetItem.mockResolvedValue(null);

      const result = await asyncStorageGateway.findPosts({ page: 1, limit: 10 });

      expect(result).toEqual([]);
      expect(mockedGetItem).toHaveBeenCalledTimes(1);
    });

    it('parses a previously stored array when one is present', async () => {
      const posts = generateMockPosts(3);
      mockedGetItem.mockResolvedValue(posts);

      const result = await asyncStorageGateway.findPosts({ page: 1, limit: 10 });

      expect(result).toEqual(posts);
    });

    it('throws when the signal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort();
      mockedGetItem.mockResolvedValue(null);

      await expect(
        asyncStorageGateway.findPosts({ page: 1, limit: 10 }, { signal: controller.signal }),
      ).rejects.toThrow();
    });
  });

  describe('findPostById', () => {
    it('resolves the matching post from a stored array', async () => {
      mockedGetItem.mockResolvedValue([mockPost]);

      const result = await asyncStorageGateway.findPostById(String(mockPost.id));

      expect(result).toEqual(mockPost);
    });

    it('rejects when no matching post exists in storage', async () => {
      mockedGetItem.mockResolvedValue(null);

      await expect(asyncStorageGateway.findPostById('999')).rejects.toThrow();
    });
  });

  describe('findCommentsByPostId', () => {
    it('resolves an empty array when no prior write exists', async () => {
      mockedGetItem.mockResolvedValue(null);

      const result = await asyncStorageGateway.findCommentsByPostId(String(mockComment.postId));

      expect(result).toEqual([]);
    });

    it('parses a previously stored comments array when one is present', async () => {
      mockedGetItem.mockResolvedValue([mockComment]);

      const result = await asyncStorageGateway.findCommentsByPostId(String(mockComment.postId));

      expect(result).toEqual([mockComment]);
    });
  });
});
