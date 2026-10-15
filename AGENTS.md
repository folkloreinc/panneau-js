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

## Stack

- Node 24 (`.nvmrc`), npm workspaces.
- React 19.2+ as a peer dependency, with the React Compiler in the build. Don't add `useMemo`, `useCallback` or `memo` for performance.
- TypeScript 6, `strict` with `noUncheckedIndexedAccess` (`tsconfig.base.json`).
- Builds use Vite in library mode: ESM only, one file per module, with `.d.ts` files from `tsc`. Use the shared config in `config/vite.package.ts`.
- Tests use Vitest, plus Testing Library for components (`environment: 'jsdom'`). Test files sit next to the code: `*.test.ts(x)`.
- Lint with ESLint (flat config, typescript-eslint `strict`, React Hooks). Format with Prettier.

## Commands

```bash
npm install
npm test            # Vitest, every package
npm run lint        # ESLint
npm run typecheck   # tsc in every package
npm run build       # build every package
npm run api         # update the API reports (packages/*/api/), after a public API change
npm run api:check   # fail if an API report is out of date
npm run format      # Prettier
npx changeset       # describe a change for the changelog

npm run create-package -- <name> [--react]   # create packages/<name> from the template
npm run test:create-package                  # check the template: create, lint, typecheck, test, build
```

[`docs/packages.md`](docs/packages.md) explains the package layout, the template and the API reports.

## Workflow

- Branch from `v5.x`: `feature/<issue>-<slug>`, `fix/…`, `docs/…`, `ci/…`, `refactor/…`, `chore/…`.
- **Every change to a package comes with a changeset** (`npx changeset`) that says what changed for users. CI checks it on pull requests. All `@panneau/*` packages share one version.
- **Every change comes with tests.** A bug fix adds a regression test that fails without the fix.
- Open a pull request to `v5.x` with `Closes #<issue>` or `Part of #<issue>` and the checks you ran. **Merge only when CI is green.**
- **Releases** are only published by the Release workflow (Actions tab, on `v5.x`). It opens a "Version packages" pull request, and publishes once that pull request is merged. `v5.x` is in pre-release mode (`alpha`) until 5.0.0.
