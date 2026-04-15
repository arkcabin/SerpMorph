# SerpMorph Release and Versioning Guide

This guide explains how automated versioning works in SerpMorph, how to use it correctly, and how to troubleshoot common release failures.

## 1. What this system does

When code is merged or pushed to main, GitHub Actions runs semantic-release.

semantic-release then:

1. Reads commit messages since the last tag
2. Decides the next semantic version
3. Updates version files
4. Updates changelog
5. Creates a Git tag
6. Publishes a GitHub Release
7. Commits release artifacts back to main

## 2. Files involved

- .github/workflows/release.yml
- .releaserc.json
- package.json
- package-lock.json
- CHANGELOG.md

## 3. Trigger behavior

Release workflow runs on:

- Push to main

Important:

- If there are no releasable commits, semantic-release exits without creating a new release.
- The release commit itself may trigger CI again, but it usually results in "no release" on that run.

## 4. Commit message rules (Conventional Commits)

Version bump is based on commit message type.

### Releasable commit types

- feat: new feature -> minor bump
- fix: bug fix -> patch bump
- refactor: non-breaking refactor -> patch bump
- perf: performance improvement -> patch bump
- docs: documentation update -> patch bump

### Non-releasable commit types in this project

- chore: no release
- style: no release
- test: no release

### Breaking changes

A major version is created when either of these is present:

- A type with exclamation mark, for example feat!: change API format
- A BREAKING CHANGE: note in commit body

## 5. Version bump examples

From version 1.0.0:

- fix: correct dashboard empty state handling -> 1.0.1
- feat: add GSC domain sync -> 1.1.0
- feat!: replace SEO response schema -> 2.0.0

## 6. Recommended commit examples

Good examples:

- feat(auth): add google callback guard
- fix(dashboard): prevent hydration mismatch on body
- docs(release): add versioning guide
- perf(api): optimize Search Console aggregation
- feat(api)!: replace metrics response with grouped format

Avoid:

- update stuff
- final changes
- fixed issue

## 7. Current project configuration summary

In .releaserc.json:

- Branch: main only
- Tag format: v${version}
- Preset: conventionalcommits
- Release commit message:
  - Subject: chore(release): v${nextRelease.version}
  - Body: ${nextRelease.notes}
- Release commit includes these files:
  - CHANGELOG.md
  - package.json
  - package-lock.json

In .github/workflows/release.yml:

- Node version: 22
- Installs dependencies using npm ci
- Runs npm run release with GITHUB_TOKEN

## 8. Local validation before pushing

You can preview what version would be released without publishing:

```bash
npm run release:dry
```

Useful checks before release:

```bash
npm run lint
npm run typecheck
```

## 9. Typical release flow for developers

1. Create branch from main
2. Make code changes
3. Use Conventional Commit messages
4. Open PR and merge to main
5. Release workflow runs automatically
6. Verify tag and GitHub release are created

## 10. What to verify after merge

In GitHub:

- Actions: Release workflow succeeded
- Releases: new release appears
- Tags: new vX.Y.Z tag exists
- Commit history: release commit created

In repository:

- package.json version incremented
- package-lock.json version incremented
- CHANGELOG.md updated

## 11. Troubleshooting

### Error: semantic-release requires newer Node version

Symptom:

- semantic-release fails with Node version not supported

Fix:

- In release.yml set Node to 22 or higher

### Error: Cannot find module conventional-changelog-conventionalcommits

Symptom:

- analyzeCommits fails with MODULE_NOT_FOUND

Fix:

```bash
npm install -D conventional-changelog-conventionalcommits
```

Commit package updates and rerun workflow.

### No release produced

Possible causes:

- No releasable commit types since last tag
- Commits are only chore/style/test

Fix:

- Ensure at least one releasable commit (feat/fix/docs/refactor/perf)

### Wrong bump level

Possible causes:

- Commit message type not conventional
- Breaking change marker missing

Fix:

- Use feat!, or add BREAKING CHANGE in commit body for major

## 12. Best practices for this repository

- Prefer small, scoped commits with clear type and scope
- Use fix: for bug fixes and feat: for features
- Reserve feat! and BREAKING CHANGE for true breaking API or behavior changes
- Keep release config and workflow changes under chore(ci): or docs(release): commits
- Run release dry-run locally when changing release configuration

## 13. Quick reference

- Workflow file: .github/workflows/release.yml
- Release config: .releaserc.json
- Dry-run command: npm run release:dry
- Actual release command: npm run release
- Main release trigger: push to main

---

If you update release rules in .releaserc.json, update this guide in the same PR so future contributors always have accurate reference documentation.
