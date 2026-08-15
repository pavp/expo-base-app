import type { QueryClient } from '@tanstack/react-query';

// Side-effect import forces Jest to resolve the module at runtime, so a missing file fails the
// suite with "Cannot find module" instead of silently vanishing when Babel strips the type-only
// import below during the TypeScript transform.
import './react-query.types';

import type { BaseRepository, InfiniteQueryOptions, MutationOptions, QueryOptions } from './react-query.types';

describe('react-query.types', () => {
  it('accepts a repository that only implements the optional cancel map', () => {
    const stubRepository: BaseRepository = {
      cancel: {
        cancelList: async (_queryClient: QueryClient) => undefined,
      },
    };

    expect(stubRepository.cancel).toBeDefined();
  });

  it('accepts a repository with no members at all (both cancel and prefetch stay optional)', () => {
    const emptyRepository: BaseRepository = {};

    expect(emptyRepository).toEqual({});
  });

  it('rejects QueryOptions callers that try to supply queryKey or queryFn', () => {
    // @ts-expect-error queryKey is owned by the repository, never by the caller.
    const withQueryKey: QueryOptions<string> = { queryKey: ['x'] };
    // @ts-expect-error queryFn is owned by the repository, never by the caller.
    const withQueryFn: QueryOptions<string> = { queryFn: async () => 'x' };

    expect(withQueryKey).toBeDefined();
    expect(withQueryFn).toBeDefined();
  });

  it('allows QueryOptions callers to supply an unrelated option such as enabled', () => {
    const validOptions: QueryOptions<string> = { enabled: false };

    expect(validOptions).toEqual({ enabled: false });
  });

  it('rejects InfiniteQueryOptions callers that try to override the pagination contract', () => {
    // @ts-expect-error getNextPageParam is owned by the repository's query-options builder.
    const withGetNextPageParam: InfiniteQueryOptions<string> = { getNextPageParam: () => undefined };
    // @ts-expect-error initialPageParam is owned by the repository's query-options builder.
    const withInitialPageParam: InfiniteQueryOptions<string> = { initialPageParam: 1 };

    expect(withGetNextPageParam).toBeDefined();
    expect(withInitialPageParam).toBeDefined();
  });

  it('allows InfiniteQueryOptions callers to supply an unrelated option such as enabled', () => {
    const validOptions: InfiniteQueryOptions<string> = { enabled: false };

    expect(validOptions).toEqual({ enabled: false });
  });

  it('rejects MutationOptions callers that try to supply mutationFn', () => {
    // @ts-expect-error mutationFn is owned by the repository, never by the caller.
    const withMutationFn: MutationOptions<string, { id: string }> = { mutationFn: async () => 'x' };

    expect(withMutationFn).toBeDefined();
  });

  it('allows MutationOptions callers to supply an unrelated option such as onSuccess', () => {
    const validOptions: MutationOptions<string, { id: string }> = { onSuccess: () => undefined };

    expect(validOptions).toBeDefined();
  });
});
