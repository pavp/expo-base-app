module.exports = {
  // Function form: lint-staged appends matched filenames to a string command, and
  // `tsc` given explicit files ignores tsconfig.json — losing path aliases, jsx
  // and strict. A fixed command keeps this a whole-project check.
  '*.{ts,tsx}': () => 'pnpm typecheck',

  // Warning-tolerant on purpose: the 5 warnings this repo carries are not
  // auto-fixable and not defects, so `--max-warnings 0` would block commits until
  // someone disabled correct code. Errors still fail.
  '*.{ts,tsx,js,mjs,cjs}': ['eslint --fix --max-warnings 1000'],

  '*.{md,json,yml,yaml}': ['prettier --write'],
};
