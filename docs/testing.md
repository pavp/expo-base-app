# Testing

This document explains how tests are structured, which layer to mock for each kind of test, and the helpers that make
a rendered test resemble the running application.

## 🚀 Quick Start

### Running Tests

```sh
pnpm test                    # Full suite with coverage
pnpm test --watch            # Watch mode
pnpm test path/to/file       # A single file
pnpm test -t 'renders empty' # Tests matching a name
```

Coverage is collected on every run and thresholds are enforced. A change that drops coverage below them fails exactly
like a failing assertion.

### Import Rules

Render helpers come from the project's test utilities, never from the component library directly — that restriction is
a lint error, because a direct render skips the providers the application actually mounts:

```typescript
// ✅ Good
import { renderWithProviders, screen, waitFor } from '@/test/test-utils';

// ❌ Bad — renders without the application's providers
import { render, screen } from '@testing-library/react-native';
```

The test utilities re-export everything from the underlying library, so there is nothing to import separately.

## 📁 Structure

```
test/
├── test-utils.tsx        ## Render helpers wrapping the app's providers
├── jest.setup.ts         ## Global mocks, run before each suite
├── jest.polyfills.ts     ## Environment polyfills, run before the framework
├── entities/             ## Entity mock factories
└── __mocks__/            ## Module mocks resolved automatically
```

Tests themselves are **co-located** beside the file under test, named after it in full:

```
components/entity-card/
├── entity-card.component.tsx
├── entity-card.component.test.tsx
└── styles.ts
```

## 🧪 Test Structure

Arrange, act, assert — in that order, with the sections marked:

```typescript
it('renders the empty state when no entities are returned', async () => {
  // Arrange
  mock.onGet('entities').reply(200, []);

  // Act
  await renderWithProviders(<EntityListView />);

  // Assert
  expect(await screen.findByText('No entities yet')).toBeVisible();
});
```

Name a test for the behaviour it protects, not the function it calls. `returns data` says nothing; `flattens paged
entities into one list` says what breaks if it fails.

## 🎯 Mock Strategy

**Mock the layer directly beneath the one under test, and no deeper.** Mocking too deep couples a test to
implementation; mocking too shallow turns a unit test into an integration test with no boundary.

| What you are testing       | Mock at                                               |
| -------------------------- | ----------------------------------------------------- |
| An api file                | The HTTP adapter                                      |
| A gateway                  | The HTTP adapter                                      |
| A query-options builder    | Nothing — it is a pure function                       |
| A repository hook          | The HTTP adapter, rendered through the test providers |
| A business hook            | The repository                                        |
| A controller hook          | Nothing — it is state and handlers                    |
| A view                     | The hooks it consumes                                 |
| A presentational component | Nothing — pass props                                  |

### Mocking HTTP

Attach an adapter to the shared client instance:

```typescript
const mock = new MockAdapter(client);

afterEach(() => {
  mock.reset();
  jest.clearAllMocks();
});

it('requests the page and limit it was given', async () => {
  mock.onGet('entities', { params: { _page: 2, _limit: 10 } }).reply(200, [mockEntity]);

  const result = await entityApi.getAll({ page: 2, limit: 10 });

  expect(result).toEqual([mockEntity]);
});
```

Asserting on request parameters is what catches a builder that quietly stops forwarding a filter.

### Mocking a Module Boundary

When a module's barrel pulls in native dependencies that cannot load in a test environment, mock the boundary with an
**explicit factory**:

```typescript
// ✅ Good — nothing from the real module is loaded
jest.mock('@/modules/settings', () => ({
  useSettingsBusiness: () => ({ toggleTheme: jest.fn() }),
}));

// ❌ Bad — an automatic mock still requires the real module to shape itself
jest.mock('@/modules/settings');
```

An automatic mock has to load the real module to discover its exports, so it hits the same failing import chain it was
meant to avoid.

### Preventing the Chain in the First Place

Mocking a boundary treats the symptom. The cause is usually a barrel that re-exports something only a real app can
load, and there are two rules that keep it from arising:

**Keep native-only components out of a shared barrel.** A barrel loads every module it re-exports — a named export is
no lighter than a wildcard, because the module still has to be evaluated to read the symbol out of it. One entry
reaching a native navigator makes the entire barrel unimportable in a test, including the plain component someone
actually wanted. Export such components from their own path instead, and say so in the barrel:

```typescript
// ✅ Good — the heavy component is reachable, just not through here
// Navigation components are absent deliberately: both reach a native navigator.
export { ErrorFallback } from './error-fallback/error-fallback.component';
```

**Import types with `import type`.** A type imported as a value keeps a runtime edge to the module it came from, so a
fixture that borrows one type from a feature module drags that module's whole dependency chain into every test that
touches the fixture barrel:

```typescript
// ✅ Good — erased at compile time, no runtime edge
import type { Entity } from '@/modules/entity';

// ❌ Bad — pulls the module's native chain into the fixture barrel
import { Entity } from '@/modules/entity';
```

Both are cheap to apply and remove the need for a mock at all.

## 🛠️ Test Utilities

### `renderWithProviders(ui, options?)`

Renders a component inside the application's providers — the query client, and anything else a screen needs at
runtime. It is **asynchronous**; await it.

```typescript
await renderWithProviders(<EntityListView />);
```

The query client used in tests disables retries and immediate garbage collection. Retries would turn one failed
request into several seconds of waiting; without the cache-time setting, a query can outlive its test and refetch
against an adapter that has already been reset — producing a failure in an unrelated test.

### `renderHookWithProviders(hook, options?)`

The same wrapper for a hook:

```typescript
const { result } = await renderHookWithProviders(() => useEntityListBusiness({}));

await waitFor(() => expect(result.current.isLoading).toBe(false));
```

### Per-Test Query Clients

Both helpers build a fresh query client per render and return it alongside the render result. Nothing is shared
between tests, so a query mounted by one can never resolve into another:

```typescript
const { result, queryClient } = await renderHookWithProviders(() => useEntityListBusiness({}));
```

Pass `queryClientOptions` to tune the defaults for one test, or `queryClient` to supply your own:

```typescript
await renderHookWithProviders(() => useEntityListBusiness({}), { queryClientOptions: { staleTime: 60_000 } });
```

### `setupMockQueryData(queryClient, queryKey, data)`

Seeds the cache directly. A hook that reads cached data — a selector, a derived value, anything downstream of a query
that has already resolved — can then be tested without standing up an HTTP mock at all:

```typescript
const { queryClient } = await renderHookWithProviders(() => null);

setupMockQueryData(queryClient, entityQueryKeys.list(), [mockEntity]);
```

Reach for this when the behaviour under test is what happens _to_ the data. When the behaviour is the fetch itself,
mock the transport instead.

## 🎭 Entity Factories

Fixtures are generated, not hand-written:

```typescript
export const mockEntity: Entity = {
  id: faker.string.uuid(),
  name: faker.commerce.productName(),
  authorId: faker.number.int({ min: 1, max: 10 }),
};

export const generateMockEntities = (count: number): Entity[] =>
  Array.from({ length: count }, () => ({ ...mockEntity, id: faker.string.uuid() }));
```

Generated fixtures surface assumptions a hand-written one hides — a test that passes only with a three-character name
fails the first time the generator produces a longer one.

Factories import their types **through module barrels**, never internal paths, so a fixture cannot depend on something
the module keeps private.

### Deterministic Data

When an assertion depends on an exact value, pass it explicitly rather than asserting against a random one:

```typescript
const entity = { ...mockEntity, name: 'Specific Name' };
```

## 🌐 Global Mocks

Some dependencies cannot run in a test environment and are mocked once, globally:

- Native list measurement, which requires a real layout pass
- Native event emitters
- Icon fonts
- Development-only plugins
- Device storage, replaced with an in-memory implementation

Storage is cleared after every test, so a value written by one test cannot leak into the next.

**A global mock that reaches into a library's internal path is a known fragility.** It works until the library
reorganizes its files, at which point the whole suite fails at import. Pin such a library to an exact version and
treat an upgrade as a change that needs the suite run before merge.

## 📊 Coverage

Coverage is collected across application source, excluding barrels, type declarations, and fixtures — files with no
behaviour to exercise. Thresholds are enforced globally rather than per file, so a well-tested module can offset a
thin one without letting the whole suite drift.

**The floor sits a few points under measured coverage.** Close enough that deleting a tested branch fails the run,
loose enough that a refactor shifting a few lines does not. A floor far below reality — say 55 against a measured 94 —
enforces nothing: a change could delete a third of the tested behaviour and still pass.

When coverage rises, raise the floor. Never lower it to turn a red run green; that converts a signal into a
formality. A directory added to the source tree is added to the globs in the same change, or it is silently
unmeasured.

**Coverage measures what ran, not what was verified.** A test that renders a screen and asserts nothing scores the same
as one that checks every branch. Read the number as a floor, never as evidence.

## 🎨 Best Practices

### 1. Test Behaviour, Not Implementation

Assert on what a user or a caller observes. A test asserting that an internal function was called breaks on every
refactor and protects nothing.

### 2. One Reason to Fail

A test with a single behaviour in it names the defect when it fails. A test covering four behaviours only says
something broke.

### 3. Never Test a Schema Directly

Schemas are exercised through whichever consumer parses a real payload. A dedicated schema test asserts that the
validation library works.

### 4. Prefer Queries a User Could Make

Find elements by text, role, or accessibility label. A test that queries by internal identifier passes while the screen
is unusable.

### 5. Await the Render

The render helpers are asynchronous. A missing `await` produces intermittent failures that look like flakiness.

## 🩺 Troubleshooting

**A test passes alone and fails in the suite:** shared state is leaking. Check that mocks reset and storage clears
between tests.

**A query refetches after the test ends:** the cache is outliving the test. This is what the zero cache-time setting
prevents; a custom client in a test needs it too.

**An import throws before any test runs:** a module barrel is pulling in a native dependency. Mock the boundary with an
explicit factory.

**A snapshot changes on every run:** generated data reached the snapshot. Pin the values the assertion depends on.

## 📚 Related Documentation

- **[Rules and Conventions](./rules-conventions.md)** - Test naming and structure requirements
- **[Repository Pattern](./repository-pattern.md)** - Testing each data-access layer
- **[Hook Patterns](./hook-patterns.md)** - Testing business and controller hooks
