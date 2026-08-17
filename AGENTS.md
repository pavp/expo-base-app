# AGENTS.md — expo-base-app

Architecture and convention contract. Read this before changing any file. Every claim is anchored to a path in this
repository.

Human-facing documentation lives in `docs/` and is written against a generic entity. This file is the opposite: it
describes what is actually here, with real paths.

Expo SDK 57 / React Native 0.86.2 / React 19 / TypeScript strict. Package manager is pnpm, pinned by `packageManager`
in `package.json`. Node `>=22`.

---

## Architecture overview

**3-layer module architecture:**

```
Presentation    views/  components/  hooks/        Renders. No fetching decisions.
Application     repositories/<module>/             Keys, query-options, hooks. Owns caching.
Data            <module>.types.ts  api/  gateways/ Schemas, transport, one impl per source.
```

**Data flow (always top-down, never skip layers):**

```
View -> use-*-business -> repository -> gateway -> api -> httpClient -> network
                                                              |
                                                        Zod validation
```

**Reference module:** `src/modules/feed/` — the only module with every layer implemented.

---

## Available scripts

```bash
pnpm install            # Install from pnpm-lock.yaml
pnpm start              # Metro dev server
pnpm lint               # eslint . --max-warnings 0 — a warning fails like an error
pnpm lint:fix           # Same, with --fix
pnpm typecheck          # tsc --noEmit
pnpm test               # jest, coverage always collected
pnpm android:build      # prebuild + assembleDebug, no device booted
pnpm android:install    # adb install the debug APK
pnpm android:prebuild   # expo prebuild --platform android --clean
pnpm prebuild           # expo prebuild, both platforms
pnpm doctor             # expo install --check
```

`pnpm-workspace.yaml` carries `allowBuilds: unrs-resolver: true`. Removing it breaks every install with
`ERR_PNPM_IGNORED_BUILDS`. pnpm 11 reads settings from this file — the `pnpm` field in `package.json` and `.npmrc`'s
`onlyBuiltDependencies` are both ignored.

---

## Repo structure

```
index.ts                        expo-router/entry + ./src/styles/unistyles
app.config.ts                   Expo config — typedRoutes, allowBackup: false, 2 plugins
plugins/                        with-local-gradle-tuning.js, with-ios-file-protection.js
src/
  app/                          expo-router routes (NON-default location)
  api/                          client.ts, http-client/, endpoints.ts, api.types.ts (no root barrel)
  components/                   api-provider, error-fallback, navigation/, theme-button
  core/hooks/                   use-debounced-value
  core/lib/                     async-storage, react-query, secure-storage, zustand
  localization/                 i18n.ts + locales/{en-us,es-es}.ts
  modules/feed/                 posts + comments, every layer
  modules/settings/             theme/language + boot hooks
  shared/user/                  api -> repository, no gateway
  styles/                       themes.ts, breakpoints.ts, unistyles.ts
  types/gateway.types.ts        DataSource, BaseGateway, GatewayCapabilities
  config.ts                     env-derived config
test/                           setup, polyfills, test-utils, entities/, __mocks__/
```

Path aliases (`tsconfig.json`, mirrored in `jest.config.ts` `moduleNameMapper`): `@/*` -> `./src/*`,
`@/test/*` -> `./test/*`, `@/assets/*` -> `./assets/*`.

---

## How to add a new module

Full guide: `docs/developer-guide.md`. Summary of all 18 steps:

**1. Verify the real payload** — curl the endpoint before writing a schema. A guessed shape fails at runtime.

**2. Create directories** — only the ones the module needs. No empty scaffolding.

**3. Define types** — Zod schemas + `z.infer` in `<module>.types.ts`. Undeclared fields are stripped, not passed
through.

**4. Add the endpoint** — `src/api/endpoints.ts`, never inline.

**5. Create the api layer** — contract interface + `create*ApiService()` factory + singleton. `responseSchema` wired
to the Zod schema.

**6. Decide on gateways** — more than one data source? If not, skip to step 8 and follow `src/shared/user/`.

**7. Implement gateways** — contract in `<module>.gateway.types.ts`, one folder per source, factory with a
`DataSource` switch.

**8. Query keys** — factory in `<module>.repository.keys.ts`. A `dataSource` segment only when gateways exist.

**9. Query options** — `queryOptions`/`infiniteQueryOptions` in `<module>.query-options.ts`. Forward `signal`.

**10. Repository** — interface, queries, singleton in `repositories/<module>/index.ts`.

**11. Business hook** — `use-<name>-business`. Flatten pages here.

**12. Controller hook** — only if the view has UI-only state. Never for symmetry.

**13. View** — `views/<name>-view/<name>-view.view.tsx` + `styles.ts` + test + `index.ts`.

**14. Translations** — same key in `en-us.ts` and `es-es.ts`.

**15. Barrel** — explicit named exports. Gateways, keys, and query-options stay private.

**16. Route** — `src/app/`, three statements: import view, re-export `ErrorFallback as ErrorBoundary`, render.

**17. Tests** — at the layer that owns the behavior. See `docs/testing.md`.

**18. Verify** — `pnpm lint && pnpm typecheck && pnpm test`, then run the app. Jest and Metro resolve modules
differently; a cycle invisible to tests can blank the screen on device.

---

## Layer responsibilities

### Business hook — owns data access

- The only place a repository is called
- Flattens paged data so no component sees `pages`
- Takes `enabled` as a parameter when a controller decides whether the query runs
- Lives in `views/<view>/hooks/` for one consumer, `modules/<module>/hooks/` for two or more

### Controller hook — owns UI state

- Local state, handlers, derived flags — never data fetching
- Only `explore-view` has one (`src/modules/feed/views/explore-view/hooks/use-explore-controller/`), because it has
  `searchTerm` and `authorId`. `home-view` and `post-detail-view` have no UI-only state and no controller.

---

## Repository pattern

- `feed.repository.keys.ts` — every key carries a `dataSource` segment, so switching source cannot serve a stale entry
- `feed.query-options.ts` — pagination derived from page length (`lastPage.length === DEFAULT_LIMIT`), because
  jsonplaceholder returns bare arrays with no total count. `DEFAULT_LIMIT = 10` in `src/api/common/constants.ts`
- Callers cannot override pagination: `InfiniteQueryOptions` in `src/core/lib/react-query/react-query.types.ts` omits
  `getNextPageParam` and `initialPageParam`
- The 5 explicit generics on `infiniteQueryOptions` are load-bearing — without them the page-param type degrades to
  `unknown` and `select` stops matching
- `cancel` helpers take `QueryClient` as their **first parameter**, injected by the caller, so `@/core/lib` never
  imports an app-layer singleton
- **No mutation exists today.** `MutationOptions` is defined in `react-query.types.ts` and unused

---

## Gateway pattern

- Contract: `src/types/gateway.types.ts` — `DataSource = 'http' | 'asyncStorage'`, `BaseGateway`,
  `GatewayCapabilities`
- `createFeedGateway(dataSource)` switches; `http` is the default case
- `async-storage-gateway` **ignores filters** (`_filters`) — local storage holds what was cached, so server-side
  filtering has nothing to apply
- **Nothing writes the AsyncStorage keys.** `FEED_POSTS_STORAGE_KEY` and `FEED_COMMENTS_STORAGE_KEY_PREFIX` are read
  but never written — a documented, accepted dead branch
- `src/shared/user/` deliberately has **no gateway**: one data source means the factory would have one branch and the
  key segment one value. `queryFn` calls `userApi` directly

---

## Theming (unistyles v3)

- `src/styles/themes.ts` — `commonTheme` carries 5 scales (`margins`, `padding`, `radius`, `borderWidth`, `fontSize`),
  spread into `lightTheme` and `darkTheme`
- Both palettes declare the same 11 colour keys. Every value carries contrast rationale in a comment — keep them
- Styles go in a sibling `styles.ts` via `StyleSheet.create((theme) => ({ ... }))`
- **Variant functions** are a real pattern: `styles.chip(isSelected)` — see `src/ui/filter-chips/styles.ts`
- `src/styles/unistyles.ts` augments the module with empty interface bodies; the `no-empty-object-type` disable is
  required, not an oversight
- Never hardcode a hex value. Never add a second palette

**The runtime palette rule**, repeated in all three layouts:

```ts
const { rt } = useUnistyles();
const theme = UnistylesRuntime.getTheme(rt.themeName);
```

The hook's own `theme` can lag `themeName`, painting native headers with the previous theme's colours. Same quirk
motivates `src/ui/safe-area-view/` and the `withUnistyles(FlashList)` cast in `posts-vertical-carousel.tsx`.

---

## Navigation (expo-router)

Routes are rooted at `src/app/`, not the default `app/`. Root `index.ts` does `import 'expo-router/entry'`.

```
src/app/_layout.tsx                  Stack: APIProvider > SafeAreaProvider > ThemeProvider
src/app/(drawer)/_layout.tsx         Drawer, custom content
src/app/(drawer)/(tabs)/_layout.tsx  Tabs (index, explore)
src/app/post/[id].tsx                PostDetailView
src/app/settings/index.tsx           SettingsView
```

**Every leaf route is 3 statements:** import the view, `export { ErrorFallback as ErrorBoundary }`, render. The error
boundary re-export is part of the pattern.

Root layout calls `SplashScreen.preventAutoHideAsync()` at module scope and gates render on `useInitApp()`'s
`appIsReady`. React Navigation's `ThemeProvider` gets `DarkTheme`/`DefaultTheme` — required for iOS 26 Liquid Glass
header buttons.

`experiments.typedRoutes: true`; types come from `.expo/types`. Navigate with the object form:
`router.navigate({ pathname: '/post/[id]', params: { id } })`.

---

## Internationalization (i18next)

- `supportedLanguages = ['en', 'es'] as const` in `src/localization/i18n.ts`
- Initial language is the device locale via `expo-localization`, falling back to `config.translation.defaultLocale`
- Locales are **TS modules**, not JSON: `locales/en-us.ts`, `es-es.ts`, re-exported as `en_US`/`es_ES`
- A stored preference is applied after boot by `use-init-language`, which validates against `supportedLanguages`
  before applying
- Add every key to **both** locale files
- In a component needing the current language, destructure `i18n` from `useTranslation()` — the imported singleton
  does not trigger a re-render on change

---

## Client state

**No store exists.** The only one ever written held an auth token and was deleted with the rest of the auth
scaffolding — **this app has no authentication and will not have one.** Do not add a bearer-token interceptor, a
session store, or a refresh flow.

`createStoreWithMiddleware` from `@/core/lib/zustand` remains, tested, so the first store with real client state has
one documented way to be built. It composes immer, `persist`, and devtools, and drops `actions` and `hasHydrated` from
the persisted payload. Actions belong nested under `state.actions`.

Importing `zustand` directly is a lint error outside `src/core/lib/zustand/**` and `test/**`.

`src/core/lib/secure-storage/` is a `StateStorage` adapter over `expo-secure-store` with **no consumer today**. Native
only — it no-ops on web, so a value set under `pnpm web` is not persisted.

---

## Config

- `src/config.ts` — derives from `EXPO_PUBLIC_API_URL`. Not schema-validated; this was evaluated and deliberately
  dropped as unnecessary for one variable
- `app.config.ts` — `android.allowBackup: false` app-wide, so device backups no longer carry theme/language either
  (accepted: both regenerate on next launch)
- `plugins/with-ios-file-protection.js` sets `NSFileProtectionKey` to
  `NSFileProtectionCompleteUntilFirstUserAuthentication` — not the stricter `Complete`, which would make the container
  unreadable while locked
- Both are native build output. `pnpm lint`/`typecheck`/`test` cannot see them — verify against the generated
  `AndroidManifest.xml` and `Info.plist`, with no simulator booted

---

## Testing

39 test files, co-located. `jest-expo` preset, `testEnvironment: 'jsdom'`, `clearMocks: true`.

### Mock level by test type

| What you test         | Mock at                               |
| --------------------- | ------------------------------------- |
| api / gateway         | `axios-mock-adapter` on `client`      |
| query-options builder | nothing — call the pure function      |
| repository hook       | `axios-mock-adapter` + render helpers |
| business hook         | the repository                        |
| controller hook       | nothing                               |
| view                  | the hooks it consumes                 |

### Rules

- Render through `@/test/test-utils`, never `@testing-library/react-native` — enforced by `no-restricted-imports`
- `renderWithProviders` and `renderHookWithProviders` are **async**. Await them
- The test `QueryClient` sets `retry: false` and `gcTime: 0`; without `gcTime` a query outlives its test and refetches
  against a reset adapter
- Fixtures use `@faker-js/faker` in `test/entities/*.mock.ts`, importing types through module barrels
- Coverage globs cover `src/{components,modules,core,api,ui}` — **`src/shared/` is not included**
- Thresholds: branches 50, functions 55, lines 55, statements 55
- Mock a module boundary with an **explicit factory**, never a no-argument auto-mock — the auto-mock still requires the
  real module to shape itself

---

## File naming and import conventions

### Files — kebab-case (ESLint enforced)

Suffixes in the tree today, with a real example each:

| Suffix                | Example                                           |
| --------------------- | ------------------------------------------------- |
| `.view.tsx`           | `settings-view/settings-view.view.tsx`            |
| `.component.tsx`      | `src/ui/search-input/search-input.component.tsx`  |
| `.hook.ts`            | `hooks/use-post-authors/use-post-authors.hook.ts` |
| `.types.ts`           | `src/modules/feed/feed.types.ts`                  |
| `.helper.ts`          | `api/helpers/posts-params/posts-params.helper.ts` |
| `.constants.ts`       | `src/modules/settings/settings.constants.ts`      |
| `.query-options.ts`   | `repositories/feed/feed.query-options.ts`         |
| `.repository.keys.ts` | `repositories/feed/feed.repository.keys.ts`       |
| `.queries.ts`         | `repositories/feed/feed.repository.queries.ts`    |
| `.lib.ts`             | `core/lib/secure-storage/secure-storage.lib.ts`   |
| `.middleware.ts`      | `core/lib/zustand/zustand.middleware.ts`          |
| `.mock.ts` / `.tsx`   | `test/entities/post.mock.ts`                      |

`.store.ts`, `.gateway.ts` and `.repository.ts` are documented in `docs/file-naming-conventions.md` but have **zero
instances** — no store exists, gateway files are named for their source (`http-gateway.ts`), and the repository is
`repositories/feed/index.ts`.

`ignoreMiddleExtensions: true` is what makes `feed.repository.keys.ts` legal. Both check-file rules are **off** for
`src/app/**` and `test/**`; `__mocks__` is exempt from the folder rule only.

### Import order (ESLint auto-fix)

`simple-import-sort/imports` and `/exports`, groups: react/packages -> `@/` internal -> side effects -> parent ->
relative -> styles. Plus `import/first`, `import/newline-after-import`, `import/no-duplicates`.

### Restricted imports

| Restricted                      | Use instead          | Lifted in                            |
| ------------------------------- | -------------------- | ------------------------------------ |
| `@testing-library/react-native` | `@/test/test-utils`  | `test/**`, `src/ui/**`               |
| `ActivityIndicator` from RN     | `@/ui`               | `test/**`, `src/ui/**`               |
| `zustand`, `zustand/*`          | `@/core/lib/zustand` | `src/core/lib/zustand/**`, `test/**` |

---

## Git conventions

### Commits (Conventional Commits — enforced by commitlint + Husky)

`type-enum` closed to `feat|fix|chore|refactor|docs|test|perf|ci|style|build|revert`. `subject-max-length` 72. Scope
optional and unrestricted — scopes are module names.

A `.commitlintrc.*` file would silently shadow `commitlint.config.js` via cosmiconfig precedence. Do not add one.

### Branch naming (validated pre-push + in CI)

`^(feat|fix|chore|refactor|docs|test|perf|ci|hotfix)/[a-z0-9]+(-[a-z0-9]+)*$`. `main` and `dependabot/*` exempt.
`hotfix` is a valid branch type but **not** a valid commit type.

### Hooks

- `pre-commit` -> `lint-staged`: `*.{ts,tsx}` triggers a whole-project `pnpm typecheck` (function form, because `tsc`
  with explicit filenames ignores `tsconfig.json`); `eslint --fix`; `prettier --write` on `*.{md,json,yml,yaml}`
- `commit-msg` -> `commitlint --edit`
- `pre-push` -> `pnpm typecheck && pnpm test`, skipped when `CI` or `GITHUB_ACTIONS` is true

**Markdown you write here is reformatted by prettier at 120 columns on commit.**

### Delivery

Every change ships as a PR with squash merge. No exceptions for size, no direct pushes to `main`. The squash commit
takes the **PR title**, which `validate-commits` never sees — write it as a conventional commit by hand.

Fill in `.github/PULL_REQUEST_TEMPLATE.md`. `gh pr create --body` does not apply it automatically.

Do not commit or push unless the user asks.

---

## CI

`.github/workflows/pr-validation.yml`, on `pull_request` to `main`, `cancel-in-progress: true`.

Jobs: `lint`, `typecheck`, `test`, `validate-branch-name`, `validate-commits`, and `ready-to-merge` — which `needs`
all five and asserts each result is literally `success`, so a skipped or cancelled job cannot pass. That aggregator is
the single required check.

`validate-branch-name` reads `github.head_ref` because HEAD is a detached merge commit. `validate-commits` needs
`fetch-depth: 0` and runs from the event SHAs, not `origin/main..HEAD`.

---

## Anti-patterns

```typescript
// ❌ Screen logic in a route file
export default function HomeScreen() {
  const { data } = feedRepository.queries.useFeedPosts();
  return <FlashList data={data} />;
}
// ✅ Route renders one view; logic lives in the module
export default function HomeScreen() {
  return <HomeView />;
}

// ❌ A view calling a repository directly
const { data } = feedRepository.queries.useFeedPosts();
// ✅ A business hook between them
const { posts } = useHomeBusiness();

// ❌ Hardcoded colour or spacing
container: { backgroundColor: '#f4f4f7', padding: 16 }
// ✅ Theme tokens in a sibling styles.ts
container: { backgroundColor: theme.colors.background, padding: theme.padding.xxl }

// ❌ Reaching past a module barrel
import { PostsVerticalCarousel } from '@/modules/feed/components';
// ✅ Through the public barrel
import { PostsVerticalCarousel } from '@/modules/feed';

// ❌ Hardcoded user-facing string
<EmptyState title="No posts yet" />
// ✅ Translation key in both locale files
<EmptyState title={t('home.emptyTitle')} />

// ❌ Value import creating a cycle
import { FeedPage } from '../../feed-api';
// ✅ Type-only import — erased at compile time
import type { FeedPage } from '../../feed-api';

// ❌ Adding a gateway for a single data source
// ✅ queryFn calls the api directly — see src/shared/user/

// ❌ An empty controller hook added for symmetry
// ✅ No controller unless the view has UI-only state

// ❌ An aggregating barrel over unrelated infrastructure — every consumer
//    inherits every dependency it reaches. src/api/ and src/core/ had these
//    and nobody imported through them; both were deleted.
export * from './hooks';
export * from './lib';
// ✅ Import each wrapper by its own path
import { getItem } from '@/core/lib/async-storage';
```

---

## Known issues

| Item                                                                        | File                                 | Severity |
| --------------------------------------------------------------------------- | ------------------------------------ | -------- |
| Mocks a private FlashList path; any version bump can break the whole suite  | `test/jest.setup.ts`                 | LOW      |
| `validate-commits` lints commits the squash merge discards, never the title | `pr-validation.yml`                  | LOW      |
| `src/shared/` is absent from the coverage globs                             | `jest.config.ts`                     | LOW      |
| AsyncStorage gateway keys are read but never written — dead branch          | `async-storage-gateway.constants.ts` | LOW      |

`@shopify/flash-list` is pinned to exactly `2.0.2` in `package.json` because of the first item.

---

## AI agent instructions

**Before changing any file:** read the relevant `docs/` page for the pattern, then read the reference implementation
in `src/modules/feed/`. Match what is there rather than what a generic tutorial would produce.

**Adding a feature:** follow the 18 steps above. Skip step 7 when there is one data source and step 12 when the view
has no UI-only state.

**Before saying done:** `pnpm lint && pnpm typecheck && pnpm test`. For anything user-facing, run the app — green
checks do not prove a screen renders.

**Never:** add authentication, import `zustand` directly, hardcode a colour or a string, call a repository from a
view, edit a generated native project, or use `--no-verify`.

**Finding a pattern implementation:**

- Full module with gateways -> `src/modules/feed/`
- Module without a gateway -> `src/shared/user/`
- Module without a repository -> `src/modules/settings/`
- Business + controller pair -> `src/modules/feed/views/explore-view/hooks/`
- Component fetching its own data -> `src/modules/feed/components/comment-list/hooks/`
- Store factory (no consumer) -> `src/core/lib/zustand/`
- Config plugin -> `plugins/with-ios-file-protection.js`
