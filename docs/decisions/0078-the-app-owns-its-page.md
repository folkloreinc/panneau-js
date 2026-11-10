# 0078: The app owns its page

- Status: proposed
- Date: 2026-11-10
- Builds on: [0005](0005-styling-and-theming.md) (styles scoped to the root), [0019](0019-app-entry.md) (the app entry)
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (the interface)

## Context

Panneau's styles never leave its root (0005): a site's page can hold Panneau components without Panneau touching the rest of the page. The app, though, is the whole page: laravel-panneau's page and the other backends' render an empty element for it, and nothing else ([#276](https://github.com/folkloreinc/panneau-js/issues/276)). Nobody styles that page, so the browser's default `body { margin: 8px }` stays and frames the app in white, and a dark color scheme shows white under a short page and when the page bounces. The app already acts on its page: it sets the title of the browser's tab.

## Decision

- **`<Panneau>` owns the page it renders in.** While it is mounted:
    - `body` has no margin;
    - `html` and `body` take the background color of the app's root, and `html` its color scheme, read again when the color scheme or the theme changes, and when the system's changes for `auto`.
- **Inline styles, set through the DOM**, not a global stylesheet: the components keep 0005, and a strict Content Security Policy allows them. The page's own inline values come back when the app unmounts.
- Panneau components rendered without `<Panneau>`, in a site's page, change nothing outside their root, as before.

## Consequences

- Backends and projects no longer add `body { margin: 0 }` to their page; those that did keep working.
- A page's own stylesheet that sets the margin or the background of `body` is overridden while the app is mounted: inline styles win.
