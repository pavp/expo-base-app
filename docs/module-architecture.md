# Module Architecture

This document explains how a feature module is layered, why the layers exist, and when the full structure is worth its
cost.

## Overview

A module owns one feature end to end — its data contracts, its network calls, its caching, its screens. Nothing about
that feature lives outside the module, and nothing inside it is reachable except through its public barrel.

The layering exists to answer one question consistently: **when a requirement changes, how many files have to change?**
A screen redesign should not touch networking. A change of data source should not touch a screen.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION                                               │
│  views/  components/  hooks/                                │
│  Renders state. Owns no data-fetching decisions.            │
└───────────────────────────┬─────────────────────────────────┘
                            │ business hooks
┌───────────────────────────▼─────────────────────────────────┐
│  APPLICATION                                                │
│  repositories/<module>/                                     │
│  Query keys, options builders, exported hooks.              │
│  Owns caching, pagination, invalidation.                    │
└───────────────────────────┬─────────────────────────────────┘
                            │ gateway contract
┌───────────────────────────▼─────────────────────────────────┐
│  DATA                                                       │
│  <module>.types.ts  api/  repositories/*/gateways/          │
│  Schemas, transport, one implementation per data source.    │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

Always top-down. A layer may call the one below it and never the one above:

```
View → business hook → repository → gateway → api → HTTP client → network
                                                  ↓
                                          schema validation
```

Skipping a layer is the defect this architecture exists to prevent. A view that calls a repository directly compiles,
passes tests, and quietly couples a screen to a caching decision.

## Core Principles

### 1. **Dependency Inversion**

The application layer depends on a gateway _interface_, not on any implementation. Which implementation it receives is
a runtime argument. That is what makes a second data source an addition rather than a rewrite.

### 2. **Single Responsibility**

Each file answers one question. Query keys answer "what identifies this cache entry". Options builders answer "how is
it fetched and cached". Gateways answer "where does it come from". When a file starts answering two, it splits.

### 3. **Testability**

Every layer is testable without the ones around it. The options builder is a pure function — call it, assert on the
object. A gateway needs only a mocked transport. A view needs only a mocked business hook.

### 4. **Explicit Boundaries**

The module barrel is a contract, not a convenience. Everything unexported is free to change without coordinating with
any other part of the codebase.

## Layer Responsibilities

### Presentation Layer

`views/` holds screens; `components/` holds the module's own components; `hooks/` holds logic shared by more than one
of them.

Views and components never call a repository. A **business hook** sits between them and owns every data-access
decision. When a view also has UI-only state — a search term, a selected filter — a **controller hook** owns that,
separately.

### Application Layer

`repositories/<module>/` composes four files: a key factory, options builders, the exported hooks, and the
repository's own interface. Its `index.ts` assembles them into a single object.

This is where caching lives. Pagination is derived here, not in a component. Query keys are built here, not inlined at
call sites — a key spelled by hand in two places is two cache entries that were meant to be one.

### Data Layer

`<module>.types.ts` holds schemas and the types inferred from them — one declaration, not a schema plus a hand-written
mirror that drifts.

`api/` wraps the HTTP client as a contract, a factory, and a singleton. The contract is what tests fake; the factory is
what makes the contract satisfiable; the singleton is what production uses.

`repositories/*/gateways/` holds one implementation per data source behind a shared interface, plus the factory that
selects between them.

## When to Use This Architecture

The full stack is not free. It is roughly six files before a single pixel renders, and that cost is only repaid when
the feature actually has the variability the layers absorb.

**✅ Use the full structure for:**

- Features with more than one data source, or a credible near-term second one
- Server data that needs caching, pagination, or invalidation
- Domain logic that outlives any one screen
- Anything more than one screen consumes

**❌ Consider a lighter shape for:**

- A single data source with no second one in sight — skip the gateway layer entirely; an interface with one
  implementation is indirection with no decision behind it
- Purely local UI state with no server data — a controller hook alone is enough
- A screen with no data at all — a view is enough

Dropping the gateway is the common and correct reduction. The data layer keeps its schemas and its api file; the
options builder simply calls the api directly, and the query key loses its data-source segment because there is no
source to distinguish.

## Benefits

### ✅ Advantages

- **Change isolation** — a new data source adds a file; it does not edit a screen
- **Testable in units** — each layer has a natural seam, so tests do not need the whole stack
- **Predictable navigation** — every module has the same shape, so finding code is not a search problem
- **Enforced boundaries** — the barrel makes the public surface a deliberate decision

### ⚠️ Considerations

- **File count** — a trivial feature pays real overhead for flexibility it may never use
- **Indirection** — following a value from screen to network crosses several files
- **Discipline required** — nothing physically prevents a view from importing a repository; the rule holds by review

## Next Steps

- **[Repository Pattern](./repository-pattern.md)** - Caching, keys, and query-options builders
- **[Gateway Pattern](./gateway-pattern.md)** - Abstracting multiple data sources
- **[Hook Patterns](./hook-patterns.md)** - The business and controller split
- **[Developer Guide](./developer-guide.md)** - Building a module step by step
