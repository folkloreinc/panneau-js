# 0036: Lucide's icon loader is the default of `createPanneauApp()` only

- Status: accepted
- Date: 2026-10-30
- Issue: [#141](https://github.com/folkloreinc/panneau-js/issues/141)
- Changes: the default of `iconLoader` for `<Panneau>`, in [0019](0019-app-entry.md) ("the same options except `element`") and [0020](0020-default-theme-and-icons.md)

## Context

Icons named in definitions (`"icon": "users"`) load through a `NamedIconLoader`. `lucideIconLoader` of `@panneau/ui/named-icons` loads any Lucide icon with Lucide's dynamic imports, so a page only loads the icons it shows ([0020](0020-default-theme-and-icons.md)). It lives in its own entry point, because bundlers emit a chunk for every icon it can import: about 1,900 files, 9 MB.

`<Panneau>` and `createPanneauApp()` both defaulted to it. The import was static, in the module of `<Panneau>`, so every app of `@panneau/app` bundled every Lucide icon, even one that passes its own loader of a dozen icons: Vite wrote 1,845 chunks for an app that needs two.

A dynamic `import()` of the default, only when `iconLoader` is `undefined`, doesn't help: the bundler can't know the option at build time, and emits the chunks anyway.

## Decision

- **`createPanneauApp()` keeps `lucideIconLoader` as its default.** The entry that `panneau:install` writes doesn't change, and its apps show any icon a definition names, as before. Its module imports `@panneau/ui/named-icons`, so its bundle has the chunks of every icon, whatever `iconLoader` is.
- **`<Panneau>` has no default.** Without `iconLoader`, named icons render an empty space, as with `PanneauRoot`. An app that renders `<Panneau>` passes `lucideIconLoader` for every icon, or its own loader, and only bundles what it passes.
- An app on `createPanneauApp()` that wants a smaller bundle renders `<Panneau>` itself, with `readBootConfig()`: a few more lines in its entry.
- `npm run test:icons` builds two Vite apps of the built packages, and checks that `<Panneau>` with its own loader bundles no Lucide icon, and that `createPanneauApp()` bundles them all.

## Consequences

- Apps that render `<Panneau>` without `iconLoader` lose their named icons until they pass one: the changeset says so. The entry contract of `createPanneauApp()` doesn't change.
- `@panneau/app` only reaches `@panneau/ui/named-icons` through `createPanneauApp()`, which bundlers drop from apps that don't import it (`sideEffects` only lists CSS).
- Backends have nothing to do.
