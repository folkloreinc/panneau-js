# 0005: Design tokens and accessible primitives, no global CSS

- Status: accepted
- Date: 2026-10-14

## Context

v4 imports Bootstrap 5 globally, with variable overrides, and adds CSS Modules per component. Using a Panneau field inside an existing site therefore brings Bootstrap's global styles into that site. There are two icon systems. Accessibility depends on each component's own markup.

## Decision

- **Tokens.** Components read **design tokens** as CSS variables (`--panneau-color-…`, `--panneau-space-…`, `--panneau-radius-…`), with light and dark schemes.
- **Styles.** Each component ships its own CSS Modules. No package imports global CSS. The app imports a small base stylesheet scoped to its root element.
- **Primitives.** Interactive primitives (dialog, menu, popover, combobox, tabs, date picker) are built on **React Aria Components**, for keyboard support, focus management and screen readers.
- **Themes** are sets of tokens:
    - the default theme;
    - a **Bootstrap-compatible theme** that maps Panneau's tokens to Bootstrap's CSS variables, for sites that use Bootstrap (Niche and most client sites);
    - project themes.
- **Icons:** one icon set.

## Consequences

- Panneau pieces can be embedded in any site without style conflicts.
- Custom components in projects that use Bootstrap classes keep working next to Panneau, but new Panneau components don't rely on Bootstrap.
- The visual design of the admin is redone. This is a good time to make the home page and the lists more engaging.
