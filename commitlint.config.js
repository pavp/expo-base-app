// Keep exactly one commitlint config. cosmiconfig stops at the first match in
// its precedence order, so adding a `.commitlintrc.*` would silently shadow this
// file and turn every rule below into dead config.
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'refactor', 'docs', 'test', 'perf', 'ci', 'style', 'build', 'revert'],
    ],

    // No scope-enum: scopes here are feature-module names, so a closed set would
    // reject the first commit introducing a new module.
    'scope-empty': [0],
    'scope-enum': [0],

    'subject-max-length': [2, 'always', 72],
  },
};
