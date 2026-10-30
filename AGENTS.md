# AGENTS.md

`panneau-js` is the React half of Panneau, Folklore's toolkit for admin panels and content management. Packages are published as `@panneau/*`. The Laravel half is [`laravel-panneau`](https://github.com/folkloreinc/laravel-panneau).

**Language.** This is a public repository. Everything written here is in **English**: code, comments, docs, commit messages, issues and their comments, pull requests and reviews. Never copy private details from the projects that use Panneau (product plans, infrastructure, internal docs, client names). Report security problems privately through a GitHub security advisory.

## Branches

| Branch | What it is                                                                              |
| ------ | --------------------------------------------------------------------------------------- |
| `v5.x` | Panneau 5, in development. Read [`docs/`](docs/README.md) first.                        |
| `v4.0` | Maintenance of 4.x (React 19.2). Fixes only. Used by client projects and `micromag-js`. |
| `v3.0` | Maintenance of 3.x (React 16.8 to 19). Fixes only.                                      |

Other branches (`master`, `v2.0`, `v0.x`, `feature/*`) are not maintained.

## Panneau 5

- **Plan:** [#6](https://github.com/folkloreinc/panneau-js/issues/6). Each item becomes a sub-issue of #6 when work on it starts.
- **Architecture:** [`docs/architecture.md`](docs/architecture.md), [`docs/protocol.md`](docs/protocol.md) and [`docs/decisions/`](docs/decisions/). Follow the decisions; changing one means a new decision record.
- **New packages next to v4** (see [decision 0018](docs/decisions/0018-new-packages-next-to-v4.md)):
    - v5 packages live in `packages/`.
    - The v4 code is in `legacy/`, outside the workspaces. It is not built, linted or tested. Use it as a reference when porting a component, then delete what was ported (steps in [`docs/packages.md`](docs/packages.md#porting-a-component-from-legacy)).
    - Never import from `legacy/`.
- **Packages:** the target list, with the layer and allowed dependencies of each, is in [`docs/packages.md`](docs/packages.md). Create a package with `npm run create-package` when its work starts, not before.

## Rules for v5

1. **The protocol is the contract.** Frontend code only relies on `@panneau/protocol`. Laravel specifics (CSRF, `419`) live in the Laravel preset of the REST adapter.
2. **Layers.** A package only depends on the layers below it: protocol → UI primitives → engine → data → app (see [`docs/architecture.md`](docs/architecture.md)). Fields, forms and lists work without a definition, a router or a network.
3. **Public API.** Only what a package's `exports` map exposes is public. Anything else is internal. No deep imports between packages. Each entry point has an API report in the package's `api/` folder: a change to the public API updates it (`npm run api`) in the same pull request.
4. **No global CSS.** Components use CSS Modules and design tokens (CSS variables).
5. **Controlled components.** Fields never keep their value in their own state.
6. **Skeletons while content loads.** Content that loads shows a skeleton of its shape (`Skeleton` from `@panneau/ui`), never a spinner in its place. Spinners are for operations in progress and lookups inside a control. See [decision 0034](docs/decisions/0034-skeletons-while-content-loads.md).
    - A component that loads content draws its own skeleton from its props (columns, fields, layout), so it works without the app: `items` or `item` left `undefined`, or an `isLoading` prop, as `ListView`, `ItemDetails` and `Form` do.
    - The skeleton goes in a `LoadingRegion` (`aria-busy`, and one status message). Content already shown stays during a refetch.

## Stack

- Node 24 (`.nvmrc`), npm workspaces.
- React 19.2+ as a peer dependency, with the React Compiler in the build. Don't add `useMemo`, `useCallback` or `memo` for performance.
    - The build fails when the compiler skips a component or a hook, with the line it stopped at: rewrite that code (an effect that reads the latest props uses `useEffectEvent`, not an `eslint-disable`). `'use no memo'` is the last resort, with a comment that says why.
    - `@babel/core` stays on Babel 7: React Compiler 1.0 skips every component with a default value in its props on Babel 8.
- TypeScript 6, `strict` with `noUncheckedIndexedAccess` (`tsconfig.base.json`).
- Builds use Vite in library mode: ESM only, one file per module, with `.d.ts` files from `tsc`. Use the shared config in `config/vite.package.ts`.
- Tests use Vitest, plus Testing Library for components (`environment: 'jsdom'`). Test files sit next to the code: `*.test.ts(x)`.
- Every component has stories next to it (`*.stories.tsx`), with play functions for its interactions. A component that loads content also has a loading story, whose play function checks `aria-busy` and the status message. Storybook 10 runs them as tests in Chromium through its Vitest addon, with axe checks: an accessibility violation fails CI.
- Components style themselves with CSS Modules that read the `--panneau-*` tokens ([decision 0020](docs/decisions/0020-default-theme-and-icons.md)), and render inside `PanneauRoot`. Icons come from Lucide only.
- Lint with ESLint (flat config, typescript-eslint `strict`, React Hooks). Format with Prettier.

## Commands

```bash
npm install
npm test            # Vitest, every package
npm run lint        # ESLint
npm run typecheck   # tsc in every package, in parallel
npm run build       # build every package, in parallel, in dependency order
npm run api         # update the API reports (packages/*/api/), after a public API change
npm run api:check   # fail if an API report is out of date
npm run format      # Prettier
npm run storybook   # Storybook, on http://localhost:6006
npm run test:storybook  # every story as a test in Chromium: play functions and axe checks
npm run test:smoke  # after a build: the packed packages in a webpack app (flklr), rendered in Chromium
npm run test:types  # after a build: the packed packages' types in a NodeNext project, without skipLibCheck
npm run verify      # every check of CI, one after the other: run it before pushing
npx changeset       # describe a change for the changelog

npm run create-package -- <name> [--react]   # create packages/<name> from the template
npm run test:create-package                  # check the template: create, lint, typecheck, test, build
```

[`docs/packages.md`](docs/packages.md) explains the package layout, the template and the API reports.

## Workflow

- Branch from `v5.x`: `feature/<issue>-<slug>`, `fix/…`, `docs/…`, `ci/…`, `refactor/…`, `chore/…`.
- **Every change to a package comes with a changeset** (`npx changeset`) that says what changed for users. CI checks it on pull requests. All `@panneau/*` packages share one version.
- **Every change comes with tests.** A bug fix adds a regression test that fails without the fix.
- Run `npm run verify` before pushing: it runs the checks of CI locally, and prints the time of each one.
- Open a pull request to `v5.x` with `Closes #<issue>` or `Part of #<issue>` and the checks you ran. **Merge only when CI is green.**
- **CI** (`.github/workflows/ci.yml`) runs every check on every pull request and on every push to `v5.x`, in parallel jobs: format, lint and changeset; typecheck; tests; build and API reports; package template; Storybook; smoke test (and the types of the packed packages under NodeNext). The shared setup (Node, `npm ci`, Chromium) is in `.github/actions/setup`. Keep each job short: the wait is the longest job. A new check gets its own job, or goes in the job it fits, and in `scripts/verify.js`.
- **Releases** are only published by the Release workflow (`.github/workflows/release.yml`), which runs on every push to `v5.x`:
    - while changesets are pending, it opens or updates the "Version packages" pull request, and publishes nothing;
    - **merging that pull request releases**: the next run publishes the new versions to npm and tags them.

    `v5.x` is in pre-release mode (`alpha`) until 5.0.0.
    - Never change a package version by hand: it would be published on the next push.
    - A new package needs a first manual publish, then trusted publishing configured on npm for this repository and `release.yml`, before the workflow can publish it.
