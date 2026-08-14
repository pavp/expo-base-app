# AGENTS.md

Architecture and convention contract for `expo-base-app`. Read this before changing any file. Every claim below is
anchored to a path in this repository.

Expo SDK 57 / React Native 0.86.2 / React 19 / TypeScript strict. Package manager is **pnpm 11.11.0**, pinned by
`packageManager` in `package.json`.

## Refactor in progress — read first

This repository is mid-refactor. A phased architecture overhaul is underway, and this document describes **what exists
today**, not the target state.

- **Phase 0 (in progress):** tooling foundation — pnpm migration, TypeScript strict, CI at
  `.github/workflows/pr-validation.yml`, git hooks in `.husky/`. Mostly landed; this document is part of it.
- **Phases 1 and 2 (not started):** a domain layer, repository and gateway patterns, a business/controller hook split,
  and enforced architectural boundaries between modules.

Practical consequences for an agent working here now:

- Do **not** invent domain/repository/gateway layers. They do not exist. Follow the patterns in this document.
- Expect these to change: the `src/api/` data-access shape, the single-hook-per-view pattern inside `src/modules/*`, and
  the currently unenforced module boundaries (see "Known issues", TD-6).
- Do not entrench new code into `src/api/common/utils.ts` — that file is already partly dead (TD-4).

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
5. **`pnpm lint` must report 0 errors.** It currently reports 5 warnings; those are expected and not defects (see
   "Expected lint warnings").
6. **TypeScript is strict** (`tsconfig.json`). `pnpm typecheck` must pass.

## Commands

| Command                 | What it does                                                                  |
| ----------------------- | ----------------------------------------------------------------------------- |
| `pnpm install`          | Installs from `pnpm-lock.yaml`.                                               |
| `pnpm start`            | `expo start` — Metro dev server.                                              |
| `pnpm lint`             | `expo lint` — ESLint over the repo.                                           |
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

## Directory map

```
index.ts                     -> `import 'expo-router/entry'` + `import './src/styles/unistyles'`
app.config.ts                -> Expo config (dynamic, TS)
plugins/with-local-gradle-tuning.js -> config plugin, applied in app.config.ts
src/
  app/                       -> expo-router file-based routes (NON-default location)
  api/                       -> server data access: axios client + react-query-kit hooks
  components/                -> app-level shared components (not primitives)
  config.ts                  -> env-derived config (`EXPO_PUBLIC_API_URL`)
  constants/colors.ts        -> ORPHANED, do not use (TD-3)
  hooks/                     -> cross-cutting hooks (`hooks/common/*`)
  lib/async-storage/         -> thin AsyncStorage get/set wrapper
  localization/              -> i18next setup + TS translation modules
  modules/                   -> feature modules: home, explore, post
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
src/app/(drawer)/(tabs)/index.tsx    -> renders <HomeView /> from @/modules/home
src/app/(drawer)/(tabs)/explore.tsx  -> renders <ExploreView />
src/app/post/[id].tsx                -> renders <PostDetailView /> from @/modules/post
src/app/settings/index.tsx           -> settings screen (+ local styles.ts)
```

**Route files are thin.** They render one view from a module and nothing else — see
`src/app/(drawer)/(tabs)/index.tsx`. Put screen logic in `src/modules/<feature>/views/`, not in `src/app/`.

`experiments.typedRoutes: true` in `app.config.ts`, so route types come from `.expo/types`.

Layouts read the palette via `UnistylesRuntime.getTheme(rt.themeName)` rather than a captured `theme` — see the comment
in `src/app/_layout.tsx`; navigator `screenOptions` otherwise render with a stale theme.

## Feature modules (`src/modules/`)

Three modules exist and they are **not uniform**:

| Module    | Contents                                      |
| --------- | --------------------------------------------- |
| `home`    | `index.ts`, `views/`                          |
| `explore` | `index.ts`, `views/`                          |
| `post`    | `index.ts`, `views/`, `components/`, `hooks/` |

Conventions in force:

- Each module has an `index.ts` barrel that names its public exports explicitly (`export { HomeView } from
'./views/home-view/home-view';`). Add subfolders (`components/`, `hooks/`) only when the module actually needs them —
  do not scaffold empty ones.
- A view lives in its own folder: `views/<name>-view/<name>-view.tsx` plus a sibling `styles.ts` and
  `<name>-view.test.tsx`.
- Nested components repeat the same shape one level down — see
  `src/modules/post/components/posts-vertical-carousel/components/posts-vertical-carousel-item/`.

## `src/ui/` — primitives

Seven primitives, each a folder with the component and (where it styles anything) a `styles.ts`:

`activity-indicator`, `avatar`, `empty-state`, `filter-chips`, `material-icon`, `safe-area-view`, `search-input`, plus
`src/ui/index.ts`.

`ActivityIndicator` must be imported from `@/ui`, never from `react-native` — enforced by `no-restricted-imports` in
`eslint.config.js` (the rule is disabled inside `src/ui/**` so the primitive itself can wrap it).

`src/components/` is for app-level shared components that are not primitives: `api-provider`, `navigation/*`,
`settings-option`, `theme-button`.

## Server state — `src/api/`

Stack: axios + TanStack React Query v5 + `react-query-kit`.

- `src/api/common/client.ts` — the single axios instance, `baseURL: config.apiURL` from `src/config.ts`
  (`EXPO_PUBLIC_API_URL`).
- `src/api/endpoints.ts` — `API_ENDPOINT` string map. Add new paths here, not inline.
- One hook per operation, in its own folder, colocated with its test:
  `src/api/post/use-get-posts/use-get-posts.ts` + `.test.ts`.
- Hooks are built with `createQuery` / `createInfiniteQuery` from `react-query-kit`, typed
  `<Data, Variables, AxiosError>`. See `src/api/post/use-get-posts/use-get-posts.ts` and
  `src/api/comment/use-get-comments-by-post-id/use-get-comments-by-post-id.ts`.
- Entity types live in `src/api/<entity>/types.ts` (e.g. `Post` in `src/api/post/types.ts`); shared envelope types in
  `src/api/types.ts`.
- Barrels: `src/api/<entity>/index.ts` re-exports the entity's hooks and types; `src/api/index.ts` re-exports the
  entities.

The provider is `src/components/api-provider/api-provider.tsx`, mounted in `src/app/_layout.tsx`.

The upstream API is jsonplaceholder-shaped: endpoints return bare arrays, not a pagination envelope. Pagination in
`use-get-posts` is derived from page length (`lastPage.length === DEFAULT_LIMIT`). See TD-4 before touching
`src/api/common/utils.ts`.

## Client state — `src/store/`

Zustand v5, **one store**: `src/store/user-store/user-store.ts`. It holds `user: { accessToken } | null` with
`setCredentials` / `removeCredentials`, wrapped in `persist`. See TD-5 — the persist config has no storage adapter.

Tests reset stores through `test/__mocks__/zustand/index.ts`, which wraps `create` and registers reset functions.

## Styling — `react-native-unistyles` v3

- Themes: `src/styles/themes.ts` — `commonTheme` (spacing/radius/fontSize scales) spread into `lightTheme` and
  `darkTheme`. Colour choices carry contrast rationale in comments; keep them when editing.
- Breakpoints: `src/styles/breakpoints.ts`.
- `StyleSheet.configure` and the `declare module 'react-native-unistyles'` augmentation: `src/styles/unistyles.ts`.
  `initialTheme: 'light'`.
- Root `index.ts` imports `./src/styles/unistyles` so configuration runs before any component.
- Styles go in a sibling `styles.ts` using `StyleSheet.create((theme) => ({ ... }))` and read tokens from `theme`.

Never hardcode a hex value in a component. Never import from `src/constants/colors.ts` (TD-3).

## i18n — `src/localization/`

`i18next` + `react-i18next`. Setup in `src/localization/i18n.ts`; initial language is the device locale
(`expo-localization`), falling back to `config.translation.defaultLocale`. A stored preference is applied later by
`src/hooks/common/use-init-language/use-init-language.ts`.

Translations are **TypeScript modules, not JSON**: `src/localization/locales/en-us.ts`, `es-es.ts`, re-exported from
`locales/index.ts` as `en_US` / `es_ES`. Supported languages: `['en', 'es']`.

Add every user-facing string here and read it via `useTranslation()`. Add the key to **both** locale files.

## Tests

Jest with the `jest-expo` preset (`jest.config.ts`), `testEnvironment: 'jsdom'`, `clearMocks: true`. 16 test files
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

### Expected lint warnings

`pnpm lint` reports **5 warnings, 0 errors**. All five are correct code, none is auto-fixable. Do not "fix" them:

| Location                                               | Warning                                               | Why it stays                                      |
| ------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------- |
| `src/styles/unistyles.ts:13`, `:14`                    | `@typescript-eslint/no-empty-object-type` (x2)        | The declaration-merging idiom unistyles requires. |
| `src/api/common/client.ts:17`                          | `import/no-named-as-default-member` on `axios.create` | False positive.                                   |
| `src/localization/i18n.ts:25`                          | `import/no-named-as-default-member` on `i18n.use`     | False positive.                                   |
| `src/components/api-provider/api-provider.test.tsx:28` | `@typescript-eslint/no-require-imports`               | Deliberate `require()` in a test.                 |

`.lintstagedrc.js` runs `eslint --fix --max-warnings 1000` for exactly this reason — errors still fail, warnings do not
block commits.

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
  const { data } = useGetPosts();
  return <FlashList data={data} ... />;
}
```

✅ Route renders a view; logic lives in the module.

```tsx
// src/app/(drawer)/(tabs)/index.tsx
import { HomeView } from '@/modules/home';

export default function HomeScreen() {
  return <HomeView />;
}
```

---

❌ Hardcoded colours or spacing in a component, or importing the orphaned palette.

```ts
import { colors } from '@/constants/colors';
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

❌ Reaching into another module's internals. This exists in the codebase today and is a known issue (TD-6) — do not copy
it.

```ts
// src/modules/home/views/home-view/home-view.tsx
import { PostsVerticalCarousel } from '@/modules/post/components';
import { usePostAuthors } from '@/modules/post/hooks';
```

✅ Import through the module's public barrel.

```ts
import { PostsVerticalCarousel, usePostAuthors } from '@/modules/post';
```

## Known issues

Verified against the code at the time of writing. Ranked by severity.

| ID    | Severity | Issue                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ----- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TD-1  | High     | **Coverage is measured over the wrong file set.** `jest.config.ts` `collectCoverageFrom` globs `src/helpers/**` and `src/views/**` — neither directory exists — and omits `src/ui/**`, where 6 of 7 primitives have no test (only `filter-chips` does). The reported ~60% therefore describes a file set that is not the codebase.                                                                                                                                                       |
| TD-2  | High     | **Coverage thresholds are 0.** `jest.config.ts` sets `branches/functions/lines/statements` to `0`, documented in-file as a temporary floor. Nothing currently stops coverage regressing. Raise these after TD-1 is fixed.                                                                                                                                                                                                                                                                |
| TD-3  | Medium   | **`src/constants/colors.ts` is an orphaned duplicate palette.** Nothing imports it; it competes with `src/styles/themes.ts`. It is Expo-template residue. Delete on sight, do not extend.                                                                                                                                                                                                                                                                                                |
| TD-4  | Medium   | **`src/api/common/utils.ts` is typed against an API shape that does not exist.** `normalizePages`, `getPreviousPageParam`, `getNextPageParam` all assume the `PaginateQuery<T>` envelope from `src/api/types.ts` (`{ results, count, next, previous }`), but the upstream API returns bare arrays. Nothing outside that file imports any of them; `use-get-posts` reimplements pagination inline. The file also contains `[key: string]: any` and a `//@ts-ignore`. Dead and mismatched. |
| TD-5  | Medium   | **`user-store` persists to the wrong storage on native.** `src/store/user-store/user-store.ts` wraps the slice in `persist` with no `storage`/`getStorage` adapter, so Zustand's default (`localStorage`) is used. On native that is not AsyncStorage. `src/lib/async-storage/` exists but is not wired in.                                                                                                                                                                              |
| TD-6  | Medium   | **No module boundary enforcement.** `home-view.tsx` and `explore-view.tsx` import `@/modules/post/components` and `@/modules/post/hooks`, bypassing `src/modules/post/index.ts`. Nothing prevents this today. Phase 2 is expected to enforce boundaries.                                                                                                                                                                                                                                 |
| TD-7  | Low      | **Auth is a commented-out stub.** Both interceptors in `src/api/common/client.ts` are dead comments (bearer-token request interceptor and a 401 refresh-retry response interceptor), kept alive by an `eslint-disable` for the imports they reference. There is no working auth.                                                                                                                                                                                                         |
| TD-8  | Low      | **`app.config.ts` identifiers are inconsistent.** `scheme: 'com.rn-app.yourapp'` versus `ios.bundleIdentifier` / `android.package` both `'com.app.rnapp'`.                                                                                                                                                                                                                                                                                                                               |
| TD-9  | Low      | **`test/jest.setup.ts` mocks a private FlashList path.** `@shopify/flash-list/dist/recyclerview/utils/measureLayout` is internal; any FlashList version bump can break the whole suite. `@shopify/flash-list` is pinned to `2.0.2` in `package.json`.                                                                                                                                                                                                                                    |
| TD-10 | Low      | **`validate-commits` does not check what lands.** The CI job lints the PR's individual commits, but squash merge replaces them with the PR title, which the job never sees. PR titles need manual conventional-commit discipline.                                                                                                                                                                                                                                                        |

Not defects, do not fix: the 5 lint warnings above.
