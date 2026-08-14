// The ONLY commitlint config in this repo, on purpose.
//
// commitlint resolves its config through cosmiconfig, which stops at the first
// match in this precedence order: .commitlintrc -> .commitlintrc.{json,yaml,yml,js,cjs,mjs,ts}
// -> commitlint.config.{js,cjs,mjs,ts} -> the "commitlint" key in package.json.
// Adding a second file (e.g. `.commitlintrc.js`) would silently shadow this one
// and turn everything below into dead config. Keep exactly one file.
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Types are a closed set: they describe the KIND of change, which is
    // infrastructure, not domain. Derived from this repo's actual history
    // (feat, fix, chore, refactor, ci) plus the conventional-commit types we
    // expect to need.
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'refactor', 'docs', 'test', 'perf', 'ci', 'style', 'build', 'revert'],
    ],

    // Scope is intentionally OPTIONAL and UNRESTRICTED — no `scope-enum`.
    // Scopes in this repo are domain names (theme, post, ui, home, settings,
    // api, i18n, ...), i.e. feature modules. A closed enum would reject the
    // very first commit that introduces a new module, so the enum would have to
    // be edited in the same commit it blocks. 6 commits in history carry no
    // scope at all, which confirms it must stay optional.
    'scope-empty': [0],
    'scope-enum': [0],

    // Matches @commitlint/config-conventional's default; restated so the limit
    // is visible at the place someone looks when a commit gets rejected.
    'subject-max-length': [2, 'always', 72],
  },
};
