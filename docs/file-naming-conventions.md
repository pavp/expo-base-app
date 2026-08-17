# File Naming Conventions

This document explains how files and folders are named, why the convention uses role suffixes, and where the rule does
not apply.

## Overview

Every file and folder is **kebab-case**. A file whose role is not obvious from its extension alone carries a **role
suffix** before the extension:

```
<kebab-case-name>.<role>.<ext>
```

The suffix is not decoration. It makes a file's layer readable in an editor tab, in a search result, and in a stack
trace — without opening it. It also lets the linter treat the middle segment as part of the name rather than as an
illegal extension.

## Naming Patterns

### Views

**Pattern**: `<name>-view.view.tsx`

```
modules/entity/views/entity-list-view/
├── entity-list-view.view.tsx
├── entity-list-view.view.test.tsx
├── styles.ts
├── index.ts
└── hooks/
```

A view is a screen. It lives in its own folder alongside its styles, its test, and any hooks only it consumes.

### Components

**Pattern**: `<name>.component.tsx`

```
ui/empty-state/
├── empty-state.component.tsx
└── styles.ts
```

**Example**:

```typescript
// ✅ Good
export const EmptyState = ({ title }: EmptyStateProps) => {
  /* ... */
};
// File: empty-state/empty-state.component.tsx
```

### Hooks

**Pattern**: `use-<name>.hook.ts`

```
modules/entity/views/entity-list-view/hooks/use-entity-list-business/
├── use-entity-list-business.hook.ts
└── use-entity-list-business.hook.test.ts
```

The file name repeats the hook name so a search for the symbol finds the file.

### Repositories

**Pattern**: `<module>.repository.keys.ts`, `<module>.query-options.ts`, `<module>.repository.queries.ts`,
`<module>.repository.types.ts`

```
modules/entity/repositories/entity/
├── entity.repository.keys.ts
├── entity.query-options.ts
├── entity.repository.queries.ts
├── entity.repository.types.ts
├── index.ts
└── gateways/
```

Each file owns exactly one concern: keys, options builders, the exported hooks, and the repository's own interface. The
folder's `index.ts` composes them into the repository singleton.

### Gateways

**Pattern**: `<source>-gateway.ts`, contract in `<module>.gateway.types.ts`

```
modules/entity/repositories/entity/gateways/
├── entity.gateway.types.ts
├── http-gateway/
│   ├── http-gateway.ts
│   └── http-gateway.test.ts
├── async-storage-gateway/
└── index.ts
```

The implementation file is named for its data source. Only the contract carries the `.gateway.types.ts` suffix.

### Stores

**Pattern**: `<name>.store.ts`

```
modules/entity/stores/
└── entity-preferences.store.ts
```

### Types

**Pattern**: `<name>.types.ts`

```
modules/entity/entity.types.ts
types/gateway.types.ts
```

Holds schemas and their inferred types, or a contract shared across layers.

### Helpers

**Pattern**: `<name>.helper.ts`

```
modules/entity/api/helpers/build-entity-params/
├── build-entity-params.helper.ts
└── build-entity-params.helper.test.ts
```

A helper is a pure function extracted from a larger file. It lives in its own folder next to the code that calls it.

### Constants

**Pattern**: `<name>.constants.ts`

```
modules/entity/entity.constants.ts
```

### Library Wrappers

**Pattern**: `<name>.lib.ts`, `<name>.middleware.ts`

```
core/lib/secure-storage/secure-storage.lib.ts
core/lib/store/store.middleware.ts
```

Used inside `core/lib/` for a wrapper over a third-party library and for middleware composed into a factory.

### Tests

**Pattern**: `<file-under-test>.test.ts` / `.test.tsx`

Tests are co-located next to the file under test and repeat its full name, suffix included.

### Mocks

**Pattern**: `<name>.mock.ts` / `.mock.tsx`

Entity factories live in the test directory; component mocks live in a `__mocks__` folder beside the component.

### Styles and Barrels

**Pattern**: `styles.ts`, `index.ts`

Neither takes a suffix — the file name already states the role. A `styles.ts` sits beside the single component that
uses it. An `index.ts` re-exports; it never holds logic.

## Directory Structure Example

```
modules/entity/
├── index.ts
├── entity.types.ts
├── entity.constants.ts
├── api/
│   ├── entity-api.ts
│   └── helpers/
│       └── build-entity-params/
│           └── build-entity-params.helper.ts
├── components/
│   ├── index.ts
│   └── entity-card/
│       ├── entity-card.component.tsx
│       ├── entity-card.component.test.tsx
│       └── styles.ts
├── hooks/
│   └── use-entity-authors/
│       └── use-entity-authors.hook.ts
├── repositories/
│   └── entity/
│       ├── entity.repository.keys.ts
│       ├── entity.query-options.ts
│       ├── entity.repository.queries.ts
│       ├── entity.repository.types.ts
│       ├── index.ts
│       └── gateways/
└── views/
    └── entity-list-view/
        ├── entity-list-view.view.tsx
        ├── styles.ts
        ├── index.ts
        └── hooks/
```

## Benefits

### 1. **Immediate Recognition**

A tab labelled `use-entity-list-business.hook.ts` states its layer without being opened. So does a stack frame.

### 2. **Better Search**

Searching `.query-options.ts` returns every options builder in the codebase. Role suffixes make the file system
queryable by layer.

### 3. **Consistency**

One casing rule, enforced by the linter, removes the per-file decision entirely. There is no PascalCase-for-components
exception to remember.

### 4. **Scalability**

The convention does not degrade as modules multiply, because names are scoped by folder rather than made unique by
prefix.

## Rules and Guidelines

### ✅ Do's

- Name every file and folder in kebab-case
- Repeat the file's full name in its test, suffix included
- Give a component its own folder when it has styles or a test
- Name a gateway implementation after its data source
- Keep `index.ts` free of logic

### ❌ Don'ts

- Don't use PascalCase or camelCase file names
- Don't put a component and its styles in one file
- Don't add a suffix to `styles.ts` or `index.ts`
- Don't invent a new suffix without adding it to this document
- Don't name two files identically in the same module, even in different folders

## Import Examples

```typescript
// ✅ Good — through the module barrel
import { EntityCard, EntityListView } from '@/modules/entity';

// ❌ Bad — reaching past the barrel into internals
import { EntityCard } from '@/modules/entity/components/entity-card/entity-card.component';
```

## Index Files

A barrel names its exports explicitly:

```typescript
// ✅ Good — explicit, greppable, and a deliberate public surface
export { EntityCard } from './entity-card/entity-card.component';
export type { Entity } from './entity.types';

// ❌ Bad at a module root — re-exports internals nobody chose to publish
export * from './components';
```

The module root barrel is the module's contract. Wildcard re-exports are acceptable one level down, inside a folder
whose contents are already private to the module.

### When a Barrel Earns Its Place

A barrel is a **public contract**: it declares what a module offers and hides everything else. That is the only job
worth an extra file.

Add one when:

- It is a module's or a shared entity's sole entry point
- It publishes a folder that outside code is meant to consume as a unit

Do **not** add one when:

- It aggregates unrelated infrastructure under one path — every consumer then inherits every dependency the barrel
  reaches, including those it does not use
- It re-exports a single symbol from a single file for a single consumer, adding a hop and nothing else
- It sits between two other barrels, so reaching one component costs three files

A barrel nobody imports through is not a contract — it is a file that exists. If every consumer reaches past it to the
concrete module, delete it: the bypass is the codebase reporting that the indirection buys nothing.

## Exceptions

Two directories are exempt from the kebab-case rule, and both exemptions are configured in the lint setup rather than
tolerated by convention:

| Directory    | Why                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| `src/app/**` | The router derives routes from file names; group folders and dynamic segments require parentheses and square brackets |
| `test/**`    | Setup and helper files predate the convention and are not part of the shipped source tree                             |

`__mocks__` folders are exempt from the folder rule only — the name is mandated by the test runner.

---

**Note**: The linter treats the middle segment as part of the name rather than as an extension, which is what makes
`entity.repository.keys.ts` legal. A new suffix therefore needs no configuration change — only an entry in this
document, so the set stays closed by agreement rather than by accident.
