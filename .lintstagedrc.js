module.exports = {
  // Function form: lint-staged appends matched filenames to a string command, and
  // `tsc` given explicit files ignores tsconfig.json — losing path aliases, jsx
  // and strict. A fixed command keeps this a whole-project check.
  '*.{ts,tsx}': () => 'pnpm typecheck',

  // Zero-tolerance: the repo lints clean, so any new warning is a real finding.
  '*.{ts,tsx,js,mjs,cjs}': ['eslint --fix --max-warnings 0'],

  '*.{md,json,yml,yaml}': ['prettier --write'],
};
