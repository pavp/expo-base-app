import type {
  InfiniteData,
  QueryClient,
  QueryKey,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';

/**
 * Options a caller may pass into a repository query hook. `queryKey` and `queryFn` are owned by
 * the repository, not the caller — passing either would bypass the gateway (and with it, Zod
 * validation) or desync the cache key from the repository's own key factory.
 *
 * `TQueryKey` defaults to the library's own `QueryKey` (`readonly unknown[]`) so existing callers
 * that only supply `TData` are unaffected. A repository hook that spreads `{...baseOptions,
 * ...options}` into `useQuery` should pass its own literal key tuple type here — otherwise
 * TypeScript infers `TQueryKey` from this default, which is wider than the concrete tuple
 * `queryOptions()` tags onto `baseOptions.queryKey`, and rejects the merge.
 */
export type QueryOptions<TData, TQueryKey extends QueryKey = QueryKey> = Partial<
  Omit<UseQueryOptions<TData, Error, TData, TQueryKey>, 'queryKey' | 'queryFn'>
>;

/**
 * Same contract as `QueryOptions`, for paginated queries. Additionally omits `getNextPageParam`
 * and `initialPageParam`, which the repository's query-options builder owns exclusively — a
 * caller cannot override the pagination contract. See `QueryOptions`'s note on `TQueryKey`;
 * `TPageParam` needs the same treatment — it defaults to `unknown` here but `infiniteQueryOptions`
 * infers a concrete type (e.g. `number`) from its own `initialPageParam`, so a hook merging
 * `{...baseOptions, ...options}` must pin this too or the merge is rejected the same way.
 */
export type InfiniteQueryOptions<TData, TQueryKey extends QueryKey = QueryKey, TPageParam = unknown> = Partial<
  Omit<
    UseInfiniteQueryOptions<TData, Error, InfiniteData<TData, TPageParam>, TQueryKey, TPageParam>,
    'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'
  >
>;

/**
 * Options a caller may pass into a repository mutation hook. `mutationFn` is owned by the
 * repository, not the caller, for the same reason `queryFn` is excluded from `QueryOptions`.
 *
 * `TContext` is what `onMutate` returns and `onError` receives back, so an optimistic mutation's
 * cache snapshot stays typed through the rollback instead of needing a cast at `setQueryData`. It
 * defaults to `unknown`, so callers that only supply `TData`/`TVariables` are unaffected.
 */
export type MutationOptions<TData, TVariables, TContext = unknown> = Partial<
  Omit<UseMutationOptions<TData, Error, TVariables, TContext>, 'mutationFn'>
>;

/**
 * Structural contract every feature repository implements. `cancel` is optional: a repository with
 * no cancellable queries omits it entirely. It takes the app's `QueryClient` as its first
 * parameter — the caller injects it — so this file never imports the app-layer singleton and
 * `@/core/lib` stays free of an app-layer dependency.
 */
export interface BaseRepository {
  cancel?: Record<string, (queryClient: QueryClient, ...args: unknown[]) => Promise<void>>;
}
