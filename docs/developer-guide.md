# Developer Guide

This guide provides step-by-step instructions for creating new modules and extending existing functionality following
the established architectural patterns.

## Getting Started

Read these first — this guide assumes them:

- **[Module Architecture](./module-architecture.md)** - The layers and the one-way data flow
- **[Repository Pattern](./repository-pattern.md)** - Keys, options builders, and caching
- **[Gateway Pattern](./gateway-pattern.md)** - Abstracting data sources
- **[Hook Patterns](./hook-patterns.md)** - The business and controller split
- **[File Naming Conventions](./file-naming-conventions.md)** - Suffixes and casing

## Creating a New Module

The example builds an `entity` module with a list screen and a detail screen. Substitute your own name throughout.

### Step 1: Verify the Payload First

Before writing a schema, look at what the API actually returns:

```sh
curl -s 'https://api.example.com/entities?_page=1&_limit=2' | jq
```

**Do not skip this.** A schema written from documentation rather than from a response is a guess, and a wrong guess
surfaces as a validation error at runtime rather than as a type error at build time. Note which fields are optional,
which are nullable, and whether the endpoint returns a bare array or an envelope — that last one decides how
pagination works.

### Step 2: Create the Directory Structure

```sh
mkdir -p src/modules/entity/{api,components,hooks,repositories/entity/gateways,views}
```

Create only the folders the module actually needs. An empty `components/` folder is noise.

### Step 3: Define Types and Schemas

`src/modules/entity/entity.types.ts`:

```typescript
import { z } from 'zod';

export const EntitySchema = z.object({
  id: z.number(),
  name: z.string(),
  authorId: z.number(),
});

export const EntityArraySchema = z.array(EntitySchema);

export const EntityFiltersSchema = z.object({
  q: z.string().optional(),
  authorId: z.number().optional(),
});

export type Entity = z.infer<typeof EntitySchema>;
export type EntityFilters = z.infer<typeof EntityFiltersSchema>;
```

Declare only the fields the application uses. Undeclared fields are stripped rather than passed through, which keeps an
upstream addition from silently entering the app.

### Step 4: Add the Endpoint

Add the path to the endpoint map rather than inlining it at a call site:

```typescript
export const API_ENDPOINT = {
  // ...
  ENTITIES: 'entities',
};
```

### Step 5: Create the API Layer

`src/modules/entity/api/entity-api.ts` — a contract, a factory, and a singleton:

```typescript
export interface EntityApiContract {
  getAll(params: EntityParams, options?: ApiOptions): Promise<Entity[]>;
  getById(id: string, options?: ApiOptions): Promise<Entity>;
}

export const createEntityApiService = (): EntityApiContract => ({
  getAll: (params, options) =>
    httpClient.get(API_ENDPOINT.ENTITIES, {
      params: buildEntityParams(params),
      responseSchema: EntityArraySchema,
      ...options,
    }),

  getById: (id, options) =>
    httpClient.get(`${API_ENDPOINT.ENTITIES}/${id}`, {
      responseSchema: EntitySchema,
      ...options,
    }),
});

export const entityApi = createEntityApiService();
```

The contract is what tests fake; the factory makes it satisfiable; the singleton is what production uses.

### Step 6: Decide Whether You Need Gateways

**Ask: is there more than one data source?**

- **No** — skip to Step 8. The options builder will call the api layer directly, and the query key needs no
  data-source segment.
- **Yes** — continue.

A gateway with one implementation is an interface, a factory branch, and a key segment encoding no decision. Add the
layer when the second source arrives; that is a contained refactor.

### Step 7: Implement the Gateways

Define the contract, then one implementation per source, then the factory. See
**[Gateway Pattern](./gateway-pattern.md)** for the full shape.

```typescript
export interface EntityGateway extends BaseGateway {
  findAll(filters: EntityFilters & { page: number; limit: number }, options?: GatewayOptions): Promise<Entity[]>;
  findById(id: string, options?: GatewayOptions): Promise<Entity>;
}
```

### Step 8: Create the Query Keys

```typescript
export const entityQueryKeys = {
  all: ['entity'] as const,
  lists: () => [...entityQueryKeys.all, 'list'] as const,
  list: (filters: EntityFilters = {}) => [...entityQueryKeys.lists(), filters] as const,
  details: () => [...entityQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...entityQueryKeys.details(), id] as const,
};
```

Add a data-source segment to each level when the module has gateways.

### Step 9: Create the Query Options

```typescript
export const entityQueryOptions = {
  list: (filters: EntityFilters = {}) =>
    infiniteQueryOptions({
      queryKey: entityQueryKeys.list(filters),
      queryFn: ({ pageParam, signal }) =>
        entityApi.getAll({ ...filters, page: pageParam, limit: DEFAULT_LIMIT }, { signal }),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => (lastPage.length === DEFAULT_LIMIT ? allPages.length + 1 : undefined),
    }),

  detail: (id: string) =>
    queryOptions({
      queryKey: entityQueryKeys.detail(id),
      queryFn: ({ signal }) => entityApi.getById(id, { signal }),
      enabled: !!id,
    }),
};
```

Forward the abort signal. Without it a request outlives the screen that started it.

### Step 10: Create the Repository

Declare the interface, implement the hooks, assemble the singleton:

```typescript
export const entityRepositoryQueries: EntityQueriesRepository = {
  useEntityList: (filters, options) => useInfiniteQuery({ ...entityQueryOptions.list(filters), ...options }),
  useEntity: (id, options) => useQuery({ ...entityQueryOptions.detail(id), ...options }),
};

export const entityRepository: EntityRepository = {
  queries: entityRepositoryQueries,
  keys: entityQueryKeys,
  queryOptions: entityQueryOptions,
};
```

### Step 11: Create the Business Hook

```typescript
export const useEntityListBusiness = (filters: EntityFilters = {}) => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage } = entityRepository.queries.useEntityList(filters);

  const entities = useMemo(() => data?.pages.flat() ?? [], [data]);

  return { entities, isLoading, isError, hasNextPage, loadMore: fetchNextPage };
};
```

Flatten pages here so no component handles the page structure.

### Step 12: Add a Controller Hook — Only If Needed

**Skip this step when the view has no UI-only state.** A controller added for symmetry is a file with no reason to
exist. Add one when the view owns a search term, a selection, or a toggle.

### Step 13: Create the View

```tsx
export const EntityListView = () => {
  const { t } = useTranslation();
  const { entities, isLoading, loadMore, hasNextPage } = useEntityListBusiness();

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (!entities.length) {
    return <EmptyState icon="inbox" title={t('entity.emptyTitle')} />;
  }

  return <EntityList data={entities} onEndReached={hasNextPage ? loadMore : undefined} />;
};
```

Styles go in a sibling `styles.ts` reading theme tokens — never a hardcoded value.

### Step 14: Add Translations

Add every user-facing string to **all** locale catalogues. See **[Internationalization](./intl.md)**.

### Step 15: Export from the Barrel

`src/modules/entity/index.ts` — name the public surface explicitly:

```typescript
export type { Entity, EntityFilters } from './entity.types';
export { entityRepository } from './repositories/entity';
export { EntityDetailView, EntityListView } from './views';
```

Gateways, keys, options builders, and business hooks stay private.

### Step 16: Add the Route

```tsx
import { ErrorFallback } from '@/components';
import { EntityListView } from '@/modules/entity';

export { ErrorFallback as ErrorBoundary };

export default function EntityListScreen() {
  return <EntityListView />;
}
```

Register the screen's title in the enclosing layout and add the title key to every catalogue.

### Step 17: Write the Tests

Test each layer where its behaviour lives. See **[Testing](./testing.md)** for mock levels:

```typescript
// The api layer — mock the HTTP adapter
it('strips undeclared upstream fields', async () => {
  mock.onGet('entities').reply(200, [{ id: 1, name: 'A', authorId: 2, extra: 'ignored' }]);

  const result = await entityApi.getAll({ page: 1, limit: 10 });

  expect(result[0]).not.toHaveProperty('extra');
});

// The options builder — a pure function
it('stops paginating on a short page', () => {
  const { getNextPageParam } = entityQueryOptions.list();

  expect(getNextPageParam(generateMockEntities(3), [[]])).toBeUndefined();
});

// The view — mock the business hook
it('renders the empty state with no entities', async () => {
  jest.mocked(useEntityListBusiness).mockReturnValue({ entities: [], isLoading: false } as never);

  await renderWithProviders(<EntityListView />);

  expect(await screen.findByText('No entities yet')).toBeVisible();
});
```

### Step 18: Verify

```sh
pnpm lint
pnpm typecheck
pnpm test
```

Then run the application. A module can pass all three checks and still render nothing — module resolution differs
between the test runner and the bundler, so an import cycle invisible to tests can produce a blank screen on device.

## Extending an Existing Module

### Adding an Endpoint

1. Add the schema and inferred type to `<module>.types.ts`
2. Add the path to the endpoint map
3. Add the method to the api contract and its implementation
4. Add the method to the gateway contract and every implementation, if the module has gateways
5. Add the key and the options builder
6. Add the hook to the repository
7. Consume it from a business hook

### Adding a Data Source

1. Create the implementation folder under `gateways/`
2. Implement the contract, declaring the source's real capabilities
3. Add the case to the factory
4. Add the source to the `DataSource` union

The compiler then flags every switch that needs a new case. Existing call sites keep working through the factory's
default.

### Adding a Mutation

1. Add the method to the api contract and to every gateway
2. Add a mutations file exposing the hook
3. Invalidate the narrowest key that covers what changed — `lists()` rather than `all` after a create
4. Add mutations to the repository singleton

## Best Practices Summary

1. **Verify the payload before writing a schema** — a guessed shape fails at runtime, not at build time
2. **Skip layers that encode no decision** — one data source needs no gateway; a static view needs no controller
3. **Never call a repository from a component** — a business hook sits between them, always
4. **Keep the barrel deliberate** — publishing an internal is a decision, not a side effect
5. **Forward the abort signal** — every query function, every time
6. **Derive, don't store** — a value computable from state is computed on render
7. **Translate every string** — including titles, labels, and error copy
8. **Read tokens, never literals** — no hex value, no raw spacing number in a component
9. **Test at the owning layer** — mock one level down, never deeper
10. **Run the app before opening a pull request** — green checks are not a running application

## Common Pitfalls

1. **Skipping the payload check** — the schema mismatches reality and every request fails validation
2. **Adding a gateway for one source** — indirection with no decision behind it, and a key segment with one value
3. **Calling a repository from a view** — couples a screen to a caching decision and makes both untestable in isolation
4. **Spreading caller options first** — the builder's defaults then override the caller's intent instead of the
   reverse
5. **Creating an import cycle** — passes every test, blank screen on device; a type-only import breaks the runtime edge
6. **Storing derived state** — two sources of truth and a synchronization bug waiting for the first divergent update
7. **Publishing internals through the barrel** — every future change to them becomes a breaking change

## Related Documentation

- **[Module Architecture](./module-architecture.md)** - The layering this guide builds
- **[Testing](./testing.md)** - Mock levels and render helpers
- **[Contributing](./contributing.md)** - Getting the work merged
