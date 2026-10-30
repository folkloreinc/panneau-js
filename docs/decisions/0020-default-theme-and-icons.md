# 0020: A sober default theme, and Lucide as the only icon set

- Status: accepted, amended by [0036](0036-default-icon-loader.md): Lucide's icon loader is the default of `createPanneauApp()` only
- Date: 2026-10-15

## Context

[0005](0005-styling-and-theming.md) settles on design tokens, themes as sets of tokens, a Bootstrap-compatible theme and "one icon set", without choosing the look of the default theme or the icon set. `@panneau/ui` needs both before its first component:

- v4 ships Bootstrap 5 globally, with two icon systems (Bootstrap Icons and Font Awesome).
- Panneau pieces are used inside other interfaces: Niche, the pilot project, renders forms and lists in its own Bootstrap-based product. A strongly branded default would clash there.
- The admin panel is used for hours at a time, on desktop and on phones, by editors who are not always technical. Contrast, focus and touch targets matter more than personality.

## Decision

### Default theme

Panneau proposes a **sober default theme**: neutral greys, one near-black accent, and color only where it carries meaning (errors, warnings, success, information, focus).

- **Accessible:** text meets WCAG AA contrast (4.5:1), and the outline of controls 3:1, in both schemes. Focus is a visible blue outline. The CI checks every story with axe, including the dark scheme and the Bootstrap theme.
- **Light and dark:** `PanneauRoot` takes `colorScheme` (`light`, `dark`, or `auto`, which follows `prefers-color-scheme`). Embedded pieces default to `light`; the app uses the definition's `theme.colorScheme`.
- **Phones:** on touch screens (`pointer: coarse`), controls are taller (44px) and inputs use 16px text, so that iOS doesn't zoom on focus.
- **System fonts.** No web font is loaded.

### Tokens and themes

- Tokens are CSS variables named `--panneau-<group>-<name>`: `color`, `font`, `space`, `radius`, `shadow`, `control`, `focus`, `duration`, `z`. The list is in `packages/ui/src/root/PanneauRoot.module.css`, and its names are public API: renaming one is a breaking change.
- **Everything is scoped to `PanneauRoot`:** the tokens and a small base stylesheet (font, colors, `box-sizing`, resets of margins). Nothing applies to the rest of the page. Overlays (dialogs, popovers, menus, tooltips) render in a container inside the root, and the toast region carries the root's class, so they get the tokens too.
- **No specificity.** Default tokens and base rules use `:where()`, so a theme, a component or a project's own class on the root overrides them without fighting the cascade.
- **A theme** is the `Theme` object of `@panneau/core` plugins: `{ tokens, dark? }`, keyed by token name without `--`. `PanneauRoot` writes it as one scoped `<style>`, hoisted and deduplicated by React.
- **Bootstrap-compatible theme:** `bootstrapTheme` maps the tokens to Bootstrap 5.3's CSS variables (`--bs-body-bg`, `--bs-primary`, `--bs-border-radius`…). Panneau then follows the site's colors, fonts, radii and color mode (`data-bs-theme`), without using any Bootstrap class. The site loads Bootstrap itself.

### Icons

**Lucide** (`lucide-react`) is the only icon set.

- Consistent 24px outline icons, about 1,600 of them, ISC licensed and actively maintained.
- One ES module per icon, so bundles only include the icons that are imported.
- `Icon` wraps any Lucide icon at a size of the scale (`xs` to `xl`), decorative unless it has a `label`. Components take icons as components (`icon={Pencil}`), so a project can pass any Lucide icon, or its own component with the same props.
- `lucide-react` is a dependency of `@panneau/ui`, not a peer dependency: icons are plain components, and two copies don't conflict.

Icons named in definitions (`"icon": "send"` on actions) need a lookup by name. It comes with the actions of Phase 2, through Lucide's dynamic imports, so that the whole set is never bundled.

## Consequences

- Components only read tokens, so a project restyles Panneau by overriding tokens on its root, or with a theme plugin, never by overriding component classes.
- Projects that use Bootstrap get a Panneau that looks like their site with one line (`theme={bootstrapTheme}`).
- Bootstrap Icons and Font Awesome are not used by v5 packages. Projects can keep using them in their own components.
- The look of the admin panel changes from v4. Screenshots in docs and guides are redone with the app shell of Phase 2.
