import * as userHooks from '@/api/user';
import { generateMockUsers } from '@/test/entities';
import { renderHookWithProviders } from '@/test/test-utils';

import { usePostAuthors } from './use-post-authors';

jest.mock('@/api/user');

describe('usePostAuthors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should map every user id to its name', async () => {
    const users = generateMockUsers(3);

    jest.spyOn(userHooks, 'useGetUsers').mockReturnValue({ data: users } as any);

    const { result } = await renderHookWithProviders(() => usePostAuthors());

    expect(result.current.size).toBe(users.length);
    users.forEach(({ id, name }) => {
      expect(result.current.get(id)).toBe(name);
    });
  });

  it('should return an empty map while the users have not arrived', async () => {
    jest.spyOn(userHooks, 'useGetUsers').mockReturnValue({ data: undefined } as any);

    const { result } = await renderHookWithProviders(() => usePostAuthors());

    expect(result.current.size).toBe(0);
    expect(result.current.get(1)).toBeUndefined();
  });
});
