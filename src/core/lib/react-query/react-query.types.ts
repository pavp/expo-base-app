import type { QueryClient, UseInfiniteQueryOptions, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';

/**
 * Options a caller may pass into a repository query hook. `queryKey` and `queryFn` are owned by
 * the repository, not the caller — passing either would bypass the gateway (and with it, Zod
 * validation) or desync the cache key from the repository's own key factory.
 */
export type QueryOptions<TData> = Partial<Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>>;

/**
 * Same contract as `QueryOptions`, for paginated queries. Additionally omits `getNextPageParam`
 * and `initialPageParam`, which the repository's query-options builder owns exclusively — a
 * caller cannot override the pagination contract.
 */
export type InfiniteQueryOptions<TData> = Partial<
  Omit<
    UseInfiniteQueryOptions<TData, Error>,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >
>;

/**
 * Options a caller may pass into a repository mutation hook. `mutationFn` is owned by the
 * repository, not the caller, for the same reason `queryFn` is excluded from `QueryOptions`.
 */
export type MutationOptions<TData, TVariables> = Partial<
  Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
>;

/**
 * Structural contract every feature repository implements. Both members are optional: a
 * query-only repository (no mutations) implements neither, and a repository with no cancellable
 * queries implements neither either. `cancel` takes the app's `QueryClient` as its first
 * parameter — the caller injects it — so this file never imports the app-layer singleton and
 * `@/core/lib` stays free of an app-layer dependency.
 */
export interface BaseRepository {
  cancel?: Record<string, (queryClient: QueryClient, ...args: unknown[]) => Promise<void>>;
}
