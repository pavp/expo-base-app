# Rules and Conventions

This document outlines every convention enforced by tooling in this repository, and the reasoning behind the ones that
are not obvious. A rule listed here fails a build; it is not a preference.

## TypeScript

Strict mode is on. The compiler runs as a separate check, so a type error fails the build even when the bundler is
happy to emit.

### TypeScript Best Practices

#### ✅ Interface Definitions

Define a contract before implementing it. A named interface gives the implementation something to satisfy and gives
tests something to fake:

```typescript
export interface EntityApiContract {
  getAll(options?: ApiOptions): Promise<Entity[]>;
  getById(id: number, options?: ApiOptions): Promise<Entity>;
}
```

#### ✅ Type Safety

Derive types from schemas rather than declaring them twice. A hand-written type that mirrors a schema drifts the first
time only one of them is edited:

```typescript
// ✅ Good — one source of truth
export const EntitySchema = z.object({ id: z.number(), name: z.string() });
export type Entity = z.infer<typeof EntitySchema>;

// ❌ Bad — two declarations to keep in sync by hand
export const EntitySchema = z.object({ id: z.number(), name: z.string() });
export interface Entity {
  id: number;
  name: string;
}
```

Prefer `unknown` over `any` at boundaries, then narrow. `any` disables checking for everything downstream of it.

## File and Code Naming Conventions

### Files and Directories

```bash
# ✅ Correct
entity-list-view.view.tsx
use-entity-business.hook.ts
entity.repository.keys.ts

# ❌ Incorrect
EntityListView.tsx
useEntityBusiness.ts
entityRepositoryKeys.ts
```

Enforced by the linter's file and folder naming rules, both exempted for the routes directory and the test directory.
See **[File Naming Conventions](./file-naming-conventions.md)** for the full suffix set.

### Code Elements

| Element                 | Convention              | Example             |
| ----------------------- | ----------------------- | ------------------- |
| Components              | PascalCase              | `EntityCard`        |
| Hooks                   | camelCase, `use` prefix | `useEntityBusiness` |
| Types and interfaces    | PascalCase              | `EntityGateway`     |
| Constants               | SCREAMING_SNAKE_CASE    | `DEFAULT_LIMIT`     |
| Functions and variables | camelCase               | `buildEntityParams` |

File names are kebab-case regardless of the casing of the symbol they export. The two conventions are independent.

## Architectural Conventions

### Module Structure

A module exposes one barrel and keeps everything else private. Gateways, query keys, query-options builders, and
business hooks are internal by default — publishing one is a deliberate act, not a side effect of a wildcard export.

### Hook Separation Pattern

Data access and UI state are separate hooks:

- `use-<name>-business` owns data access. It is the only place a repository is called.
- `use-<name>-controller` owns UI-only state — a search term, a selected filter, a toggle.

A controller hook is added when a view actually has UI-only state. A view with none does not get an empty controller
for symmetry.

Placement follows consumer count: a hook used by exactly one view lives in that view's `hooks/` folder; a hook used by
two or more moves up to the module's `hooks/`.

### Repository Pattern Requirements

- Views and components never call a repository directly — a business hook sits between them
- The repository never calls the HTTP client directly when a gateway exists
- Query keys carry a data-source segment whenever more than one gateway can answer
- Pagination is decided in the query-options builder, and callers cannot override it

### Gateway Pattern Requirements

- One interface, one implementation per data source, one factory that switches between them
- A gateway returns domain data, not transport envelopes
- Skip the gateway layer entirely when there is exactly one data source — an interface with a single implementation is
  indirection without a decision behind it

## Import Organization

Imports are sorted automatically into ordered groups. Running the linter with `--fix` is the intended way to satisfy
this rule:

```typescript
// 1. React and external packages
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal aliases
import { EmptyState } from '@/ui';
import { entityRepository } from '@/shared/entity';

// 3. Side-effect imports
import '@/styles/unistyles';

// 4. Relative imports
import { buildParams } from './helpers/build-params/build-params.helper';

// 5. Styles
import { styles } from './styles';
```

Also enforced: imports come before other statements, a blank line follows the import block, and two imports from the
same module are merged into one.

### Import Cycles

Cycles are an error. The common cause is a helper importing a type from the file that calls it. The fix is a type-only
import, which is erased at compile time and leaves no runtime edge:

```typescript
// ✅ Good — no runtime dependency
import type { EntityPage } from '../../entity-api';

// ❌ Bad — creates a cycle the bundler must resolve at runtime
import { EntityPage } from '../../entity-api';
```

A cycle can pass every test and still break the app: test runners and bundlers resolve modules differently, so a cycle
that Jest tolerates may yield a blank screen on device.

### Restricted Imports

Some modules must be reached through a wrapper rather than directly:

| Instead of                                | Import from                  | Why                                                  |
| ----------------------------------------- | ---------------------------- | ---------------------------------------------------- |
| The testing library directly              | The project's test utilities | Renders need the app's providers wrapped around them |
| The activity indicator from the framework | The UI primitives barrel     | The primitive injects the theme colour               |
| The store library directly                | The core store wrapper       | Every store must receive the shared middleware       |

Each restriction is lifted exactly where it must be — inside the wrapper itself, and inside the test directory.

## Testing Conventions

### Test File Naming

A test repeats the full name of the file it covers, suffix included: `entity-card.component.test.tsx`.

### Test Structure

Arrange, act, assert — in that order, with the sections visible:

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

### Mock Requirements

Mock at the layer that owns the behaviour under test, and no deeper:

| Testing               | Mock level                                        |
| --------------------- | ------------------------------------------------- |
| API layer             | HTTP adapter                                      |
| Gateway               | HTTP adapter                                      |
| Query-options builder | Nothing — call the pure function                  |
| Repository hook       | HTTP adapter, rendered through the test providers |
| Business hook         | The repository                                    |
| View                  | The business hook                                 |

Do not write a dedicated test for a schema. Schemas are exercised through whichever consumer parses a real payload.

### Coverage

Coverage is collected on every run and thresholds are enforced globally. A change that drops coverage below the
threshold fails the same way a failing test does.

## Error Handling Conventions

### Business Logic Errors

Validate at the boundary. A response that does not match its schema raises a typed error where it entered the system,
rather than surfacing as an undefined field several layers up.

### UI Error Handling

Screens render an error boundary that translates its own copy and logs the error it receives. Raw error messages are
shown only in development builds — a production user gets the translated copy and a retry affordance.

## Performance Conventions

### Memoization

Memoize when a value is passed to a memoized child or used as an effect dependency. Memoizing a cheap computation
consumed once adds allocation and a dependency array to maintain, and buys nothing.

### Query Optimization

- Let the query key carry every input the result depends on, so cache entries cannot collide
- Set `enabled` rather than branching around a hook — hooks cannot be called conditionally
- Cancel in-flight queries when a screen is torn down mid-request

## Code Quality Tools

### ESLint

#### Core Rules

| Rule                          | Setting                                   |
| ----------------------------- | ----------------------------------------- |
| Maximum line length           | 120 characters                            |
| Maximum positional parameters | 3 — beyond that, take an options object   |
| Quotes                        | Single, unless escaping would be required |
| Blank line before `return`    | Required                                  |
| Unused variables              | Error                                     |
| Import cycles                 | Error                                     |

#### Warnings Are Errors

The lint script runs with a zero-warning budget. A warning fails the build exactly like an error — locally, in the
pre-commit hook, and in CI. There is no tolerated-warning allowance in which a new finding can hide.

#### Disabling a Rule

A disable comment is acceptable only when the rule is provably wrong about the code, and always with the reason
inline:

```typescript
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- empty bodies are the declaration-merging mechanism
export interface AppThemes extends ThemeRegistry {}
```

Everything else gets fixed rather than silenced.

### Prettier

Two settings: single quotes, 120-column width — matching the linter's line-length rule so the two never disagree.
Markdown, JSON, and YAML are formatted on commit, so documentation written at a different width will be rewrapped.

### Pre-commit Hooks

| Hook         | Runs                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| `pre-commit` | Staged-file linting with `--fix`, a full type check, and formatting for docs and config |
| `commit-msg` | Commit message validation                                                               |
| `pre-push`   | Type check and the full test suite                                                      |

The type check runs across the whole project rather than on staged files alone, because the compiler ignores the
project configuration when handed explicit file names — losing path aliases and strict mode in the process.

Pre-push hooks are skipped in CI, where the same checks run as separate jobs.

## Commit Message Convention

Conventional commits, with a closed set of types and a 72-character subject limit:

```bash
# ✅ Correct
feat(entity): add author filter to the list view
fix(navigation): restore header colour after theme change
docs: document the gateway pattern

# ❌ Incorrect
Added author filter
feat: Added a really long subject line that keeps going well past the seventy-two character limit
```

Scope is optional and unrestricted — scopes are module names, an open set that grows with the codebase.

## Branch Naming

```bash
# ✅ Correct
feat/add-author-filter
fix/theme-header-colour

# ❌ Incorrect
feature/AddAuthorFilter
my-branch
```

Validated before push and again in CI. Note that the branch type set and the commit type set are not identical — a
hotfix branch still carries a `fix` commit.

## Delivery

Every change ships as a pull request with a squash merge. No direct pushes to the default branch, regardless of change
size.

The squash commit takes the **pull request title**, and the commit-validation job never sees that title — it lints the
individual commits that the squash replaces. Pull request titles therefore need the same conventional-commit
discipline by hand.

## Documentation Requirements

### Code Comments

Comment the why, never the what. A comment restating the code is noise that has to be maintained:

```typescript
// ❌ Bad — restates the line below it
// Set the limit to 10
const limit = 10;

// ✅ Good — records a decision the code cannot express
// The upstream API returns a bare array with no total count, so page length is
// the only available signal for whether another page exists.
const hasNextPage = page.length === DEFAULT_LIMIT;
```

Do not reference issue identifiers or ticket numbers in comments. They rot faster than the code and mean nothing to a
reader without access to the tracker.

### Documentation Updates

A change that alters a documented convention updates the document in the same pull request. Documentation that
contradicts the code is worse than no documentation, because it is trusted.

## Related Documentation

- **[File Naming Conventions](./file-naming-conventions.md)** - The full suffix set and its exemptions
- **[Project Structure](./project-structure.md)** - Directory layout and import direction
- **[Module Architecture](./module-architecture.md)** - Layering rules inside a module
- **[Testing](./testing.md)** - Render helpers, mock strategy, and entity factories
