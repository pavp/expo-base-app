import { getItem } from '@/core/lib/async-storage';
import { mockComment } from '@/test/entities';

import { FEED_COMMENTS_STORAGE_KEY_PREFIX } from '../../async-storage-gateway.constants';

import { readStoredComments } from './read-stored-comments.helper';

jest.mock('@/core/lib/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockedGetItem = getItem as jest.MockedFunction<typeof getItem>;

describe('readStoredComments', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('reads from the per-post comments key built from the shared prefix', async () => {
    mockedGetItem.mockResolvedValue(null);

    await readStoredComments('7');

    expect(mockedGetItem).toHaveBeenCalledWith(`${FEED_COMMENTS_STORAGE_KEY_PREFIX}7`);
  });

  it('resolves an empty array when nothing was ever written — no seeding, no write-through', async () => {
    mockedGetItem.mockResolvedValue(null);

    const result = await readStoredComments('1');

    expect(result).toEqual([]);
  });

  it('resolves the parsed comments when a valid array is stored', async () => {
    mockedGetItem.mockResolvedValue([mockComment]);

    const result = await readStoredComments(String(mockComment.postId));

    expect(result).toEqual([mockComment]);
  });

  it('falls back to an empty array when the stored payload does not match the schema', async () => {
    mockedGetItem.mockResolvedValue([{ id: 1 }]);

    const result = await readStoredComments('1');

    expect(result).toEqual([]);
  });

  it('throws an AbortError before reading when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(readStoredComments('1', controller.signal)).rejects.toThrow('Aborted');
    expect(mockedGetItem).not.toHaveBeenCalled();
  });
});
