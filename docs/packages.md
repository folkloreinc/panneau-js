# Packages

How the v5 packages are laid out, created, checked and filled from `legacy/`. The layers are explained in [architecture.md](architecture.md) and [decisions/0003](decisions/0003-layers-and-packages.md).

## Target packages

Packages are created when their work starts, not as empty shells ([decisions/0018](decisions/0018-new-packages-next-to-v4.md)). Layers go from the protocol (bottom) to the app (top). A package never depends on a higher layer, and only depends on the packages listed in its last column. No cycles.

| Package             | Layer         | Content                                                                         | May depend on                                                                                                                                   |
| ------------------- | ------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `@panneau/protocol` | Protocol      | Definition schema, API spec, mock backend, conformance kit                      | none                                                                                                                                            |
| `@panneau/intl`     | UI primitives | UI messages (French, English), locale loading helpers                           | none                                                                                                                                            |
| `@panneau/ui`       | UI primitives | Design tokens, themes, accessible primitives (React Aria)                       | `intl`                                                                                                                                          |
| `@panneau/fields`   | UI primitives | Controlled field components, one subpath per field (`@panneau/fields/text`)     | `protocol`, `intl`, `ui`                                                                                                                        |
| `@panneau/forms`    | UI primitives | Forms: fields in a layout tree, values, errors, dirty state, no saving          | `protocol`, `intl`, `ui`, `fields`, `core`                                                                                                      |
| `@panneau/lists`    | UI primitives | Lists: columns, layouts, selection, sorting and filter controls, no fetching    | `protocol`, `intl`, `ui`, `fields`, `core`                                                                                                      |
| `@panneau/editor`   | UI primitives | Rich text field (TipTap 3)                                                      | `protocol`, `intl`, `ui`, `fields`                                                                                                              |
| `@panneau/core`     | Engine        | Plugin registry, definition to forms and lists, form and list state. No UI      | `protocol` (UI packages render its state, [0021](decisions/0021-forms-render-core-state.md), [0022](decisions/0022-lists-render-core-state.md)) |
| `@panneau/data`     | Data          | `DataAdapter` interface, REST adapter and its Laravel preset, query hooks       | `protocol`, `core`                                                                                                                              |
| `@panneau/media`    | Data          | Media library, upload (Uppy), image editing                                     | the packages above                                                                                                                              |
| `@panneau/auth`     | Data          | Auth forms and flows: login, OAuth, password reset, 2FA, passkeys, verification | the packages above, except `media`                                                                                                              |
| `@panneau/app`      | App           | The app entry (`createPanneauApp`) and the admin panel: routes, layout, pages   | every package above                                                                                                                             |
| `@panneau/collab`   | Engine (5.x)  | Presence and realtime collaboration through Yjs, as a store for `core`          | `protocol`, `core`                                                                                                                              |

Notes:

- **Fields, forms and lists** work without a definition, a router or a network. They never depend on `data`. Forms and lists render the form and list state of `core`, which needs neither ([decisions/0021](decisions/0021-forms-render-core-state.md), [decisions/0022](decisions/0022-lists-render-core-state.md)); fields don't depend on `core`.
- **`core` renders no UI,** and never imports the UI packages: it sits below `forms` and `lists` ([decisions/0021](decisions/0021-forms-render-core-state.md), [decisions/0022](decisions/0022-lists-render-core-state.md)).
- **`data`** only needs `protocol` to start with. It sits above `core` so that query hooks can use the engine's list state.
- **`app`** starts from the entry contract of [decisions/0019](decisions/0019-app-entry.md): the boot config, `createPanneauApp()` and the client routes. Its shell is a placeholder until Phase 2.
- **Feature packages** (`editor`, `media`, `auth`, `intl`, `collab`) sit at the layer of what they need, so a project only loads the features it uses. `app` adds them through plugins.
- Internal dependencies are `dependencies` with the shared version. React and other libraries the host app shares (TanStack Query, React Aria) are `peerDependencies`.

Only what a package's `exports` map exposes is public ([decisions/0013](decisions/0013-public-api-and-stability.md)). Packages import each other through their public entry points, never through `src/` or `dist/` paths.

## Creating a package

```bash
npm run create-package -- <name> [--react] [--description "<one sentence>"]
npm install
```

The script writes `packages/<name>`:

| File                  | Content                                                                                                                                                                                                                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`        | `@panneau/<name>` at the shared version, ESM, an `exports` map with `@panneau/source`, `types` and `default`, `sideEffects` (`false`, or CSS files for React packages), `files`, public access, React 19.2 as a peer for React packages, and the `build`, `typecheck` and `api` scripts |
| `tsconfig.json`       | Typecheck of `src` and `vite.config.ts`, extending `tsconfig.base.json`, with the `@panneau/source` condition                                                                                                                                                                           |
| `tsconfig.build.json` | Type declarations in `dist/`, without the tests                                                                                                                                                                                                                                         |
| `vite.config.ts`      | `definePackageConfig()` from `config/vite.package.ts`: library build and Vitest project (`jsdom` and the React Compiler with `--react`)                                                                                                                                                 |
| `src/`                | A placeholder module (or component) with its test, to replace with the first real one                                                                                                                                                                                                   |
| `README.md`           | Title, description, an import example and the table of entry points to fill in                                                                                                                                                                                                          |

Then:

1. Replace the placeholder in `src/` with the first real module, with tests.
2. Add an entry point for each subpath, as `@panneau/protocol` does for `./mock`: `'text/index': 'src/text/index.ts'` in `entries` in `vite.config.ts` builds `dist/text/index.js`, and `./text` in `exports` points `@panneau/source` to `./src/text/index.ts`, and `types` and `default` to `./dist/text/index.d.ts` and `./dist/text/index.js`. No patterns (`./*`) in `exports`: each subpath is listed, so that each one has an API report.
3. Run `npm run api -w @panneau/<name>` and commit `api/`.
4. Add a changeset: `Add @panneau/<name>.`

`npm run test:create-package` (run in CI) creates a package and a React package in `.tmp/`, and checks that they pass lint, formatting, typecheck, tests, build and API reports. Run it after changing `scripts/create-package.js` or the shared configs.

## Dependencies between packages

A package depends on another one with the shared version in `dependencies` (`"@panneau/protocol": "5.0.0-alpha.0"`), and imports it through its public entry points only.

- **Tests and typechecks use the sources.** Each entry of `exports` has a `@panneau/source` condition that points to its source file. The package's `tsconfig.json` (`customConditions`) and the shared Vite config (`resolve.conditions`) use it, so `npm test` and `npm run typecheck` work without building the other packages first. Published consumers don't use this condition: they get `types` and `default`.
- **Builds use the declarations.** `tsconfig.build.json` doesn't use the condition, so a package's declarations and API report need the declarations of its dependencies. `npm run build` and `npm run api` run through `scripts/workspaces.js`, which runs the packages in dependency order.

## Styles in builds

Components use CSS Modules (`Button.module.css`) that read the design tokens. The shared build (`config/vite.package.ts`):

- scopes their class names (`panneau-button-x7Yz3a`);
- writes the CSS of each module next to it as a plain `.css` file (`dist/button/Button.css`), since its classes are already scoped;
- imports that file from the built module (`import './Button.css'`).

So any bundler, Vite or webpack, only includes the CSS of the components a project imports, and needs no CSS Modules support. `sideEffects: ["*.css"]` keeps these imports from being tree-shaken. A package that ships CSS adds `*.module.css` declarations to `src/env.d.ts`, as `@panneau/ui` does.

## API reports

Each package keeps a report of its public API in `api/`, generated with [API Extractor](https://api-extractor.com/) from its type declarations. A change to the public API changes a report, so it shows up in review.

```bash
npm run api                  # update the reports of every package
npm run api -w @panneau/ui   # update one package
npm run api:check            # fail if a report is out of date (run in CI)
```

- The shared config is [`api-extractor.json`](../api-extractor.json) at the root. Each package runs it through `scripts/api-report.js` in its `api` script, after emitting its declarations with `tsc -p tsconfig.build.json`.
- **One report per entry point.** API Extractor reads one entry point at a time, so the script runs it for every subpath of `exports` that has `types`: `.` writes `api/<name>.api.md` and `./mock` writes `api/<name>-mock.api.md` (`./text` in `@panneau/fields` would write `api/fields-text.api.md`). Reports of removed entry points are deleted by `npm run api`, and fail `npm run api:check`.
- Other exports (JSON files, `./package.json`) have no report. `@panneau/protocol` checks its generated JSON files with its own tests.
- Compiler errors in the declarations fail the run. Other API Extractor and TSDoc messages are written into the report, as `// Warning:` comments, so that they are reviewed with the API.
- Release tags (`@public`, `@beta`…) are not used: everything an entry point exports is public.

**Reading a report.** A `// Warning: (ae-forgotten-export)` means that the API uses a type that the entry point doesn't export, so users can't name it. Export the type, or stop using it in the public API. In the report of a subpath (`./mock`), the warning also shows up for types that the package's main entry point exports: those are fine.

**TypeScript version.** API Extractor bundles its own TypeScript (5.9 with API Extractor 7.59), while the repository uses TypeScript 6. It only reads the `.d.ts` files that `tsc` 6 emits, which TypeScript 5.9 parses without errors for `@panneau/protocol` and the template, and it prints a notice that the project uses a newer TypeScript. The analysis uses its own compiler options (`compiler.overrideTsconfig` in the shared config), not the package's `tsconfig.json`, so TypeScript 6 options don't get in the way. If a declaration uses syntax that the bundled TypeScript doesn't know, the run fails with a compiler error: update `@microsoft/api-extractor`, or wait for a release that bundles a newer TypeScript.

## Porting a component from `legacy/`

`legacy/` holds the v4 code as a reference ([decisions/0018](decisions/0018-new-packages-next-to-v4.md)). It is not built, linted or tested, and nothing imports from it.

1. **Find the target.** Pick the v5 package and subpath from the table above, and the v5 types from [protocol.md](protocol.md). Create the package if it doesn't exist yet.
2. **Rewrite it to the v5 rules**, using the v4 code as a reference for behavior, not as code to move:
    - TypeScript `strict`, with exported prop types;
    - controlled: fields take `value` and `onChange`, and keep no value in their own state;
    - no definition, router or network below the engine layer: what v4 read from contexts comes from props;
    - styles in CSS Modules with design tokens, no Bootstrap and no global CSS ([decisions/0005](decisions/0005-styling-and-theming.md));
    - accessible primitives from `@panneau/ui`, messages from `@panneau/intl`;
    - no `useMemo`, `useCallback` or `memo` for performance: the React Compiler handles it.
3. **Test it** next to the code (`*.test.tsx`), with Testing Library. Cover what the v4 component did that the v5 one keeps, and the bugs it had.
4. **Expose it** through the package's `exports` map (and `entries` in `vite.config.ts` for a new subpath), then run `npm run api` and check the report.
5. **Delete the ported code from `legacy/`** in the same pull request: the component, its styles, its stories and its tests. Delete a v4 package folder once nothing in it is left to port.
6. Add a changeset, and note what changed for v4 users in the pull request (renamed props, removed options), for the migration guide ([migration.md](migration.md)).
