# Getting Started

This guide takes a clone to a running application, then points at what to read next.

## 📋 Prerequisites

- **Node.js 22 or newer** — the version is pinned in `.nvmrc`; `nvm use` picks it up
- **pnpm** — the version is pinned in `package.json`; Corepack activates it automatically
- **Xcode** — for iOS builds and the simulator (macOS only)
- **Android Studio** — for Android builds and an emulator
- **Watchman** — recommended on macOS for faster file watching

**pnpm only.** Installing with a different package manager produces a lockfile the CI will reject and a dependency
tree nobody else has.

## 🚀 Quick Start

### 1. Install Dependencies

```sh
pnpm install
```

If this exits with an ignored-builds error, the workspace file is missing its build allowance. That setting must stay —
without it every install fails, locally and in CI.

### 2. Configure the Environment

```sh
cp .env.example .env
```

Environment variables read by the client are exposed at build time and must carry the public prefix. Anything without
it is stripped from the bundle.

### 3. Start the Development Server

```sh
pnpm start
```

### 4. Open the Application

Press `i` for the iOS simulator, `a` for the Android emulator, or scan the QR code with a device.

The first native run needs a build rather than just the dev server:

```sh
pnpm ios       # or: pnpm android
```

On a machine with 8 GB of memory, do **not** use those commands — see
**[Native Builds](./native-build.md)** for the build-then-boot sequence.

## 🛠️ Technology Stack

### Core

| Concern  | Choice                   |
| -------- | ------------------------ |
| Runtime  | React Native via Expo    |
| Language | TypeScript, strict mode  |
| Routing  | File-based, typed routes |

### Data and State

| Concern      | Choice                                             |
| ------------ | -------------------------------------------------- |
| Server state | A query cache, wrapped behind repositories         |
| Validation   | Schema validation at every response boundary       |
| Client state | A store factory with shared middleware             |
| Storage      | Async key-value storage, plus an encrypted adapter |

### Presentation

| Concern      | Choice                                                  |
| ------------ | ------------------------------------------------------- |
| Styling      | A theme-aware style engine with light and dark palettes |
| Translations | Typed catalogues, one module per locale                 |
| Lists        | A virtualized list implementation                       |

### Tooling

| Concern    | Choice                                                            |
| ---------- | ----------------------------------------------------------------- |
| Testing    | Jest with a native-aware preset, plus a component testing library |
| Linting    | ESLint with a zero-warning budget                                 |
| Formatting | Prettier, matching the linter's line width                        |
| Hooks      | Husky, with staged-file checks on commit and full checks on push  |

## ⌨️ Development Commands

### Core

```sh
pnpm start           # Start the development server
pnpm lint            # Lint — a warning fails like an error
pnpm lint:fix        # Lint and autofix
pnpm typecheck       # Type check the whole project
pnpm test            # Run the test suite with coverage
```

### Native Builds

```sh
pnpm prebuild        # Generate both native projects
pnpm android:build   # Regenerate and compile Android
pnpm android:install # Install the compiled build
pnpm doctor          # Check dependency versions against the SDK
```

See **[Native Builds](./native-build.md)** for the full set.

## ✅ Before You Push

```sh
pnpm lint
pnpm typecheck
pnpm test
```

The pre-push hook runs the last two anyway, so running them yourself only saves a round trip. The lint check runs on
staged files at commit time.

## 🧭 Architecture in One Minute

Features live in modules. A module is layered, and each layer has one job:

```
View → business hook → repository → gateway → api → network
```

- A **view** renders and holds no fetching logic
- A **business hook** is the only place a repository is called
- A **repository** owns caching, keys, and pagination
- A **gateway** abstracts the data source
- An **api** file wraps the HTTP client and validates responses

Read **[Module Architecture](./module-architecture.md)** before writing a feature.

## 🩺 Troubleshooting

**Install fails with an ignored-builds error:**

```sh
# The workspace build allowance is missing — restore it in pnpm-workspace.yaml
```

**Metro serves stale code:**

```sh
pnpm start --clear
```

**Types for routes are missing or wrong:**

```sh
# Route types are generated — start the dev server once to regenerate them
pnpm start
```

**A native change has no effect:**

```sh
# Native projects are generated output — regenerate them
pnpm prebuild
```

**The build crawls or the machine runs out of memory:**

Use the build-then-boot sequence in **[Native Builds](./native-build.md)**. Never hold the compiler, a device, and the
development server at once.

## 📚 Next Steps

- **[Project Structure](./project-structure.md)** - Where everything lives
- **[Module Architecture](./module-architecture.md)** - How a feature is layered
- **[Developer Guide](./developer-guide.md)** - Building a module step by step
- **[Rules and Conventions](./rules-conventions.md)** - What the tooling enforces
- **[Contributing](./contributing.md)** - Branches, commits, and delivery
