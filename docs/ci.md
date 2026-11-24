# CI and the merge queue

CI is [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). Its jobs run in parallel, so the wait is the longest job, not the sum of them. `npm run verify` runs the same checks locally, one after the other.

## What runs when

| Event                                        | What runs                                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Push to `v5.x`                               | Everything                                                                                 |
| Merge queue (`merge_group`)                  | Everything, on the result of merging the queued pull requests, without the changeset check |
| Pull request that changes something shared   | Everything                                                                                 |
| Pull request that only changes some packages | Every job, but the unit tests and the stories only for the affected packages (see below)   |
| Pull request that changes no package (docs…) | Every job, but the unit-test and Storybook jobs stop after the checkout, and succeed       |

**Affected packages.** [`scripts/affected.js`](../scripts/affected.js) reads the files that a pull request changes (`git diff` with its base). It selects the packages that the pull request changes, and every package that depends on them through its `@panneau/*` dependencies, `dependencies`, `peerDependencies` or `devDependencies`. The `Test`, `Storybook (interactions and accessibility)` and `Storybook (dark scheme, touch density)` jobs pass the folders of those packages to Vitest as filters. To see what it selects for your branch:

```bash
node scripts/affected.js --base origin/v5.x
```

- **Shared files run everything:** any file outside `packages/` and `playground/` that is not in the ignored list below. That includes the root `package.json`, the lockfile, `tsconfig*.json`, the Vitest and ESLint configs, `.storybook/`, `config/`, `scripts/`, `.nvmrc` and `.github/`.
- **Ignored files:** `docs/`, `.changeset/`, `legacy/`, `smoke/` (the smoke job always runs), and the Markdown files at the root.
- **The playground's tests** run when the playground or a package changes.
- The other jobs (format and lint, typecheck, build and API reports, Storybook build, package template, smoke tests) always run in full.

Pushes to `v5.x` and the merge queue run everything, so a dependency that the script misses (an import that is not in a `package.json`) is still caught before the change reaches `v5.x`.

**Shared setup.** [`.github/actions/setup`](../.github/actions/setup/action.yml) restores `node_modules` (and the `node_modules` of packages that have their own) from a cache keyed by the lockfile and `.nvmrc`, and runs `npm ci` only when the cache misses. It then saves `node_modules` at once, before a job adds anything to it.

**Cancelled runs.** A new push to a pull request cancels the run of its previous commit. Runs on `v5.x` and in the merge queue always finish.

## The merge queue

The workflow is ready for GitHub's merge queue: it runs on `merge_group`, and the changeset check, the only step that reads the pull request, only runs on `pull_request` events. The Release workflow only runs on pushes to `v5.x` (and by hand). The queue's temporary branches (`gh-readonly-queue/v5.x/…`) don't start it, and the push to `v5.x` at the end of a queued merge starts it as any merge does today.

Turning the queue on is a change to the repository's settings, done by a maintainer.

### Turning it on

1. **Settings → Rules → Rulesets → New ruleset → New branch ruleset.**
    - Name: `v5.x merge queue`. Enforcement status: **Active**.
    - Bypass list: leave it empty, or add the organization admins as today's rulesets do. A bypass lets them merge without the queue.
    - Target branches: **Add target → Include by pattern** → `v5.x`.
2. **Require status checks to pass**, with these checks, by the exact names of the jobs (source: GitHub Actions):
    - `Format, lint and changeset`
    - `Typecheck`
    - `Test`
    - `Build, API reports and Storybook build`
    - `Package template`
    - `Storybook (interactions and accessibility)`
    - `Storybook (dark scheme, touch density)`
    - `Smoke tests (webpack app, types under NodeNext, icons and size of Vite bundles)`

    Leave **Require branches to be up to date before merging** off: the queue tests each pull request on top of the ones before it, which is what that option was for.

3. **Require merge queue:**
    - Merge method: **Merge commit** (as today).
    - Build concurrency: **5**.
    - Minimum group size: **1**. Maximum group size: **5**. Wait time to meet minimum group size: the default; with a minimum of 1, a pull request never waits for others.
    - Require all queue entries to pass required checks: **on** (_all green_). A group that fails is split and its pull requests are tested again without the one that broke it.
    - Status check timeout: **30 minutes** (a full run takes about 4 minutes, more while runners are queued).
4. Save. The other rulesets (deletion, force pushes, pull requests) stay as they are.

The bot's "Version packages" pull request needs the same green checks before it can join the queue. GitHub holds the CI runs of that pull request until a maintainer approves them ("Approve and run workflows" on the pull request): approve them, then add it to the queue.

### Checking the first queued merge

- The pull request shows **Merge when ready** instead of **Merge pull request**. Once added, it shows its place in the queue.
- In Actions, a CI run starts with the event `merge_group`, on a branch `gh-readonly-queue/v5.x/pr-<number>-<sha>`. All eight jobs run in full: "Select the packages to test" is skipped, the stories run for every package, and "Check for a changeset" is skipped.
- When that run is green, `v5.x` moves to the merge commit, the pull request is closed as merged, and the queue's branch is deleted.
- That push starts a CI run on `v5.x` (`push`), which runs everything and isn't cancelled by the next merge, and a Release run, which opens or updates the "Version packages" pull request.
- If the run fails, the pull request leaves the queue with a comment, and `v5.x` doesn't move.
- In the merge-group run, "Restore node_modules" should find the cache of `v5.x`. If it misses, the jobs install with `npm ci` (about 25 seconds more each), and the run is still correct.
- Queue a second pull request while the first is still in the queue: its run is tested on top of the first.

## Durations

Measured on 20 runs on 2026-11-24 (issue [#459](https://github.com/folkloreinc/panneau-js/issues/459)), before this setup. A run took 3 to 3.5 minutes once it started. When several pull requests were pushed together, the jobs waited up to 7 minutes for a runner, which is most of the "ten minutes" a pull request seemed to take. The longest jobs were the two Storybook jobs and the unit tests (about 2.5 minutes each), then the smoke tests (2.3 minutes). The setup (Node, `npm ci`, Chromium) took about 25 seconds in each of the eight jobs.
