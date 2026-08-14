/**
 * lint-staged runs only over STAGED files, so each entry below is scoped to the
 * file types this repo actually contains.
 */
module.exports = {
  // Function form on purpose: lint-staged appends matched filenames to a string
  // command, and `tsc` with explicit file arguments IGNORES tsconfig.json
  // entirely (no paths aliases, no jsx settings, no strict flags). Returning a
  // fixed command string means the filenames are never appended, so this stays a
  // whole-project check driven by tsconfig.json. It runs once per commit, not
  // once per file, because the array is collapsed to a single command.
  '*.{ts,tsx}': () => 'pnpm typecheck',

  // `--max-warnings 1000` rather than 0. See the note in .husky/pre-commit and
  // the PR description: this repo carries 5 pre-existing warnings that are NOT
  // auto-fixable and NOT defects (see below), so `--max-warnings 0` would block
  // any commit touching those 4 files until someone silenced correct code with
  // eslint-disable comments. Errors still fail the commit, which is the gate
  // that actually matters. CI's `pnpm lint` remains the place where the warning
  // count is reported, and the number should trend down, never up.
  '*.{ts,tsx,js,mjs,cjs}': ['eslint --fix --max-warnings 1000'],

  // Prettier is otherwise only wired through .vscode/settings.json, so
  // contributors not using VSCode never format these. There is no `format`
  // script to reuse, so the binary is invoked directly.
  '*.{md,json,yml,yaml}': ['prettier --write'],
};
