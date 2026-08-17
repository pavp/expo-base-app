# Contributing Guide

## 🌳 Workflow Overview

Every change ships as a pull request with a squash merge. There is no size exemption and no direct push to the default
branch.

```bash
git checkout main
git pull
git checkout -b feat/short-kebab-description
# ... work ...
git commit -m "feat(entity): add author filter"
git push -u origin feat/short-kebab-description
gh pr create
```

## 🌿 Branch Naming (Required & Validated)

```bash
# ✅ Required format: <type>/<kebab-case-description>
feat/add-author-filter           # New functionality
fix/theme-header-colour          # Bug fixes
chore/bump-dependencies          # Maintenance
refactor/extract-gateway         # Restructuring without behaviour change
docs/document-gateway-pattern    # Documentation
test/cover-pagination            # Tests only
perf/reduce-list-rerenders       # Performance
ci/cache-pnpm-store              # Pipeline changes
hotfix/restore-broken-route      # Urgent production fix

# ❌ Rejected
feature/AddAuthorFilter          # Wrong type, wrong casing
my-branch                        # No type
fix/Fix_The_Thing                # Not kebab-case
```

**Validation enforced at:**

- **Local**: the push hook rejects an invalid name before it reaches the remote
- **CI**: a dedicated job validates the branch name on every pull request

The default branch and automated dependency branches are exempt.

## 📝 Commit Format (Required)

Conventional commits, validated on every commit by a hook:

```bash
# ✅ Correct
feat(entity): add author filter to the list view
fix(navigation): restore header colour after theme change
docs: document the gateway pattern
refactor(feed)!: replace the query hook with a repository

# ❌ Rejected
Added author filter                    # No type
feat: Added a subject that runs well past the seventy-two character limit for no reason
Feat(entity): add filter                # Type must be lowercase
```

**Rules:**

- **Type** must be one of: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `ci`, `style`, `build`,
  `revert`
- **Subject** is 72 characters or fewer
- **Scope** is optional and unrestricted — scopes are module names, an open set

Note that `hotfix` is a valid **branch** type but not a valid **commit** type. A hotfix branch carries `fix` commits.

## 🔀 Pull Requests

**Write the pull request title as a conventional commit.** The squash merge takes the title as its commit message, and
the validation job never sees it — it lints the individual commits that the squash replaces. Title discipline is
therefore manual.

The repository ships a pull request template. Fill in every section:

| Section          | What belongs there                                       |
| ---------------- | -------------------------------------------------------- |
| Description      | Motivation and context — why this change exists          |
| Changes          | What actually changed, as bullets                        |
| Type of change   | Delete the options that do not apply                     |
| More information | Reasoning a reviewer would otherwise have to reconstruct |
| Screenshots      | A video or screenshot for any user-facing change         |
| Checklist        | Tick what you genuinely did                              |

An unticked checklist item is information, not a failure. Say why it is unticked — "documentation only, nothing for a
device to exercise" tells a reviewer more than a ticked box would.

## ✅ Before Requesting Review

```bash
pnpm lint       # A warning fails like an error
pnpm typecheck
pnpm test
```

The push hook runs the last two. Running them yourself saves a round trip.

For a user-facing change, run the application on a device or simulator. Tests, types, and lint all pass on code that
renders a blank screen — several classes of defect only appear at runtime.

## 📏 Size

A large diff gets a worse review than a small one, regardless of reviewer diligence. When a change is heading past
roughly 400 lines, split it into a chain of dependent pull requests, each one reviewable and mergeable on its own.

Split along seams that already exist — a layer, a document set, a module. A split that cuts through the middle of one
change produces two pull requests that cannot be understood separately, which is worse than one large one.

## 📋 Breaking Changes

Mark them explicitly, with a `!` after the type or a `BREAKING CHANGE:` footer:

```bash
refactor(entity)!: replace the query hook with a repository

BREAKING CHANGE: useEntityQuery is removed. Call entityRepository.queries.useEntityList instead.
```

## 🚨 Rules

- **Never push directly to the default branch**
- **Never bypass hooks** — a hook skipped with `--no-verify` moves the failure to CI, or to a teammate
- **Never commit generated native projects** — they are reproducible from the configuration
- **Never merge with a failing check** — the aggregate check requires every job to report success, and a skipped job
  does not count as one
- **Update documentation in the same change** — a document contradicting the code is worse than no document, because
  it is trusted

## 📚 Related Documentation

- **[Setup](./setup.md)** - Getting the project running
- **[Rules and Conventions](./rules-conventions.md)** - Everything the tooling enforces
- **[Developer Guide](./developer-guide.md)** - Building a feature end to end
