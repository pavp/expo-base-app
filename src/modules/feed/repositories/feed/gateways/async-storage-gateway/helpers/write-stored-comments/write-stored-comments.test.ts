import { setItem } from '@/core/lib/async-storage';
import { createMockComment, generateMockComments } from '@/test/entities';

import { FEED_COMMENTS_STORAGE_KEY_PREFIX } from '../../async-storage-gateway.constants';

import { writeStoredComments } from './write-stored-comments.helper';

jest.mock('@/core/lib/async-storage');

const mockedSetItem = setItem as jest.MockedFunction<typeof setItem>;

describe('writeStoredComments', () => {

  it('writes to the per-post comments key built from the shared prefix', async () => {
    // Arrange
    const comments = generateMockComments(2, { postId: 7 });

    // Act
    await writeStoredComments('7', comments);

    // Assert
    expect(mockedSetItem).toHaveBeenCalledWith(`${FEED_COMMENTS_STORAGE_KEY_PREFIX}7`, comments);
  });

  it('writes the whole list, so the key mirrors the post rather than accumulating single comments', async () => {
    // Arrange
    const comments = [createMockComment({ id: 1 }), createMockComment({ id: 2 })];

    // Act
    await writeStoredComments('1', comments);

    // Assert
    expect(mockedSetItem).toHaveBeenCalledTimes(1);
    expect(mockedSetItem.mock.calls[0][1]).toEqual(comments);
  });

  it('writes an empty array rather than removing the key, so a read still resolves a valid list', async () => {
    // Act
    await writeStoredComments('1', []);

    // Assert
    expect(mockedSetItem).toHaveBeenCalledWith(`${FEED_COMMENTS_STORAGE_KEY_PREFIX}1`, []);
  });

  it('resolves instead of throwing when the underlying write fails', async () => {
    // Arrange
    mockedSetItem.mockRejectedValue(new Error('storage full'));

    // Act & Assert
    await expect(writeStoredComments('1', [createMockComment()])).resolves.toBeUndefined();
  });
});
