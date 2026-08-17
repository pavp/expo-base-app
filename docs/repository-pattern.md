# Repository Pattern

The Repository Pattern provides a single, typed entry point for a module's data access, hiding the caching library and
the data source behind an interface the rest of the application can call without knowing either.

## Purpose

- **One entry point**: every read and write for an entity goes through one object
- **Cache ownership**: query keys, stale times, and invalidation live in one place instead of being spelled at call
  sites
- **Type safety**: the repository's interface is declared before it is implemented, so a missing hook is a compile
  error
- **Substitutability**: consumers depend on the repository, not on the caching library's hooks

## Structure

```
repositories/<entity>/
├── <entity>.repository.keys.ts      # Query key factory
├── <entity>.query-options.ts        # Options builders — caching and pagination
├── <entity>.repository.queries.ts   # Exported read hooks
├── <entity>.repository.mutations.ts # Exported write hooks (when the entity is writable)
├── <entity>.repository.types.ts     # The repository's own interface
├── index.ts                         # The singleton
└── gateways/                        # Data sources (omit when there is only one)
```

## Implementation

### 1. Query Key Factory

Keys are built by a factory so no two call sites can spell the same entry differently. Each level narrows the one
above it, which is what makes partial invalidation possible:

```typescript
export const entityQueryKeys = {
  all: ['entity'] as const,
  lists: (dataSource: DataSource = 'http') => [...entityQueryKeys.all, 'list', dataSource] as const,
  list: (filters: EntityFilters = {}, dataSource: DataSource = 'http') =>
    [...entityQueryKeys.lists(dataSource), filters] as const,
  details: (dataSource: DataSource = 'http') => [...entityQueryKeys.all, 'detail', dataSource] as const,
  detail: (id: string, dataSource: DataSource = 'http') => [...entityQueryKeys.details(dataSource), id] as const,
};
```

Invalidating `lists()` clears every filtered list without touching a single detail entry.

**The data-source segment matters.** Two gateways can answer the same logical question with different data. Without
the segment in the key, switching source serves the previous source's cached result.

Omit the segment when the entity has exactly one data source — there is nothing to distinguish.

### 2. Query Options Factory

The builder is a pure function returning a configuration object. It owns _how_ data is fetched and cached; it does not
fetch anything itself:

```typescript
export const getEntityListQueryOptions = (filters: EntityFilters = {}, dataSource: DataSource = 'http') =>
  queryOptions({
    queryKey: entityQueryKeys.list(filters, dataSource),
    queryFn: ({ signal }) => createEntityGateway(dataSource).findAll(filters, { signal }),
  });
```

Because it is pure, it is tested by calling it and asserting on the result — no rendering, no network.

**Forwarding the abort signal is not optional.** Without it, a request outlives the screen that started it and resolves
into a component that no longer exists.

### 3. Paginated Queries

Pagination is decided here and nowhere else:

```typescript
export const getEntityInfiniteQueryOptions = (filters: EntityFilters = {}, dataSource: DataSource = 'http') =>
  infiniteQueryOptions({
    queryKey: entityQueryKeys.list(filters, dataSource),
    queryFn: ({ pageParam, signal }) =>
      createEntityGateway(dataSource).findAll({ ...filters, page: pageParam, limit: DEFAULT_LIMIT }, { signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.length === DEFAULT_LIMIT ? allPages.length + 1 : undefined),
  });
```

When the API returns a bare array rather than an envelope with a total count, page length is the only available signal:
a full page implies another may exist, a short page ends the sequence. The cost is one extra request when the total is
an exact multiple of the page size.

**Callers cannot override pagination.** The options type accepted by the exported hook omits `getNextPageParam` and
`initialPageParam`, so changing the contract is a compile error rather than a convention someone can ignore.

### 4. Query Hooks

Thin by design. The builder supplies the configuration; the hook merges caller overrides and calls the library:

```typescript
export const entityRepositoryQueries: EntityQueriesRepository = {
  useEntityList: (filters, dataSource, options) =>
    useInfiniteQuery({ ...entityQueryOptions.list(filters, dataSource), ...options }),

  useEntity: (id, dataSource, options) => useQuery({ ...entityQueryOptions.detail(id, dataSource), ...options }),
};
```

Spread order matters: caller options come last so `enabled` and `staleTime` can be overridden per call site.

### 5. Mutation Hooks

A writable entity adds mutations alongside its queries. The mutation owns its own invalidation — that is the whole
reason it belongs in the repository rather than in a component:

```typescript
export const entityRepositoryMutations: EntityMutationsRepository = {
  useCreateEntity: (options) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: (payload: CreateEntityPayload) => createEntityGateway().create(payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: entityQueryKeys.lists() }),
      ...options,
    });
  },
};
```

Invalidating `lists()` rather than `all` leaves detail entries intact — a newly created item does not make an already
fetched detail stale.

A read-only entity exposes no mutations at all. Adding an unused mutation hook "for symmetry" is dead code with a
network call in it.

### 6. The Singleton

`index.ts` assembles the pieces into the object consumers import:

```typescript
export const entityRepository: EntityRepository = {
  queries: entityRepositoryQueries,
  mutations: entityRepositoryMutations,
  keys: entityQueryKeys,
  queryOptions: entityQueryOptions,
  cancel: { cancelEntityList },
};
```

Cancellation helpers take the query client as their **first parameter**, injected by the caller. A repository that
imported the client singleton directly would invert the dependency direction — infrastructure would depend on the
application layer.

## Usage in Components

Never directly. A business hook sits between the repository and anything that renders:

```typescript
// ✅ Good — the view consumes a business hook
export const useEntityListBusiness = () => {
  const { data, isLoading, fetchNextPage, hasNextPage } = entityRepository.queries.useEntityList();

  return { entities: data?.pages.flat() ?? [], isLoading, fetchNextPage, hasNextPage };
};

// ❌ Bad — a view calling the repository couples a screen to a caching decision
export const EntityListView = () => {
  const { data } = entityRepository.queries.useEntityList();
  // ...
};
```

The business hook is also where paged data is flattened, so no component ever handles the page structure.

## Benefits

### ✅ Advantages

- **One place to change caching** — stale time, retry, invalidation
- **No key drift** — the factory makes a mistyped key impossible
- **Pure, cheaply tested builders** — no rendering required
- **Swappable data source** — the consumer's call does not change

### ⚠️ Trade-offs

- **Indirection** — four files stand between a component and a network call
- **Boilerplate for trivial entities** — a single unfiltered read still wants the full set
- **Generic parameters are load-bearing** — under-specifying them on an infinite query silently degrades page-param
  typing

## Testing

Test each layer where its behaviour lives:

```typescript
// The options builder — a pure function, no rendering
it('includes the data source in the query key', () => {
  const options = getEntityListQueryOptions({}, 'asyncStorage');

  expect(options.queryKey).toEqual(['entity', 'list', 'asyncStorage', {}]);
});

// The hook — rendered through the test providers, transport mocked
it('returns entities from the http gateway', async () => {
  mock.onGet('entities').reply(200, [mockEntity]);

  const { result } = await renderHookWithProviders(() => entityRepository.queries.useEntityList());

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
});
```

Do not mock the repository when testing the repository. Mock the transport underneath it, so the keys, the builder,
and the hook are all exercised.

## Related Patterns

- **[Gateway Pattern](./gateway-pattern.md)** - The data sources a repository selects between
- **[Hook Patterns](./hook-patterns.md)** - The business hooks that consume repositories
- **[Module Architecture](./module-architecture.md)** - Where this layer sits
