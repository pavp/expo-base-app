# Hook Patterns

This document explains how logic is split between hooks, where each hook lives, and why a view holds almost no code of
its own.

## Overview

Two kinds of hook sit between a repository and a screen:

| Hook       | Owns                                                       | Naming                  |
| ---------- | ---------------------------------------------------------- | ----------------------- |
| Business   | Data access, derivation, and the actions a feature exposes | `use-<name>-business`   |
| Controller | UI-only state — search terms, selections, toggles          | `use-<name>-controller` |

The split follows what makes a change necessary. Data logic changes when the API or caching changes. UI state changes
when the interaction changes. Kept apart, those two never force each other to be re-read.

A view composes them and renders. It holds no fetching and, ideally, no state of its own.

## Business Hooks

### Structure

```typescript
// Business hook naming pattern
export const use[Feature]Business = (params) => {
  // Call repositories
  // Derive and reshape data for rendering
  // Expose actions

  return { data, isLoading, error, actions };
};
```

**The business hook is the only place a repository is called.** That single rule is what keeps caching decisions out
of components.

### Implementation Example

```typescript
export const useEntityListBusiness = (filters: EntityFilters, enabled = true) => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    entityRepository.queries.useEntityList(filters, undefined, { enabled });

  const entities = useMemo(() => data?.pages.flat() ?? [], [data]);

  return {
    entities,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    loadMore: fetchNextPage,
  };
};
```

Note what the hook absorbs: the page structure is flattened here, so no component ever handles pages. The `enabled`
flag is a parameter rather than an internal decision, because whether a query should run is usually a UI concern —
typically supplied by a controller hook.

### Composing Several Sources

A business hook may call more than one repository and present the result as one shape:

```typescript
export const useEntityDetailBusiness = (id: string) => {
  const { data: entity, isLoading: entityLoading } = entityRepository.queries.useEntity(id);
  const { data: author, isLoading: authorLoading } = userRepository.queries.useUser(entity?.authorId ?? 0, {
    enabled: !!entity,
  });

  return { entity, author, isLoading: entityLoading || authorLoading };
};
```

The dependent query is gated with `enabled` rather than an early return — hooks cannot be called conditionally, so the
condition moves into the options.

## Controller Hooks

### Structure

```typescript
// Controller hook naming pattern
export const use[Feature]Controller = () => {
  // Local UI state
  // Handlers
  // Derived UI flags

  return { state, handlers, flags };
};
```

### Implementation Example

```typescript
export const useEntityListController = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(null);

  const debouncedSearchTerm = useDebouncedValue(searchTerm.trim());
  const hasFilter = debouncedSearchTerm.length > 0 || selectedAuthorId !== null;

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedAuthorId(null);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    selectedAuthorId,
    setSelectedAuthorId,
    debouncedSearchTerm,
    hasFilter,
    clearFilters,
  };
};
```

Debouncing belongs here. The raw term drives the input so typing feels immediate; the debounced term drives the query
so the network does not see a request per keystroke.

`hasFilter` is a derived flag, not stored state. Storing it would create a second source of truth that has to be kept
in sync with the two values it summarizes.

### When a Controller Is Not Needed

**Only add a controller hook when the view has UI-only state.** A view that renders whatever the business hook returns
has nothing for a controller to own, and an empty one added for symmetry is a file to maintain that answers no
question.

## Combining Hooks in Views

The controller produces the inputs; the business hook consumes them:

```typescript
export const EntityListView = () => {
  const { searchTerm, setSearchTerm, debouncedSearchTerm, hasFilter, clearFilters } = useEntityListController();
  const { entities, isLoading, loadMore, hasNextPage } = useEntityListBusiness({ q: debouncedSearchTerm }, hasFilter);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView>
      <SearchInput value={searchTerm} onChangeText={setSearchTerm} placeholder={t('entity.searchPlaceholder')} />
      <EntityList data={entities} onEndReached={hasNextPage ? loadMore : undefined} onClear={clearFilters} />
    </SafeAreaView>
  );
};
```

The view reads as a description of the screen. Every decision behind it lives in a hook that can be tested without
rendering anything.

## Hook Placement

Placement follows **consumer count**, not the layer that seems appropriate:

| Consumers                     | Location                        | Example                     |
| ----------------------------- | ------------------------------- | --------------------------- |
| One view                      | `views/<view>/hooks/`           | `use-entity-list-business`  |
| One component                 | `components/<component>/hooks/` | `use-comment-list-business` |
| Two or more views in a module | `modules/<module>/hooks/`       | `use-entity-authors`        |
| More than one module          | `core/hooks/`                   | `use-debounced-value`       |

A hook starts as private and moves up only when a second consumer appears. Promoting one early makes it public before
anyone has proven what its API should be.

A component that fetches its own data gets its own business hook rather than receiving the data as props — that is the
correct choice when the data is genuinely the component's concern and no sibling needs it.

## Boot-Time Hooks

Initialization that must complete before the app renders follows the same shape, each hook returning a readiness flag
composed by a parent:

```typescript
export const useInitApp = () => {
  const [fontsLoaded] = useFonts({/* ... */});
  const { themeIsReady } = useInitTheme();
  const { languageIsReady } = useInitLanguage();

  return { appIsReady: fontsLoaded && themeIsReady && languageIsReady };
};
```

Each initializer sets its flag in a `finally` block, so a failed read still releases the splash screen. An app that
hangs on a corrupt preference is worse than one that starts with defaults.

Only the composed hook is exported from the module barrel; the individual initializers stay private.

## Testing Strategies

### Testing Business Hooks

Mock the repository, not the transport — the repository is this hook's dependency:

```typescript
it('flattens paged entities', async () => {
  jest.spyOn(entityRepository.queries, 'useEntityList').mockReturnValue({
    data: { pages: [[mockEntity], [mockEntity]], pageParams: [1, 2] },
    isLoading: false,
  } as never);

  const { result } = await renderHookWithProviders(() => useEntityListBusiness({}));

  expect(result.current.entities).toHaveLength(2);
});
```

### Testing Controller Hooks

No providers or mocks needed — it is state and handlers:

```typescript
it('reports a filter once a search term is entered', async () => {
  const { result } = await renderHookWithProviders(() => useEntityListController());

  act(() => result.current.setSearchTerm('report'));
  await waitFor(() => expect(result.current.hasFilter).toBe(true));
});
```

### Testing Views

Mock the hooks. A view test asserts on rendering decisions, not on data flow:

```typescript
it('renders the empty state when no entities are returned', async () => {
  jest.mocked(useEntityListBusiness).mockReturnValue({ entities: [], isLoading: false } as never);

  await renderWithProviders(<EntityListView />);

  expect(await screen.findByText('No entities yet')).toBeVisible();
});
```

## Best Practices

### 1. One Repository Boundary

Business hooks call repositories. Views call business hooks. Neither skips a step, even when the intermediate hook
would be a single line today.

### 2. Return Shapes, Not Primitives

Return a named object rather than a positional tuple. Adding a third value to a tuple breaks every call site; adding a
key to an object breaks none.

### 3. Derive, Don't Store

A value computable from existing state is derived on render. Storing it introduces a synchronization bug waiting for
the first path that updates one and not the other.

### 4. Keep Hooks Unconditional

Never call a hook behind a condition. Gate the _query_ with `enabled` and let the hook run every render.

## Benefits

### ✅ Advantages

- **Testable without rendering** — logic is reachable without a screen
- **Views stay declarative** — a view describes what it shows
- **Independent change** — UI state and data access evolve separately
- **Obvious placement** — consumer count answers where a hook goes

### ⚠️ Trade-offs

- **More files per screen** — three where one would compile
- **Judgment required** — the business/controller line is occasionally debatable
- **Indirection** — reading a screen end to end means opening several files

## Related Patterns

- **[Repository Pattern](./repository-pattern.md)** - What business hooks consume
- **[Module Architecture](./module-architecture.md)** - Where hooks sit in the layering
- **[Testing](./testing.md)** - Mock levels and render helpers
