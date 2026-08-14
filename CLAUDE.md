# CLAUDE.md

Claude Code notes for `expo-base-app`.

**Read [`AGENTS.md`](./AGENTS.md) first.** It is the architecture and convention contract: directory map, navigation,
module structure, styling, i18n, test conventions, enforced lint rules, anti-patterns, and the ranked known-issues table.
This file does not repeat any of it.

Two things from there that will bite you fastest:

- `pnpm` only — never `npm`, `yarn`, or `npx`.
- The repo is mid-refactor. Document and follow what exists; do not build toward the unstarted Phase 1/2 architecture.

## Before you finish a change

```bash
pnpm lint       # must be 0 errors (5 warnings are expected — see AGENTS.md)
pnpm typecheck
pnpm test
```

`.husky/pre-push` runs `typecheck` + `test` anyway, so running them yourself only saves a round trip.

## Delivery

Every change goes through a **PR with squash merge**. No exceptions for size, no direct pushes to `main`.

```bash
git checkout -b feat/short-kebab-description   # <type>/<kebab-case>, enforced in CI
# ... work ...
git commit -m "feat(explore): add author filter"   # conventional commit, subject <= 72 chars
gh pr create
```

The squash-merge commit takes the **PR title**, and the `validate-commits` CI job never sees it — so write the PR title
as a conventional commit too.

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

1. Add the path to `API_ENDPOINT` in `src/api/endpoints.ts`.
2. Create `src/api/<entity>/use-<verb>-<thing>/use-<verb>-<thing>.ts` using `createQuery` / `createInfiniteQuery` from
   `react-query-kit`, typed `<Data, Variables, AxiosError>`.
3. Add entity types to `src/api/<entity>/types.ts`; re-export the hook from `src/api/<entity>/index.ts`.
4. Add `use-<verb>-<thing>.test.ts` beside it, mocking HTTP with `axios-mock-adapter` and rendering via
   `@/test/test-utils`.

### Add a UI primitive

`src/ui/<name>/<name>.tsx` + `styles.ts`, exported from `src/ui/index.ts`. No data fetching, no `useTranslation` — take
strings as props. `src/ui` is inside the coverage globs but most existing primitives still have no test, so write the
test anyway.

### Add a theme token

Edit `src/styles/themes.ts`. A colour goes in **both** `lightTheme` and `darkTheme`; a scale value goes in `commonTheme`.
Types flow automatically through the module augmentation in `src/styles/unistyles.ts`. `themes.ts` is the only palette —
do not add a second one.

### Add a string

Same key in both `src/localization/locales/en-us.ts` and `es-es.ts`, read with `t('...')`.

### Run the app on a low-memory Mac

Do not use `pnpm ios` / `pnpm android` on an 8 GB machine — both boot a device before compiling and starve the compiler.
Build-then-boot instead: `pnpm android:build` with no device running, boot the emulator, then `pnpm android:install`.
Never hold Gradle, an emulator, and Metro at once. Details in AGENTS.md.

### Debug a failing `pnpm install`

`ERR_PNPM_IGNORED_BUILDS` means `allowBuilds: unrs-resolver: true` is missing from `pnpm-workspace.yaml`. Restore it.

## Editing this repo's docs

`.husky/pre-commit` runs `prettier --write` over `*.md`, so match `.prettierrc.js` (`printWidth: 120`, single quotes) or
your markdown will be reformatted under you.
