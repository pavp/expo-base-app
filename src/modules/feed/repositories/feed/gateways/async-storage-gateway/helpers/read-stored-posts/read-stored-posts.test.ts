import { getItem } from '@/core/lib/async-storage';
import { generateMockPosts } from '@/test/entities';

import { FEED_POSTS_STORAGE_KEY } from '../../async-storage-gateway.constants';

import { readStoredPosts } from './read-stored-posts.helper';

jest.mock('@/core/lib/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockedGetItem = getItem as jest.MockedFunction<typeof getItem>;

describe('readStoredPosts', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('reads from the posts storage key', async () => {
    mockedGetItem.mockResolvedValue(null);

    await readStoredPosts();

    expect(mockedGetItem).toHaveBeenCalledWith(FEED_POSTS_STORAGE_KEY);
  });

  it('resolves an empty array when nothing was ever written — no seeding, no write-through', async () => {
    mockedGetItem.mockResolvedValue(null);

    const result = await readStoredPosts();

    expect(result).toEqual([]);
  });

  it('resolves the parsed posts when a valid array is stored', async () => {
    const posts = generateMockPosts(3);
    mockedGetItem.mockResolvedValue(posts);

    const result = await readStoredPosts();

    expect(result).toEqual(posts);
  });

  it('falls back to an empty array when the stored payload does not match the schema', async () => {
    mockedGetItem.mockResolvedValue([{ id: 'not-a-number' }]);

    const result = await readStoredPosts();

    expect(result).toEqual([]);
  });

  it('throws an AbortError before reading when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(readStoredPosts(controller.signal)).rejects.toThrow('Aborted');
    expect(mockedGetItem).not.toHaveBeenCalled();
  });
});
