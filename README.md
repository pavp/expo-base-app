# expo-base-app

A React Native application built with Expo, structured around layered feature modules — schema-validated data access,
repository-owned caching, and a strict separation between what a screen renders and where its data comes from.

## 🚀 Quick Start

```bash
pnpm install
pnpm start
```

Press `i` for the iOS simulator, `a` for the Android emulator, or scan the QR code with a device.

**Requirements:**

- ✅ Node.js 22 or newer (pinned in `.nvmrc`)
- ✅ pnpm (pinned in `package.json` — Corepack activates it automatically)
- ✅ Xcode for iOS builds, Android Studio for Android builds

**pnpm only.** Installing with npm or yarn produces a lockfile CI rejects and a dependency tree nobody else has.

## 💡 Getting Started

1. **Install dependencies** — `pnpm install`
2. **Configure the environment** — copy `.env.example` to `.env`
3. **Start the development server** — `pnpm start`
4. **Open the app** — simulator, emulator, or a device

The first native run needs a compiled build rather than just the development server:

```bash
pnpm ios       # or: pnpm android
```

> **On a machine with 8 GB of memory, do not use those commands.** They boot a device before compiling, and the two
> compete for memory. See [Native Builds](docs/native-build.md) for the build-then-boot sequence.

## 🛠️ Development

```bash
pnpm start           # Development server
pnpm lint            # Lint — a warning fails like an error
pnpm typecheck       # Type check
pnpm test            # Test suite with coverage
pnpm android:build   # Compile Android without booting a device
pnpm doctor          # Check dependency versions against the SDK
```

## 🏗️ Architecture

Features live in modules. Each module is layered, and each layer has exactly one job:

```
View → business hook → repository → gateway → api → network
```

- A **view** renders and holds no fetching logic
- A **business hook** is the only place a repository is called
- A **repository** owns caching, query keys, and pagination
- A **gateway** abstracts the data source, so offline and network share one interface
- An **api** file wraps the HTTP client and validates every response against a schema

A module exposes one barrel and keeps everything else private. Read
[Module Architecture](docs/module-architecture.md) before writing a feature.

## 📦 Project Structure

```
src/
├── app/            # File-based routes — thin, one view each
├── api/            # HTTP client, endpoint map, client contract
├── components/     # App-level shared components
├── core/           # Cross-cutting hooks and library wrappers
├── localization/   # i18n setup and locale catalogues
├── modules/        # Feature modules
├── shared/         # Cross-module domain entities
├── styles/         # Themes, breakpoints, style engine config
├── types/          # Contracts shared across layers
└── ui/             # Presentational primitives
```

## 🔧 Features Included

- ✅ **Layered modules** — schemas, api, gateways, repositories, views
- ✅ **Schema validation** at every response boundary
- ✅ **Swappable data sources** through the gateway pattern
- ✅ **Light and dark themes** with contrast-checked palettes
- ✅ **Typed file-based routing** with per-route error boundaries
- ✅ **Internationalization** with typed catalogues
- ✅ **Co-located tests** with provider-aware render helpers
- ✅ **Enforced conventions** — kebab-case files, import order, no import cycles
- ✅ **CI on every pull request** — lint, types, tests, branch name, commit format

## 🤝 Development Guidelines

### 🌿 Branch Naming (Required)

```bash
<type>/<kebab-case-description>    # feat/add-author-filter
```

Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `ci`, `hotfix`. Validated before push and in CI.

### 📝 Commit Format (Required)

```bash
feat(entity): add author filter to the list view
```

Conventional commits, subject 72 characters or fewer, validated by a hook on every commit.

### 🔄 Development Workflow

```bash
git checkout -b feat/short-description
# ... work ...
pnpm lint && pnpm typecheck && pnpm test
gh pr create
```

Every change ships as a pull request with a squash merge — no size exemption, no direct pushes to `main`. Write the
pull request title as a conventional commit: the squash merge takes it as the commit message, and CI never sees it.

## ⚠️ Common Warnings & Workarounds

### Package Manager

`pnpm install` exiting with `ERR_PNPM_IGNORED_BUILDS` means the build allowance is missing from `pnpm-workspace.yaml`.
Restore it — without it every install fails, locally and in CI.

### Low-Memory Builds

`pnpm ios` and `pnpm android` boot a device before compiling. On an 8 GB machine that starves the compiler. Compile
first, boot second: `pnpm android:build`, then start the emulator, then `pnpm android:install`.

### Native Changes

Native projects are generated output. A change to `app.config.ts` or a config plugin needs `pnpm prebuild` before it
has any effect, and lint, types, and tests all pass whether or not it reached the manifest.

## 📚 Documentation

Here you have the documentation for this project. Please read it before starting to work, and ask anybody on the team
if you have a question, find something unclear, or think something is missing or could be improved.

### Getting Started

- [Setup](docs/setup.md) - Prerequisites, first run, and troubleshooting
- [Project Structure](docs/project-structure.md) - Where everything lives and which way imports flow
- [Rules and Conventions](docs/rules-conventions.md) - Every rule enforced by tooling
- [File Naming Conventions](docs/file-naming-conventions.md) - Kebab-case, role suffixes, and exemptions
- [Testing](docs/testing.md) - Structure, mock levels, and render helpers
- [Contributing](docs/contributing.md) - Branches, commits, and delivery

### Architecture & Patterns

- [Module Architecture](docs/module-architecture.md) - The layers, the data flow, and when to use them
- [Repository Pattern](docs/repository-pattern.md) - Query keys, caching, pagination, and mutations
- [Gateway Pattern](docs/gateway-pattern.md) - Abstracting data sources behind one contract
- [Hook Patterns](docs/hook-patterns.md) - The business and controller split, and where hooks live

### Platform

- [Theming](docs/theming.md) - Design tokens, palettes, and the style engine
- [Navigation](docs/navigation.md) - File-based routes, layouts, and typed navigation
- [Internationalization](docs/intl.md) - Typed catalogues and language selection
- [Native Builds](docs/native-build.md) - Config plugins, regeneration, and low-memory hosts

### Development Guide

- [Developer Guide](docs/developer-guide.md) - Building a module end to end, step by step

## External Libraries

- [Expo](https://docs.expo.dev/) — the React Native platform and build tooling
- [Expo Router](https://docs.expo.dev/router/introduction/) — file-based navigation
- [TanStack Query](https://tanstack.com/query/latest) — server state and caching
- [Zod](https://zod.dev/) — schema validation
- [Zustand](https://zustand.docs.pmnd.rs/) — client state
- [Unistyles](https://www.unistyl.es/) — theme-aware styling
- [i18next](https://www.i18next.com/) — internationalization
- [Testing Library](https://callstack.github.io/react-native-testing-library/) — component testing
