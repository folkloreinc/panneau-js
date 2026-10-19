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
    - A tone is either one color, from which `defineTheme()` derives the rest (subtle background, border, hover, and a text color that passes 4.5:1), or a full set of values.
    - Components read only local `--panneau-tone-*` variables, set by `[data-tone]` rules. A new tone therefore works in every component that takes `tone`.
    - Tone names are typed through module augmentation.
- **Variants become tone × appearance** (`solid | outline | subtle | ghost`). The current `variant` values stay as aliases during the alpha.
- **Named variants per component:** a theme registers token overrides under `components.<component>.variants.<name>`, and they apply through `data-variant`.

### 3. Typography roles and declared fonts

- **Font roles:**
    - families: body, heading, display and mono (`--panneau-font-family` stays an alias of body);
    - `--panneau-font-numeric`, for stats, dates and ids.
- **Heading and display tokens**, applied by `Heading` and `Text`.
- **No element styling by default.** The base stylesheet styles no element beyond its reset, since Panneau is often embedded in someone else's page. An opt-in `Prose` container styles headings, lists, tables and code in rich content.
- **Fonts in the theme:** `@font-face` rules or a hosted stylesheet, written by the root and deduplicated.

### 4. Layout primitives and breakpoints

- **Primitives:** `Stack`, `Inline`, `Grid`, `Container` and `Divider`.
- **Breakpoints:** `sm` 40rem, `md` 48rem, `lg` 64rem and `xl` 80rem, as constants of the package.
- **Responsive props** (`columns={{ base: 1, md: 2 }}`) use **inline CSS variables read by static rules per breakpoint**, with container queries first. No styles are generated per instance at runtime.

### 5. Density

`compact | comfortable | touch | auto` on the root and on scopes. Each density is a set of tokens, which a theme can redefine.

### 6. Typed, composable themes as data

- `defineTheme()` with typed token names, and a warning in development for an unknown token.
- `extends` and variations, merged in a documented order.
- Themes stay plain data, with a JSON Schema in `@panneau/protocol`, so that `definition.theme` can carry a theme.

### 7. Scopes

`ThemeScope` applies a theme, a color scheme or a density to a subtree, with its own portal container so that overlays opened inside it keep its tokens.

### 8. Stable hooks

Every component's root carries `data-panneau="<component>"`, a public, documented hook. Parts with their own hooks:

- `root`, `tab-list`, `tab`, `tab-panel`, `menu-item`, `radio`, `toast-region`;
- `icon-button`, which replaces `button` on `IconButton`.

From step 2, `data-tone`, `data-appearance`, `data-size` and `data-variant` join them. Projects target components with these hooks instead of hashed class names.

**Cascade layers are deferred.** Unlayered CSS beats layered CSS whatever its specificity. Putting the component styles in `@layer` would therefore let a site's global element rules override Panneau components, for example Bootstrap's Reboot on `button`, `a`, `h1`–`h6`, `label` and `legend`, on any Bootstrap site. Today Panneau's class selectors win over those element selectors. Layers wait for a design that keeps that guarantee.

### 9. Chart colors

Data visualization tokens in both schemes: 8 categorical colors, a sequential ramp and a diverging pair, checked in CI.

### Tooling

- **A reference theme** in Storybook and the tests, not in the public API. It is very different from the default (square corners, serif headings, extra tones and named variants), and the stories, the axe checks and `checkTheme()` run against it.
- **`checkTheme()`:** a contrast report.
- **`bootstrapTheme`** maps component tokens to Bootstrap's component variables where they exist.

## Consequences

- Any component can be restyled through its tokens, in a theme, a scope or a project's CSS, without fighting hashed classes.
- Adding a component token means declaring it in `tokens.ts` and reading it with its fallback. The test fails otherwise.
- Replacing `variant` with tone × appearance is a breaking change. It lands during the alpha, with aliases.
- The app shell (Phase 2) and the dashboards (decision 0015) are built with the layout primitives.
