<!--
The title becomes the squash-merge commit, so write it as a conventional commit:
  <type>(<scope>): <subject>      e.g. feat(explore): add author filter
Subject <= 72 chars. The validate-commits job checks your commits, never this title.
-->

## Why

<!-- The problem, not the diff. What was wrong or missing, and what a reader cannot infer from the code. -->

## What changed

<!-- Only what a reviewer needs in order to read the diff. Skip if the title already says it. -->

## Verification

<!--
What you actually ran, with real output or numbers. "Tests pass" is not verification.
CI runs lint, typecheck and test — say what you checked beyond that, especially anything CI cannot:
behaviour on a device, a native build, a migration, a manual flow.
-->

- [ ] Verified on iOS
- [ ] Verified on Android
- [ ] Not applicable — no runtime change

## Anything a reviewer should push back on

<!--
Trade-offs you made, alternatives you rejected, scope you left out on purpose, and known gaps.
Say so here rather than letting a reviewer find it. If you left a defect documented instead of
fixed, name it.
-->
