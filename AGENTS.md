# AGENTS.md

Architecture and convention contract for `expo-base-app`. Read this before changing any file. Every claim below is
anchored to a path in this repository.

Expo SDK 57 / React Native 0.86.2 / React 19 / TypeScript strict. Package manager is **pnpm 11.11.0**, pinned by
`packageManager` in `package.json`.

## Refactor in progress — read first

This repository is mid-refactor. A phased architecture overhaul is underway, and this document describes **what exists
today**, not the target state.

The target is the structure used by the sibling `create-scaffold-nextjs-app` repository, adapted to React Native.

- **Phase 0 (done):** tooling foundation — pnpm, TypeScript strict, CI at `.github/workflows/pr-validation.yml`, git
  hooks in `.husky/`.
- **Phase A (done):** conventions and cross-cutting infrastructure — type suffixes on filenames, the `src/core/` layer,
  derived environment flags, a Zod-validating http client, gateway type contracts, and the Zustand store factory.
- **Phase B (done):** `src/modules/feed/` — one module carrying posts and comments end to end: Zod schemas → dual
  gateway (`http`/`asyncStorage`) → query-only repository (keys, query-options, queries) → views. It absorbed
  `src/api/post/`, `src/api/comment/`, and the former `home`, `explore` and `post` modules; none of those four
  locations exist anymore. `react-query-kit` is no longer used inside `feed` — see "Server state" below.
- **Phase C (not started):** `src/modules/settings/` and `src/shared/user/`, following the pattern Phase B established.
  `@/api/user` deliberately stays at the api layer, on `react-query-kit`, until Phase C moves it.
- **Phase D (not started):** improvements the reference scaffold does not have — enforced module boundaries, a real
  React error boundary, schema-validated env, and a module generator.

Practical consequences for an agent working here now:

- `@/api/user` is temporary. It moves into `src/shared/user/` in Phase C — do not build on its current shape, and do
  not add a fourth entity beside it at the api layer (posts and comments are gone from `src/api/`; feed logic belongs
  in `src/modules/feed/`, not back in `src/api/`).
- `src/modules/feed/` is the only module today. Views/components never call `feedRepository` directly — data access
  lives in a `use-*-business` hook beside the view or component that needs it (see "Feature modules" below).
- `src/store/` is a holdover (TD-12). New stores belong beside their owner, not there.
- Every store goes through `createStoreWithMiddleware`; importing `zustand` directly is a lint error outside
  `src/core/lib/zustand/**`.

Anything not listed above is stable enough to build on.

## Non-negotiables

1. **pnpm only.** Never `npm`, `yarn`, or `npx`. Use `pnpm` and `pnpm exec`. Node `>=22` (`.nvmrc` = `22`).
2. **Every change ships as a PR with squash merge.** No exceptions for size. No direct pushes to `main`.
3. **Branch names must match `<type>/<kebab-case>`** — enforced by `scripts/validate-branch-name.js` and by the
   `validate-branch-name` CI job. Types: `feat|fix|chore|refactor|docs|test|perf|ci|hotfix`. `main` and `dependabot/*`
   are exempt.
4. **Commits are conventional commits** — enforced by `commitlint.config.js` via `.husky/commit-msg`. `type-enum` is
   closed to `feat|fix|chore|refactor|docs|test|perf|ci|style|build|revert`. `subject-max-length` is 72. Scope is
   optional and unrestricted by design (no `scope-enum`) — scopes are feature-module names.
5. **`pnpm lint` must be clean.** It runs with `--max-warnings 0`, so a warning fails the build like an error.
6. **TypeScript is strict** (`tsconfig.json`). `pnpm typecheck` must pass.

## Commands

| Command                 | What it does                                                                  |
| ----------------------- | ----------------------------------------------------------------------------- |
| `pnpm install`          | Installs from `pnpm-lock.yaml`.                                               |
| `pnpm start`            | `expo start` — Metro dev server.                                              |
| `pnpm lint`             | `eslint . --max-warnings 0` — a warning fails like an error.                  |
| `pnpm lint:fix`         | Same, with `--fix`.                                                           |
| `pnpm typecheck`        | `tsc --noEmit`.                                                               |
| `pnpm test`             | `jest`. Coverage is collected on every run (`collectCoverage: true`).         |
| `pnpm web`              | `expo start --web`.                                                           |
| `pnpm android`          | `expo run:android` — boots a device before compiling. See "Low-memory hosts". |
| `pnpm ios`              | `expo run:ios` — boots a simulator before compiling. See "Low-memory hosts".  |
| `pnpm android:prebuild` | `expo prebuild --platform android --clean` with `LOCAL_ANDROID_BUILD=1`.      |
| `pnpm android:build`    | `android:prebuild`, then `./gradlew assembleDebug --no-daemon`.               |
| `pnpm android:install`  | `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`.           |
| `pnpm prebuild`         | `expo prebuild` (both platforms).                                             |
| `pnpm build-android`    | `eas build -p android --profile preview`.                                     |
| `pnpm doctor`           | `expo install --check`.                                                       |
| `pnpm reset-project`    | `scripts/reset-project.js` — Expo template script.                            |

`pnpm-workspace.yaml` carries `allowBuilds: unrs-resolver: true`. Do not remove it: without it `pnpm install` exits 1
with `ERR_PNPM_IGNORED_BUILDS`, which breaks every install and every CI job.

## Before you finish a change

```bash
pnpm lint       # --max-warnings 0: a warning fails like an error
pnpm typecheck
pnpm test
```

`.husky/pre-push` runs `typecheck` + `test` anyway, so running them yourself only saves a round trip.

## Delivery

Every change ships as a **PR with squash merge**. No exceptions for size, no direct pushes to `main`.

```bash
git checkout -b feat/short-kebab-description   # <type>/<kebab-case>, enforced in CI
# ... work ...
git commit -m "feat(explore): add author filter"   # conventional commit, subject <= 72 chars
gh pr create
```

The squash-merge commit takes the **PR title**, and the `validate-commits` CI job never sees it (TD-10) — so write the
PR title as a conventional commit too.

Do not commit or push unless the user asks.

## Recipes

### Add a screen

1. Add or extend a module under `src/modules/<feature>/views/<name>-view/` — `<name>-view.tsx`, `styles.ts`,
   `<name>-view.test.tsx`.
2. Export it from `src/modules/<feature>/index.ts`.
3. Add the route file under `src/app/` that renders it and nothing else.
4. Register it in the enclosing `_layout.tsx` if it needs a title or options; add the title key to **both**
   `src/localization/locales/en-us.ts` and `es-es.ts`.

### Add an API call

Only `@/api/user` still uses the old `react-query-kit` flow, and it is Phase C scope — do not extend it. Every other
entity follows `feed`'s module/gateway/repository shape:

1. Add the Zod schema and its inferred type to the module's `<module>.types.ts`. Add or extend the endpoint path in
   `src/api/endpoints.ts` (or a module-local constants file, if the module has its own).
2. Add the call to the module's `api/<module>-api.ts` — a thin `httpClient` call with `responseSchema` wired to the
   Zod schema. No `createQuery`/`createInfiniteQuery`.
3. Add or extend the gateway(s) behind `repositories/<module>/gateways/` (`http-gateway`, plus `async-storage-gateway`
   if the module needs an offline/local `DataSource`), each implementing the module's `*Gateway` contract.
4. Add the query key to `<module>.repository.keys.ts`, the `queryOptions`/`infiniteQueryOptions` builder to
   `<module>.query-options.ts`, and the exported hook to `<module>.repository.queries.ts` — positional
   `(filters, dataSource, options)` signature, exactly `max-params: 3`.
5. Test at the layer that owns the behavior: `axios-mock-adapter` for the api/gateway layers, pure function calls for
   the query-options builder (no rendering, no network), `renderHookWithProviders` + `axios-mock-adapter` for the
   repository hook. Do not add a dedicated test for the Zod schema itself — schemas are exercised through the
   consumer that actually parses a payload (e.g. `<module>-api.test.ts`), not in isolation.
6. Views/components never call the repository directly — add a `use-<owner>-business` hook that does, per "Layering
   rules" under "Feature modules" above.

### Add a UI primitive

`src/ui/<name>/<name>.tsx` + `styles.ts`, exported from `src/ui/index.ts`. No data fetching, no `useTranslation` — take
strings as props. `src/ui` is inside the coverage globs, but most primitives still lack tests; write the test anyway.

### Add a theme token

Edit `src/styles/themes.ts`. A colour goes in **both** `lightTheme` and `darkTheme`; a scale value goes in
`commonTheme`. Types flow automatically through the module augmentation in `src/styles/unistyles.ts`. Do not introduce a
second palette.

### Add a string

Same key in both `src/localization/locales/en-us.ts` and `es-es.ts`, read with `t('...')`.

### Run the app on a low-memory Mac

Do not use `pnpm ios` / `pnpm android` on an 8 GB machine — see "Low-memory hosts" below.

### Debug a failing `pnpm install`

`ERR_PNPM_IGNORED_BUILDS` means `allowBuilds: unrs-resolver: true` is missing from `pnpm-workspace.yaml`. Restore it.

### Edit this file

`.husky/pre-commit` runs `prettier --write` over `*.md`, so match `.prettierrc.js` (`printWidth: 120`, single quotes) or
your markdown will be reformatted under you. `CLAUDE.md` is a pointer to this file and holds no content of its own —
everything belongs here.

## Directory map

```
index.ts                     -> `import 'expo-router/entry'` + `import './src/styles/unistyles'`
app.config.ts                -> Expo config (dynamic, TS)
plugins/with-local-gradle-tuning.js -> config plugin, applied in app.config.ts
src/
  app/                       -> expo-router file-based routes (NON-default location)
  api/                       -> axios client + the one remaining react-query-kit entity (user)
  components/                -> app-level shared components (not primitives)
  config.ts                  -> env-derived config (`EXPO_PUBLIC_API_URL`)
  hooks/                     -> cross-cutting hooks (`hooks/common/*`)
  lib/async-storage/         -> thin AsyncStorage get/set wrapper
  localization/              -> i18next setup + TS translation modules
  modules/                   -> feature modules: feed (posts + comments end to end; see "Feature modules" below)
  store/                     -> Zustand client state (one store)
  styles/                    -> unistyles config, themes, breakpoints
  ui/                        -> presentational primitives
test/                        -> jest setup, polyfills, render helpers, entity mocks
scripts/                     -> validate-branch-name.js, reset-project.js
.github/                     -> pr-validation workflow + setup-node-pnpm composite action
.husky/                      -> pre-commit, commit-msg, pre-push
```

Path aliases (`tsconfig.json`, mirrored in `jest.config.ts` `moduleNameMapper`):

- `@/*` -> `./src/*`
- `@/test/*` -> `./test/*`
- `@/assets/*` -> `./assets/*`

## Navigation

expo-router, file-based, rooted at **`src/app/`** — not the default `app/`. The root `index.ts` does
`import 'expo-router/entry'`.

Route tree as it exists:

```
src/app/_layout.tsx                  -> Stack: APIProvider > SafeAreaProvider > ThemeProvider
src/app/(drawer)/_layout.tsx         -> Drawer, custom content via components/navigation/custom-drawer-content
src/app/(drawer)/(tabs)/_layout.tsx  -> Tabs (home, explore)
src/app/(drawer)/(tabs)/index.tsx    -> renders <HomeView /> from @/modules/feed
src/app/(drawer)/(tabs)/explore.tsx  -> renders <ExploreView /> from @/modules/feed
src/app/post/[id].tsx                -> renders <PostDetailView /> from @/modules/feed
src/app/settings/index.tsx           -> settings screen (+ local styles.ts)
```

**Route files are thin.** They render one view from a module and nothing else — see
`src/app/(drawer)/(tabs)/index.tsx`. Put screen logic in `src/modules/<feature>/views/`, not in `src/app/`.

`experiments.typedRoutes: true` in `app.config.ts`, so route types come from `.expo/types`.

Layouts read the palette via `UnistylesRuntime.getTheme(rt.themeName)` rather than a captured `theme` — see the comment
in `src/app/_layout.tsx`; navigator `screenOptions` otherwise render with a stale theme.

## Feature modules (`src/modules/`)

One module exists: `feed` (posts + comments end to end). It carries every layer the target architecture defines:

```
src/modules/feed/
├── index.ts                       -> public barrel — the ONLY import surface from outside the module
├── feed.types.ts                  -> Zod schemas + z.infer'd types (Post, Comment, FeedFilters)
├── api/
│   ├── feed-api.ts                -> thin httpClient calls, Zod responseSchema wiring
│   └── helpers/<name>/             -> one folder per helper, colocated with its consumer
├── components/
│   ├── index.ts                   -> named exports only, never `export *`
│   └── <component>/                -> <component>.tsx + styles.ts + .test.tsx; hooks/ only if it fetches its own data
├── hooks/                          -> module-level hooks: consumed by 2+ views (e.g. use-post-authors)
├── repositories/feed/
│   ├── feed.repository.keys.ts    -> query key factory
│   ├── feed.query-options.ts      -> queryOptions/infiniteQueryOptions builders — pagination lives here
│   ├── feed.repository.queries.ts -> the exported hooks (useFeedPosts, useFeedPost, useFeedComments)
│   ├── feed.repository.types.ts   -> the repository's own interface
│   ├── index.ts                   -> feedRepository singleton
│   └── gateways/
│       ├── feed.gateway.types.ts  -> FeedGateway contract
│       ├── http-gateway/          -> DataSource: 'http'
│       ├── async-storage-gateway/ -> DataSource: 'asyncStorage'
│       └── index.ts               -> createFeedGateway(dataSource) factory
└── views/
    └── <name>-view/
        ├── <name>-view.view.tsx
        ├── styles.ts
        ├── <name>-view.view.test.tsx
        ├── index.ts
        └── hooks/                  -> view-private hooks: consumed by exactly this one view
```

Conventions in force:

- The module has one `index.ts` barrel that names its public exports explicitly (never `export *` from the module
  root). It exports **only** components, types, module-level hooks, the repository singleton, and views — never a
  gateway, query-options builder, or key factory. That is the module-boundary contract (TD-6, resolved): nothing
  outside `src/modules/feed/` may import `@/modules/feed/{components,hooks}` directly, and nothing inside the module
  reaches into a sibling module's internals, because there is no sibling module to reach into.
- Add subfolders (`components/`, `hooks/`) only when the module actually needs them — do not scaffold empty ones.
- A view lives in its own folder: `views/<name>-view/<name>-view.view.tsx` plus a sibling `styles.ts` and
  `<name>-view.view.test.tsx`.
- Nested components repeat the same shape one level down — see
  `src/modules/feed/components/posts-vertical-carousel/components/posts-vertical-carousel-item/`.

### Layering rules — where data access lives

- **Views and components never call the repository directly.** Data access lives in a `use-<owner>-business` hook
  colocated with the view or component that needs it — see
  `src/modules/feed/components/comment-list/hooks/use-comment-list-business/` for a component that fetches its own
  data, and `src/modules/feed/views/home-view/hooks/use-home-business/` for a view.
- **Consumer count decides where a hook lives**: a hook consumed by exactly one view is that view's own hook, under
  `views/<view>/hooks/` (e.g. `use-post-detail-business`). A hook consumed by 2+ views is module-level, under
  `src/modules/feed/hooks/` (e.g. `use-post-authors`, shared by `home-view` and `explore-view`).
- **A controller hook is added only when a view has genuine UI-only state** — local state/handlers that are not data
  fetching (e.g. a search term, a selected filter). `use-<view>-business` owns data; `use-<view>-controller` owns
  that UI state and composes with the business hook. `home-view` and `post-detail-view` have no UI-only state, so
  neither has a controller hook; `explore-view` does (`searchTerm`, `authorId`), so it has both
  `use-explore-business` and `use-explore-controller`. Do not add an empty controller hook "for symmetry."

### File-name suffixes

On top of Phase A's `.hook.ts`, `.view.tsx`, `.component.tsx` and `.store.ts`, Phase B added four more, all under
`kebab-case.suffix.ts` and subject to the same `check-file` kebab-case rule:

| Suffix                 | Meaning                                                           | Example                                                                |
| ---------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `*.gateway.ts`         | A gateway implementation behind a `DataSource` switch             | `http-gateway.ts`, `async-storage-gateway.ts`                          |
| `*.repository.ts`      | A repository object (aggregates keys + query-options + queries)   | not yet a standalone file in `feed` — see `repositories/feed/index.ts` |
| `*.query-options.ts`   | `queryOptions`/`infiniteQueryOptions` builders for one repository | `feed.query-options.ts`                                                |
| `*.repository.keys.ts` | A query key factory for one repository                            | `feed.repository.keys.ts`                                              |

## `src/ui/` — primitives

Seven primitives, each a folder with the component and (where it styles anything) a `styles.ts`:

`activity-indicator`, `avatar`, `empty-state`, `filter-chips`, `material-icon`, `safe-area-view`, `search-input`, plus
`src/ui/index.ts`.

`ActivityIndicator` must be imported from `@/ui`, never from `react-native` — enforced by `no-restricted-imports` in
`eslint.config.js` (the rule is disabled inside `src/ui/**` so the primitive itself can wrap it).

`src/components/` is for app-level shared components that are not primitives: `api-provider`, `navigation/*`,
`settings-option`, `theme-button`.

## Server state

Two shapes coexist, by design, not by inconsistency: the api layer (`src/api/`, one entity left) for what Phase C
hasn't absorbed yet, and the module/gateway/repository layer (`src/modules/feed/`) for what Phase B already moved.

### `src/api/` — `react-query-kit` hooks (Phase C scope)

- `src/api/common/client.ts` — the single axios instance, `baseURL: config.apiURL` from `src/config.ts`
  (`EXPO_PUBLIC_API_URL`).
- `src/api/endpoints.ts` — `API_ENDPOINT` string map. Add new paths here, not inline.
- One hook per operation, in its own folder, colocated with its test:
  `src/api/user/use-get-users/use-get-users.hook.ts` + `.hook.test.ts`.
- Hooks are built with `createQuery` / `createInfiniteQuery` from `react-query-kit` (still a dependency — check
  `package.json` before assuming it is gone; it stays until Phase C moves `user`), typed `<Data, Variables, AxiosError>`.
  See `src/api/user/use-get-users/use-get-users.hook.ts`.
- Entity types live in `src/api/<entity>/types.ts` (e.g. `User` in `src/api/user/types.ts`); shared envelope types in
  `src/api/api.types.ts`.
- Barrels: `src/api/<entity>/index.ts` re-exports the entity's hooks and types; `src/api/index.ts` re-exports the
  entities. `@/api/user` is the only entity here — posts and comments moved to `src/modules/feed/` in Phase B and do
  not belong back in `src/api/`; `@/api/user` stays deliberately, as Phase C scope.

### `src/modules/feed/` — module/gateway/repository (Phase B shape, the target pattern)

- No `react-query-kit`. Raw `@tanstack/react-query` (`useQuery`/`useInfiniteQuery`) called from
  `feed.repository.queries.ts`, configured by `queryOptions`/`infiniteQueryOptions` builders in
  `feed.query-options.ts`.
- Views/components call `feedRepository.queries.useFeedPosts(filters?, dataSource?, options?)` (and
  `useFeedPost`/`useFeedComments`) through a `use-*-business` hook, never inline — see "Layering rules" under
  "Feature modules" above.
- A gateway (`http` or `asyncStorage`, chosen via `DataSource`) sits behind the repository; the repository never
  calls `httpClient`/AsyncStorage directly. See "Feature modules" above for the full tree.
- Zod validates every HTTP response through `feed.types.ts`'s schemas, wired in via `httpClient`'s `responseSchema`
  option (Phase A's contract, reused as-is).

The provider is `src/components/api-provider/api-provider.tsx`, mounted in `src/app/_layout.tsx` — shared by both
shapes above, one `QueryClient` for the whole app.

The upstream API is jsonplaceholder-shaped: endpoints return bare arrays, not a pagination envelope. Pagination in
`feed.query-options.ts` is derived from page length (`lastPage.length === DEFAULT_LIMIT`), preserved unchanged from
the pre-Phase-B `use-get-posts` hook it replaced. See TD-4 before touching `src/api/common/utils.ts`.

## Client state — Zustand

**Every store is built with `createStoreWithMiddleware` from `@/core/lib/zustand`** — importing `zustand` directly is a
lint error outside `src/core/lib/zustand/**` and `test/**`. The factory composes immer, `persist` (AsyncStorage) and
devtools, and drops `actions` and `hasHydrated` from the persisted payload. Pass `exclude` for anything else that must
stay out, and `storage` to persist somewhere other than AsyncStorage.

One store exists today: `src/store/user-store/user-store.store.ts`, holding `user: { accessToken } | null` with
`setCredentials` / `removeCredentials`. Its actions are flat rather than nested under `state.actions`; Phase C rewrites
this store, and nesting them now would only churn `src/api/common/client.ts`. See TD-11 for the token's storage and
TD-12 for where stores are meant to live.

Tests reset stores through `test/__mocks__/zustand/index.ts`, which wraps `create` and registers reset functions — the
reason the factory funnels every store through a single `create` call.

## Styling — `react-native-unistyles` v3

- Themes: `src/styles/themes.ts` — `commonTheme` (spacing/radius/fontSize scales) spread into `lightTheme` and
  `darkTheme`. Colour choices carry contrast rationale in comments; keep them when editing.
- Breakpoints: `src/styles/breakpoints.ts`.
- `StyleSheet.configure` and the `declare module 'react-native-unistyles'` augmentation: `src/styles/unistyles.ts`.
  `initialTheme: 'light'`.
- Root `index.ts` imports `./src/styles/unistyles` so configuration runs before any component.
- Styles go in a sibling `styles.ts` using `StyleSheet.create((theme) => ({ ... }))` and read tokens from `theme`.

Never hardcode a hex value in a component. `src/styles/themes.ts` is the only palette; do not reintroduce a second one.

## i18n — `src/localization/`

`i18next` + `react-i18next`. Setup in `src/localization/i18n.ts`; initial language is the device locale
(`expo-localization`), falling back to `config.translation.defaultLocale`. A stored preference is applied later by
`src/hooks/common/use-init-language/use-init-language.ts`.

Translations are **TypeScript modules, not JSON**: `src/localization/locales/en-us.ts`, `es-es.ts`, re-exported from
`locales/index.ts` as `en_US` / `es_ES`. Supported languages: `['en', 'es']`.

Add every user-facing string here and read it via `useTranslation()`. Add the key to **both** locale files.

## Tests

Jest with the `jest-expo` preset (`jest.config.ts`), `testEnvironment: 'jsdom'`, `clearMocks: true`. 31 test files
currently.

- Tests are **co-located**: `<name>.test.ts(x)` next to the file under test.
- Render through `@/test/test-utils`, never `@testing-library/react-native` directly —
  `no-restricted-imports` enforces this (disabled inside `test/**`). `test/test-utils.tsx` re-exports RNTL and adds
  `renderWithProviders` / `renderHookWithProviders`, which wrap in a `QueryClientProvider` with `retry: false` and
  `gcTime: 0`.
- Entity fixtures use `@faker-js/faker` and live in `test/entities/*.mock.ts`.
- Global mocks: `test/jest.setup.ts` (FlashList measurement, `NativeEventEmitter`, Ionicons, `@dev-plugins/react-query`)
  and `test/jest.polyfills.ts`.
- HTTP is mocked with `axios-mock-adapter`.

## Lint rules that will fail your change

From `eslint.config.js`, on top of `eslint-config-expo/flat`:

- **kebab-case files and folders** — `check-file/filename-naming-convention` and
  `check-file/folder-naming-convention`. Both are turned off for `src/app/**` (expo-router needs `(drawer)` and
  `[id].tsx`) and `test/**`; `__mocks__` folders are exempt from the folder rule.
- **`simple-import-sort/imports`** with explicit groups: react/packages, then internal `@/`, then side-effect, then
  relative, then styles. Also `import/first`, `import/newline-after-import`, `import/no-duplicates`.
- **`max-len` 120** (`code: 120`, URLs and brace-only import/export lines ignored). Prettier is configured to the same
  width (`.prettierrc.js`: `printWidth: 120`, `singleQuote: true`).
- **`max-params` 3.** More than three parameters means an options object.
- **`padding-line-between-statements`** — blank line required before every `return`.
- **`quotes: single`** (`avoidEscape: true`).
- **`no-restricted-imports`** — `@testing-library/react-native` must go through `@/test/test-utils`;
  `ActivityIndicator` must come from `@/ui`. Off in `test/**` and `src/ui/**`.
- **`@typescript-eslint/no-unused-vars`: error** — TS files only (the plugin is not registered for the root JS configs).
- `eslint-plugin-testing-library`'s `flat/react` config applies to test files, with `no-await-sync-events` off because
  RNTL 14 made `fireEvent` async.

### Warnings are errors

`pnpm lint` runs with `--max-warnings 0`, so **any** warning fails the build — locally, in `.husky/pre-commit` via
`.lintstagedrc.js`, and in the CI `lint` job. There is no tolerated-warning budget to hide a new finding in.

Three sites carry an `eslint-disable` because the rule is wrong about them, each with the reason inline:

| Location                   | Rule                                | Why it is disabled                                      |
| -------------------------- | ----------------------------------- | ------------------------------------------------------- |
| `src/styles/unistyles.ts`  | `no-empty-object-type`              | Empty bodies **are** the declaration-merging mechanism. |
| `src/api/common/client.ts` | `import/no-named-as-default-member` | `axios.create` is the documented factory.               |
| `src/localization/i18n.ts` | `import/no-named-as-default-member` | `i18n.use` is the singleton's own method.               |

Add a disable only when the rule is provably wrong about the code, and always with the reason. Everything else gets
fixed.

## Git hooks and CI

`.husky/`:

- `pre-commit` -> `pnpm exec lint-staged`. `.lintstagedrc.js`: `*.{ts,tsx}` triggers a whole-project `pnpm typecheck`
  (a function-form command, because `tsc` with explicit filenames ignores `tsconfig.json`); `*.{ts,tsx,js,mjs,cjs}` gets
  `eslint --fix`; `*.{md,json,yml,yaml}` gets `prettier --write`. **Markdown you write here will be reformatted by
  prettier at 120 columns.**
- `commit-msg` -> `pnpm exec commitlint --edit "$1"`.
- `pre-push` -> `pnpm typecheck && pnpm test`, skipped when `CI` or `GITHUB_ACTIONS` is `true`.

`.github/workflows/pr-validation.yml` runs on `pull_request` to `main`, with
`concurrency: cancel-in-progress: true`. Jobs: `lint`, `typecheck`, `test`, `validate-branch-name`, `validate-commits`,
and a `ready-to-merge` aggregator that `needs` all five and fails unless each reports `success` — that aggregator is the
single required status check. All jobs use the composite action `.github/actions/setup-node-pnpm/`, which reads the pnpm
version from `packageManager`, caches the pnpm store, and runs `pnpm install --frozen-lockfile`.

## Low-memory hosts (verified on an 8 GB M1)

`expo run:ios` and `expo run:android` both **boot a device before compiling**, so the simulator/emulator and the
compiler compete for RAM. On an 8 GB machine this starves the compiler — free RAM was measured dropping to ~17 MB during
an iOS compile.

Use **build-then-boot** instead:

1. Compile with no device running: `pnpm android:build` (prebuild + `./gradlew assembleDebug --no-daemon`).
2. Boot the emulator.
3. `pnpm android:install`.

Never hold Gradle, an emulator, and Metro at the same time. `plugins/with-local-gradle-tuning.js` (applied in
`app.config.ts`) exists to tune local Gradle builds for this constraint.

## Anti-patterns

❌ Screen logic in a route file.

```tsx
// src/app/(drawer)/(tabs)/index.tsx
export default function HomeScreen() {
  const { data } = feedRepository.queries.useFeedPosts();
  return <FlashList data={data} ... />;
}
```

✅ Route renders a view; logic lives in the module.

```tsx
// src/app/(drawer)/(tabs)/index.tsx
import { HomeView } from '@/modules/feed';

export default function HomeScreen() {
  return <HomeView />;
}
```

---

❌ Hardcoded colours or spacing in a component, or a second palette alongside the theme.

```ts
const colors = { background: '#f4f4f7' };
container: { backgroundColor: '#f4f4f7', padding: 16 },
```

✅ Read tokens from the theme in a sibling `styles.ts`.

```ts
// styles.ts
import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme) => ({
  container: { backgroundColor: theme.colors.background, padding: theme.padding.xxl },
}));
```

---

❌ Importing RNTL or `ActivityIndicator` directly — both are lint errors.

```ts
import { render } from '@testing-library/react-native';
import { ActivityIndicator } from 'react-native';
```

✅ Go through the project's entry points.

```ts
import { renderWithProviders } from '@/test/test-utils';
import { ActivityIndicator } from '@/ui';
```

---

❌ Hardcoded user-facing strings.

```tsx
<EmptyState title="No posts yet" />
```

✅ Keys in both `src/localization/locales/en-us.ts` and `es-es.ts`, read via `useTranslation`.

```tsx
const { t } = useTranslation();
<EmptyState title={t('home.emptyTitle')} />;
```

---

❌ PascalCase or camelCase filenames — `check-file` rejects them outside `src/app/**` and `test/**`.

```
src/ui/SearchInput/SearchInput.tsx
```

✅ kebab-case throughout, component folder + sibling styles.

```
src/ui/search-input/search-input.tsx
src/ui/search-input/styles.ts
```

---

❌ Four or more positional parameters (`max-params` 3), and no blank line before `return`.

```ts
function build(a: string, b: string, c: string, d: string) {
  const out = a + b + c + d;
  return out;
}
```

✅ Options object, blank line before `return`.

```ts
function build({ a, b, c, d }: BuildOptions) {
  const out = a + b + c + d;

  return out;
}
```

---

❌ Reaching into a module's internals from outside it, bypassing its public barrel. TD-6 was exactly this — resolved
in Phase B by folding every consumer into the one module that owns the internals — but the rule outlives that specific
fix and applies to any future module.

```ts
// hypothetical: a file outside src/modules/feed/ reaching past its barrel
import { PostsVerticalCarousel } from '@/modules/feed/components';
import { usePostAuthors } from '@/modules/feed/hooks';
```

✅ Import through the module's public barrel.

```ts
import { PostsVerticalCarousel, usePostAuthors } from '@/modules/feed';
```

## Known issues

Verified against the code at the time of writing. Ranked by severity. IDs are stable and are never reused or renumbered
when an entry is resolved, so references elsewhere keep pointing at the same defect. TD-1, TD-2, TD-3, TD-6 and TD-8
have been resolved and removed.

| ID    | Severity | Issue                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TD-7  | Low      | **Auth is a commented-out stub.** Both interceptors in `src/api/common/client.ts` are dead comments (bearer-token request interceptor and a 401 refresh-retry response interceptor), kept alive by an `eslint-disable` for the imports they reference. There is no working auth.                                                                                                                                                                                                                                                                                                                                                              |
| TD-9  | Low      | **`test/jest.setup.ts` mocks a private FlashList path.** `@shopify/flash-list/dist/recyclerview/utils/measureLayout` is internal; any FlashList version bump can break the whole suite. `@shopify/flash-list` is pinned to `2.0.2` in `package.json`.                                                                                                                                                                                                                                                                                                                                                                                         |
| TD-10 | Low      | **`validate-commits` does not check what lands.** The CI job lints the PR's individual commits, but squash merge replaces them with the PR title, which the job never sees. PR titles need manual conventional-commit discipline.                                                                                                                                                                                                                                                                                                                                                                                                             |
| TD-11 | High     | **The access token is persisted unencrypted.** Fixing TD-5 wired `user-store` to AsyncStorage, which stores plaintext — an SQLite database on Android, a file in the app container on iOS, both readable from an unencrypted device backup or a rooted/jailbroken device. Before TD-5 the token never reached disk on native, so this is new exposure, not a pre-existing one. `app.config.ts` sets neither `android:allowBackup="false"` nor an `NSFileProtection` class. The fix is `expo-secure-store` (Keychain / Keystore) behind the `storage` option `createStoreWithMiddleware` already accepts; the dependency is not installed yet. |
| TD-12 | Low      | **`src/store/` is a holdover.** Stores belong beside their owner (`modules/<x>/stores/`, `shared/<x>/stores/`), not in a top-level folder — `src/store/user-store/` moves to `src/shared/user/` in Phase C. The `no-restricted-imports` rule on `zustand` governs how stores are built, not where they live, so nothing stops a new store landing here in the meantime. Do not add one.                                                                                                                                                                                                                                                       |
