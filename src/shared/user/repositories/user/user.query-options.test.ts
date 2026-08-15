import { userQueryOptions } from './user.query-options';

describe('userQueryOptions.list', () => {
  it('builds a list query key with no dataSource segment (design decision D1)', () => {
    const { queryKey } = userQueryOptions.list();

    expect(queryKey).toEqual(['user', 'list']);
  });
});

describe('userQueryOptions.detail', () => {
  it('builds a detail query key from the user id', () => {
    const { queryKey } = userQueryOptions.detail(1);

    expect(queryKey).toEqual(['user', 'detail', 1]);
  });

  it('is enabled when a truthy id is supplied', () => {
    const { enabled } = userQueryOptions.detail(1);

    expect(enabled).toBe(true);
  });

  it('is disabled when no id is supplied', () => {
    const { enabled } = userQueryOptions.detail(0);

    expect(enabled).toBe(false);
  });
});
