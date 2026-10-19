# 0024: A theme model as extensible as Bootstrap's

- Status: accepted
- Date: 2026-10-19
- Issue: [#56](https://github.com/folkloreinc/panneau-js/issues/56)
- Builds on: [0005](0005-styling-and-theming.md), [0020](0020-default-theme-and-icons.md)

## Context

A theme is a flat set of about 70 global tokens. That is enough to recolor the default theme, or to follow a Bootstrap site with `bootstrapTheme`, but not for a product to have its own look on top of Panneau, as projects always could with a Bootstrap theme. These are the main gaps:

- components can only be restyled globally;
- variants and tones are closed sets;
- every derived color is written by hand;
- typography has a single role;
- there are no layout primitives;
- density is hard-wired;
- there is one theme per root;
- themes are untyped and can't be composed.

Issue #56 compares each of these with Bootstrap 5.3.

## Decision

The theme model borrows Bootstrap's mechanisms, but not its utility classes, its global CSS or Sass (decision 0005 stays). It ships in steps, one pull request each.

### 1. Three layers of tokens

1. **Palette (optional):** named base colors or ramps, `--panneau-palette-<name>`.
2. **Semantic tokens:** `--panneau-color-*`, `--panneau-space-*` and the like, unchanged.
3. **Component tokens:** `--panneau-<component>-<token>` (`--panneau-button-radius`, `--panneau-badge-radius`), public API like the semantic ones.

Component tokens come from **one TypeScript source per component**. A `tokens.ts` file next to the component declares each token and its default with `defineComponentTokens()`. The types (`ComponentTokenName`), the registry (`componentTokens`), the docs and the API report come from it.

The component's CSS Module reads a token with its default as the fallback, `var(--panneau-button-radius, var(--panneau-radius-md))`, and **never declares it**. So:

- a value set by a theme, by a scope or by any ancestor element (`.my-toolbar { --panneau-button-padding-x: … }`) reaches the component;
- semantic tokens in the default resolve where the component is, so a scope that changes `--panneau-space-4` still affects buttons inside it.

A test checks that every component token used in a stylesheet is declared, with the declared default as its fallback, that every declared token is used, and that no stylesheet declares one.

A token can also style a part shared by several components: `input` (the box of every text input, select and picker), `field` (labels, descriptions, errors), `list-box` (options of selects, combo boxes and menus) and `calendar`.

### 2. Open tones, derived colors, and variants as tone × appearance

- **Tones form an open registry**, like `$theme-colors`. `neutral`, `accent`, `success`, `warning`, `danger` and `info` are built in, and a theme adds its own.
    - A tone has seven values: `text`, `subtle`, `border`, `outline`, `solid`, `solid-hover` and `solid-text`.
    - A theme gives either one color, from which Panneau derives the rest, or every value (with optional dark overrides). The derivation follows Bootstrap's `button-variant()` and `color-contrast()`:
        - the solid background is the color, with white or black text, whichever reads better;
        - the hover is 15% darker;
        - the text color is darkened (light scheme) or lightened (dark scheme) until it reaches 4.5:1 against the surface;
        - the subtle background and the border are mixed with `--panneau-color-surface` in CSS, so they follow the theme's surfaces.
    - The built-in tones read the semantic tokens (`--panneau-color-success`, `-success-subtle`, `-success-solid`…), so a theme that changes those changes the tones.
    - Components read only local `--panneau-tone-*` variables, set by `.panneau-tone-<name>` rules. A new tone therefore works in every component that takes `tone`.
    - Tone names are typed through module augmentation.
- **Variants become tone × appearance** (`solid | outline | subtle | ghost`), each appearance being a class of the component (`.panneau-button-outline`), like `.btn-outline-*`. The `variant` values of `Button` stay as deprecated aliases during the alpha: `primary` is accent solid, `secondary` neutral outline, `ghost` neutral ghost, `danger` danger solid.
- **Named variants per component:** a theme registers token overrides under `components.<component>.variants.<name>`, and they apply through a `.panneau-<component>-variant-<name>` class.

### 3. Typography roles and declared fonts

- **Font roles:**
    - families: body, heading, display and mono (`--panneau-font-family` stays an alias of body);
    - `--panneau-font-numeric`, for stats, dates and ids.
- **Heading and display tokens**, applied by `Heading` and `Text`.
- **No element styling by default.** The base stylesheet styles no element beyond its reset, since Panneau is often embedded in someone else's page. An opt-in `Prose` container styles headings, lists, tables and code in rich content.
- **Fonts in the theme:** `@font-face` rules or a hosted stylesheet, written by the root and deduplicated.

As built:

- `--panneau-font-family-heading` defaults to the body family, and `-display` to the heading family, so a theme that sets the body changes all three. `--panneau-font-family` is kept as a deprecated alias of the body, declared as `var(--panneau-font-family-body)`: a theme that sets the alias still changes the body text, but not the headings.
- `--panneau-font-numeric` is a `font-variant-numeric` value (`tabular-nums`), used by every component that shows numbers.
- The heading and display tokens are the component tokens of `Heading`: size, weight, line height and letter spacing for sizes 1 to 4 and `display-1`, `display-2`. `Prose` reads the same tokens for the headings of rich content, so a theme sets them once.
- `fonts` in a theme holds font faces (`family`, `src`, `weight`, `style`, `display`, `unicodeRange`) and stylesheets (`{ stylesheet }`). Extended themes' fonts add up. `PanneauRoot` writes the faces in one `<style>` and the stylesheets as `<link>`, both hoisted and deduplicated by React. Values that could break out of the rule are ignored, as for tokens; `src` can hold `;`, for data URLs.

### 4. Layout primitives and breakpoints

- **Primitives:** `Stack`, `Inline`, `Grid`, `Container` and `Divider`.
- **Breakpoints:** `sm` 40rem, `md` 48rem, `lg` 64rem and `xl` 80rem, as constants of the package.
- **Responsive props** (`columns={{ base: 1, md: 2 }}`) use **inline CSS variables read by static rules per breakpoint**, with container queries first. No styles are generated per instance at runtime.

As built:

- `PanneauRoot` is a size container (`container: panneau-root / inline-size`), and so is `Container`. The queries of the primitives have no name, so they follow the nearest size container: the root, a `Container`, a form or a list. The price is that of any size container: its width can't come from its content, so a root in a flex row or a float needs a width. Positioned overlays are not affected: `container-type` applies no layout containment, so `position: fixed` stays relative to the viewport. Toast regions, which share the tokens of the root, are not containers.
- A responsive prop sets one inline variable per breakpoint given, `--_panneau-<component>-<prop>-<breakpoint>`. The static rule of each breakpoint reads its variable with the smaller breakpoints as fallbacks, down to the component token. These private variables start with `_`: they are not tokens.
- Custom properties inherit, so a nested stack would get the values of the stack around it. Each primitive resets its private variables to `initial` on its children, so that only the element that sets them uses them.
- `GridItem` spans columns (`span={{ base: 'full', md: 2 }}`), for the dashboard grid.

### 5. Density

`compact | comfortable | touch | auto` on the root and on scopes. Each density is a set of tokens, which a theme can redefine.

As built:

- The density tokens are `--panneau-control-height`, `--panneau-control-height-sm`, `--panneau-font-size-control`, `--panneau-control-padding-x` and `--panneau-row-padding-y`. Component tokens for paddings default to them: the horizontal padding of inputs and small buttons, buttons with one more step, and options of list boxes with half the row padding.
- `PanneauRoot` takes `density`, written as `data-density` like `data-color-scheme`. `auto` is the default and keeps the previous behavior: touch on coarse pointers, comfortable otherwise. The definition's `theme.density` carries it from a backend.
- A theme sets the tokens of each density in `densities`. For `auto`, `getThemeCss()` writes the comfortable values under `not (pointer: coarse)` and the touch values under `(pointer: coarse)`. Density tokens in `tokens` would apply to every density, so `bootstrapTheme` now sets Bootstrap's control sizes for the comfortable density only.
- Densities on scopes come with `ThemeScope` (point 7).

### 6. Typed, composable themes as data

- `defineTheme()` with typed token names (semantic, component, palette, and `PanneauTokens` for a project's own), and a console warning for an unknown token in Panneau's namespaces (`panneau-color-*`, `panneau-button-*`…), such as a typo in a theme loaded from JSON. The warning is not limited to development: a theme is defined once, and a typo in production is worth reporting.
- `extends` and variations, merged in this order: default theme < extended themes, in order < the theme < a project's overrides on the root. A token set in `tokens` but not in `dark` applies to both schemes, so it also replaces the dark value of the themes it extends. Variants merge token by token; tones are replaced whole.
- The palette is a `palette` of the theme, written as `--panneau-palette-<name>`. A tone given as `var(--panneau-palette-<name>)` derives from the palette color, and `checkTheme()` follows references to the palette and to tokens.
- Themes stay plain data. The `Theme` schema of `@panneau/protocol` validates them (`theme.schema.json`), `@panneau/core` plugins register them, and `definition.theme` carries one: its own tokens, tones and variants, `extends` with ids of themes registered by plugins, and the color scheme. `resolveTheme()` of `@panneau/core` merges it. `@panneau/ui` and `@panneau/protocol` each have `mergeThemes()`, with the same rules, so that `@panneau/ui` doesn't depend on the protocol.

### 7. Scopes

`ThemeScope` applies a theme, a color scheme or a density to a subtree, with its own portal container so that overlays opened inside it keep its tokens.

As built:

- A scope always writes the color scheme and the density in effect, `data-color-scheme` and `data-density`, the ones it sets or those of its parent through context, so that the dark and density rules of a theme apply in it.
- The default tokens of a scheme or a density apply to a scope only when it sets one (classes `panneau-root-scheme` and `panneau-root-density`). For that, the light colors and the comfortable values are written again for scopes. Redeclaring them in every scope would reset the theme of the root: a scope with only a density would lose the brand colors. A test checks that these blocks match the default ones.
- A scope applies the text styles of its tokens again (font, size, color), since inherited values were computed on the root. One with its own color scheme or theme paints its background.
- Its theme's `<style>` is shared with roots: `useThemeStyles()` writes the CSS and the fonts of both.

### 8. Stable class names and standard state attributes

Projects target components with **stable, readable class names**, like Bootstrap's `.btn` and `.card-header`, not with attributes of Panneau's own.

- **CSS Modules generate stable names, without a hash** (`config/class-names.ts`), in builds, tests and Storybook:
    - the class named after the component of the file is `panneau-<component>`: `.badge` in `Badge.module.css` gives `.panneau-badge`;
    - every other class is `panneau-<component>-<class>`, flat: `.header` in `Card.module.css` gives `.panneau-card-header`, and `.sm` in `Button.module.css` gives `.panneau-button-sm`.
- **The root of every component has `panneau-<component>`**, even when it is styled by a shared stylesheet:
    - `.panneau-text-input`, `.panneau-select`, `.panneau-tab-list`, `.panneau-menu-item`, `.panneau-root`…;
    - `IconButton` has both `.panneau-button` and `.panneau-icon-button`.
- **These classes are public API.** Each package's `api/<name>.classes.md` lists them, generated by `npm run api` and checked in CI. Renaming a class shows in review, and is a breaking change.
- **States use standard attributes:**
    - ARIA (`aria-invalid`, `aria-expanded`, `aria-selected`, `aria-checked`, `aria-disabled`, `aria-current`, `aria-busy`);
    - the state attributes of React Aria Components, for what ARIA doesn't express (`data-hovered`, `data-pressed`, `data-focus-visible`).

    ARIA describes semantics, not components or variants: `Button`, `IconButton` and a tab share roles, `Badge` and `Card` have none. So ARIA is only used for states, and never to identify a component.

- **Tones, appearances and sizes are modifier classes**, like `.btn-primary` and `.btn-outline-*`: `.panneau-tone-<name>`, and the appearance or size as a class of the component (`.panneau-button-outline`, `.panneau-button-sm`). A theme's own tones get their own class rules.

The first version of this decision used `data-panneau` attributes. The maintainers preferred stable class names, which are the usual way to target a component, and need no Panneau-specific attribute.

**Cascade layers are deferred.** Unlayered CSS beats layered CSS whatever its specificity. Putting the component styles in `@layer` would therefore let a site's global element rules override Panneau components, for example Bootstrap's Reboot on `button`, `a`, `h1`–`h6`, `label` and `legend`, on any Bootstrap site. Today Panneau's class selectors win over those element selectors. Layers wait for a design that keeps that guarantee.

### 9. Chart colors

Data visualization tokens in both schemes: 8 categorical colors, a sequential ramp and a diverging pair, checked in CI.

As built:

- The tokens are `--panneau-chart-categorical-1…8`, `--panneau-chart-sequential-1…5` and `--panneau-chart-diverging-negative|neutral|positive`, with values for both schemes. `chartColors` gives them as CSS variables.
- The categorical palette was searched, not picked by hand. It maximizes the smallest difference between two colors (CIE76 in CIELAB), for typical vision and under protanopia, deuteranopia and tritanopia (simulation of Machado, Oliveira and Fernandes, 2009), among colors that reach 3:1 against the surface with a moderate chroma. The smallest difference is 14 with a deficiency and 30 without. The sequential ramp moves away from the surface step by step, and the diverging pair is orange and blue, which every deficiency tells apart.
- CI checks the default palette (`chartColors.test.ts`). `checkTheme()` checks the chart colors a theme sets: contrast as non-text (3:1), and `colorDifferences` for categorical colors closer than 10.

### Tooling

- **A reference theme** in Storybook and the tests, not in the public API. It is very different from the default (square corners, serif headings, extra tones and named variants), and the stories, the axe checks and `checkTheme()` run against it.
- **`checkTheme()`:** a contrast report.
- **`bootstrapTheme`** maps component tokens to Bootstrap's component variables where they exist.

## Consequences

- Any component can be restyled through its tokens, in a theme, a scope or a project's CSS, or through its stable classes.
- Adding a component token means declaring it in `tokens.ts` and reading it with its fallback. The test fails otherwise.
- Replacing `variant` with tone × appearance is a breaking change. It lands during the alpha, with aliases.
- The app shell (Phase 2) and the dashboards (decision 0015) are built with the layout primitives.
