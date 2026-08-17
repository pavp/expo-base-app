# Project Structure

This document outlines how the codebase is organized, what belongs in each directory, and the import rules that keep
those boundaries intact.

## Directory Layout

```sh
.
├── index.ts                    ## Entry point: expo-router registration + styles bootstrap
├── app.config.ts               ## Expo configuration (dynamic, TypeScript)
├── plugins/                    ## Expo config plugins applied at prebuild time
├── src/
│   ├── app/                    ## expo-router file-based routes (NON-default location)
│   ├── api/                    ## Shared HTTP infrastructure
│   │   ├── common/             ## Axios instance and shared constants
│   │   ├── http-client/        ## Schema-validating client wrapper
│   │   ├── endpoints.ts        ## Endpoint path map
│   │   └── api.types.ts        ## Client contract and error types
│   ├── components/             ## App-level shared components (not primitives)
│   ├── core/                   ## Cross-cutting infrastructure
│   │   ├── hooks/              ## Framework-agnostic hooks used across modules
│   │   └── lib/                ## Thin wrappers over third-party libraries
│   ├── localization/           ## i18n setup and locale modules
│   ├── modules/                ## Feature modules (the bulk of the application)
│   ├── shared/                 ## Cross-module domain entities
│   ├── styles/                 ## Theme definitions, breakpoints, style engine config
│   ├── types/                  ## Contracts shared across layers
│   └── config.ts               ## Environment-derived configuration
├── test/                       ## Test setup, render helpers, entity mocks
├── scripts/                    ## Repository automation
├── .github/                    ## CI workflows and composite actions
└── .husky/                     ## Git hooks
```

## Directory Descriptions

### Feature Modules (`modules/`)

A module owns one feature end to end. It is the only directory that grows as the product grows, and each module is
internally layered:

#### Data Layer

`<module>.types.ts` holds the validation schemas and their inferred types. `api/` wraps the HTTP client in a
contract-plus-factory-plus-singleton trio. `repositories/<module>/gateways/` holds one implementation per data source
behind a shared interface.

#### Application Layer

`repositories/<module>/` composes query keys, query-options builders, and the hooks that consume them. This layer
decides caching, pagination, and invalidation — nothing above it touches those concerns.

#### Presentation Layer

`views/` holds screens, `components/` holds the module's own components, and `hooks/` holds logic shared by more than
one of them. Views and components never reach into the data layer directly; a business hook sits between them.

Each module exposes a single `index.ts` barrel that names its public exports explicitly. Everything not named there is
private to the module, including gateways, query keys, and query-options builders.

### Shared Entities (`shared/`)

An entity used by more than one module lives here rather than inside whichever module happened to need it first. The
internal shape mirrors a module's data and application layers, minus the presentation layer — a shared entity has no
views of its own.

Like modules, each shared entity exposes one barrel and keeps the rest private.

### Core Infrastructure (`core/`)

`core/lib/` holds thin wrappers over third-party libraries so the rest of the codebase imports the wrapper instead of
the library. That indirection is what lets a library be configured once, mocked once, or swapped without touching call
sites.

`core/hooks/` holds hooks with no domain knowledge — the kind that would be equally at home in another application.

Nothing in `core/` may import from `modules/` or `shared/`. The dependency arrow points one way.

### Shared API Infrastructure (`api/`)

The single HTTP client instance, the endpoint map, and the client contract. No entity lives here — entities own their
own API layer inside their module or shared folder.

The client wrapper validates every response against a schema supplied by the caller, so an upstream shape change
surfaces as a typed error at the boundary rather than as an undefined field three layers up.

### Routes (`app/`)

File-based routes. Route files are thin by rule: each imports one view, re-exports the shared error boundary, and
renders the view. Screen logic lives in the module, not here.

### Presentational Primitives (`ui/`)

Generic, reusable components with no domain knowledge. A primitive receives every string as a prop and never reads
translations or fetches data.

### App-Level Components (`components/`)

Shared components that are not primitives — the ones that translate their own copy, own application state, or reach
into a module. The distinction from `ui/` is behavioral, not visual.

### Design System (`styles/`)

Theme definitions, breakpoints, and the style engine configuration. This is the only palette in the codebase; a second
source of colour values is a defect.

### Global Configuration (`config.ts`, `app.config.ts`, `plugins/`)

`config.ts` derives typed values from environment variables. `app.config.ts` is the Expo configuration and registers
config plugins. `plugins/` holds those plugins — each one patches native project files at prebuild time.

### Testing (`test/`)

Jest setup, polyfills, render helpers that wrap components in the application's providers, and entity mock factories.
Tests themselves are co-located next to the file under test, not here.

## Importing Files

Path aliases are declared once and mirrored in the Jest configuration so imports resolve identically in both.

### Import Examples

```typescript
// Through a module barrel — the only legal way in from outside
import { EntityView, useEntityAuthors } from '@/modules/entity';

// Shared entity, also through its barrel
import { entityRepository } from '@/shared/entity';

// Core infrastructure
import { useDebouncedValue } from '@/core/hooks';

// Primitives
import { EmptyState } from '@/ui';

// Test helpers
import { renderWithProviders } from '@/test/test-utils';
```

### Path Mapping Configuration

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/test/*": ["./test/*"],
    "@/assets/*": ["./assets/*"]
  }
}
```

## Import Direction

Dependencies flow in one direction. A violation of this list is an architectural defect, not a style preference:

- `app/` may import from `modules/`, `components/`, and `ui/`
- `modules/` may import from `shared/`, `core/`, `api/`, `ui/`, `styles/`, and `localization/`
- `shared/` may import from `core/` and `api/`
- `core/` imports from none of the above
- `ui/` imports from `styles/` only

A module never imports another module's internals. If two modules need the same thing, it belongs in `shared/` or
`core/`.

Import cycles are a lint error, not a warning. When a cycle appears between a helper and its consumer, the usual fix is
a type-only import — types are erased at compile time and break the runtime cycle without changing the code's shape.

## Related Documentation

- **[Module Architecture](./module-architecture.md)** - The layering rules inside a module
- **[File Naming Conventions](./file-naming-conventions.md)** - How files and folders are named
- **[Rules and Conventions](./rules-conventions.md)** - Every rule enforced by tooling
- **[Developer Guide](./developer-guide.md)** - Step-by-step module creation
