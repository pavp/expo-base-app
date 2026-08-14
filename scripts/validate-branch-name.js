#!/usr/bin/env node

/**
 * Validates a branch name against the repository convention:
 *
 *   <type>/<kebab-case-description>
 *
 * The types mirror the conventional-commit prefixes already used in this
 * repository's history. Validation is skipped for `main` and for
 * `dependabot/*` branches, which are not authored by hand.
 *
 * Usage:
 *   node scripts/validate-branch-name.js [branch-name]
 *
 * When no argument is given, the current branch is read from git.
 */

const { execSync } = require('node:child_process');

const BRANCH_TYPES = ['feat', 'fix', 'chore', 'refactor', 'docs', 'test', 'perf', 'ci', 'hotfix'];

const BRANCH_NAME_PATTERN = new RegExp(`^(${BRANCH_TYPES.join('|')})/[a-z0-9]+(-[a-z0-9]+)*$`);

const EXEMPT_BRANCHES = ['main'];

const EXEMPT_PREFIXES = ['dependabot/'];

function isExempt(branchName) {
  return EXEMPT_BRANCHES.includes(branchName) || EXEMPT_PREFIXES.some((prefix) => branchName.startsWith(prefix));
}

function isValid(branchName) {
  return BRANCH_NAME_PATTERN.test(branchName);
}

function resolveCurrentBranch() {
  return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
}

function buildErrorMessage(branchName) {
  return [
    `Invalid branch name: "${branchName}"`,
    '',
    'Branch names must follow the convention:',
    '',
    '  <type>/<kebab-case-description>',
    '',
    `Allowed types: ${BRANCH_TYPES.join(', ')}`,
    '',
    'Examples:',
    '  feat/add-post-pagination',
    '  fix/carousel-scroll-offset',
    '  ci/add-github-actions',
    '',
    'Rename your branch with:',
    '',
    `  git branch -m ${branchName} feat/your-change-description`,
    '',
    'If the branch is already pushed, update the remote too:',
    '',
    `  git push origin :${branchName} && git push -u origin feat/your-change-description`,
    '',
  ].join('\n');
}

function main() {
  const branchName = process.argv[2] ?? resolveCurrentBranch();

  if (isExempt(branchName)) {
    console.log(`Branch name "${branchName}" is exempt from validation.`);
    return;
  }

  if (!isValid(branchName)) {
    console.error(buildErrorMessage(branchName));
    process.exit(1);
  }

  console.log(`Branch name "${branchName}" is valid.`);
}

if (require.main === module) {
  main();
}

module.exports = { BRANCH_TYPES, BRANCH_NAME_PATTERN, EXEMPT_BRANCHES, EXEMPT_PREFIXES, isExempt, isValid };
