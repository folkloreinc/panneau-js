# @panneau/ui

## 5.0.0-alpha.4

### Patch Changes

- Updated dependencies [3974fb5]
  - @panneau/intl@5.0.0-alpha.4

## 5.0.0-alpha.3

### Minor Changes

- 2b657fd: Loading icons by name is now opt-in, so that apps that never name icons no longer get one chunk per Lucide icon (about 1,900) and their map in the runtime of every page. `PanneauRoot` takes an `iconLoader`: pass `lucideIconLoader` from the new `@panneau/ui/named-icons` entry point, or a loader of only the icons the app uses. Without one, named icons render an empty space, with a warning. **Breaking:** `loadNamedIcon(name, loader)` takes the loader, and apps whose definitions name icons (actions with `"icon"`) must set `iconLoader`.

### Patch Changes

- 4ad084e: `TextArea`, `Checkbox` and `Switch` no longer style their wrapper with the rules of their inner control. The inner element had the class named after the component (`panneau-text-area`, `panneau-checkbox`, `panneau-switch`), which is also the root class of the component, so a text area's wrapper got the padding of the textarea, and a checkbox's wrapper was laid out and dimmed like the checkbox itself. The inner element is now `panneau-text-area-control`, `panneau-checkbox-control` and `panneau-switch-control`, and the class named after a component only names its root.
- Updated dependencies [5a2ae0c]
  - @panneau/intl@5.0.0-alpha.3

## 5.0.0-alpha.2

### Minor Changes

- deb08a8: Chart colors (decision 0024, point 9): tokens for 8 categorical colors, a 5-step sequential ramp and a diverging pair, in both schemes, and `chartColors` to use them as CSS variables. The default categorical colors reach 3:1 against the surface and stay distinct with protanopia, deuteranopia and tritanopia. `checkTheme()` checks the chart colors a theme sets and reports similar categorical colors in `colorDifferences`, and `checkColorDifferences()` checks any palette.
- 8c15647: Add component tokens (decision 0024): every component reads its own `--panneau-<component>-<token>` variables (`--panneau-button-radius`, `--panneau-badge-radius`, `--panneau-card-padding-x`…), which default to the semantic tokens. They can be set by a theme, on the root, or on any element around the components, to restyle one component without touching the others. `componentTokens` lists them with their defaults, and `defineComponentTokens()` declares the tokens of a component. The root of every component also has a `panneau-<component>` class, and the switch's thumb follows the size of its track.
- 5af1673: Densities (decision 0024, step 6). `PanneauRoot` takes `density`: `compact`, `comfortable`, `touch`, or `auto` (the default, as before: touch on touch screens). New density tokens `--panneau-control-padding-x` and `--panneau-row-padding-y`. The paddings of buttons, inputs, list box options and list tables now follow the density. Themes redefine each density in `densities`, and `bootstrapTheme` sets Bootstrap's control sizes for the comfortable density only. `@panneau/protocol` adds `densities` to the `Theme` schema and `density` to the definition's theme. Storybook has a density switcher.
- 1a76a03: Layout primitives and breakpoints (decision 0024, step 5): `Stack`, `Inline`, `Grid` and `GridItem`, `Container` and `Divider`, with their component tokens. `gap`, `align`, `justify`, `columns` and `span` are responsive (`columns={{ base: 1, md: 2 }}`), at the breakpoints of `BREAKPOINTS` (`sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem), which are widths of the nearest size container. `PanneauRoot` is now a size container: in a flex row or a float, give it a width.
- 3befc22: Class names are now stable and readable, without a hash, so that projects can target them like Bootstrap's: `.panneau-card`, `.panneau-card-header`, `.panneau-button-sm` (decision 0024). Each package lists its classes in `api/<package>.classes.md`. They are public API.
- 3b5c39f: `ThemeScope` (decision 0024, step 7) applies a theme, a color scheme or a density to a subtree, without a new root: a dark sidebar in a light app, a compact list, a preview in another brand's colors. What it doesn't set comes from around it, and overlays opened inside it render in its own container, so that they keep its tokens.
- 7ee3af3: Theme tooling (decision 0024).
  
  - **New entry point:** `@panneau/ui/theme` exports the theme functions without components or CSS, for Node.
  - **New command:** `panneau-check-theme` runs `checkTheme()` on a JSON theme or on a module export, and exits with 1 when a check fails.
  - **Bootstrap:**
      - `bootstrapTone()` turns a Bootstrap theme color into a tone;
      - `bootstrapTheme` now maps Bootstrap's theme colors to tones (`accent` reads `--bs-primary-text-emphasis` on subtle backgrounds, which fixes its contrast) and its root variables to component tokens.
  - **Tones derived from one color** are readable on the theme's own surfaces.
  - **Prose:** code no longer takes the color of a site's global `code` rule.
- e4cb313: Add open tones and appearances (decision 0024, step 2).
  
  - **Tones:** `Button`, `Badge`, `Alert` and toasts take any tone: the built-in ones (`neutral`, `accent`, `success`, `warning`, `danger`, `info`) or one added by a theme (`theme.tones`). A theme tone is one color, from which Panneau derives a readable text color, the hover, the subtle background and the border, or every value. Declare added tones in `PanneauTones` so that `tone="signal"` type-checks.
  - **Appearances:** `Button` takes `appearance` (`solid`, `outline`, `subtle`, `ghost`), and `Badge` and `Alert` take `solid`, `outline` and `subtle`. The `variant` values of `Button` are deprecated aliases: `primary` is accent solid, `secondary` neutral outline, `ghost` neutral ghost, `danger` danger solid.
  - **Named variants:** `theme.components.<component>.variants` registers token overrides, applied with `variant` on `Button`, `Badge` and `Alert`. Declare them in `ButtonVariants`, `BadgeVariants` and `AlertVariants`.
  - **Contrast report:** `checkTheme()` reports the colors of a theme that miss their contrast ratio.
  - **New semantic tokens:** `--panneau-color-success-solid`, `-warning-solid` and `-info-solid`, with their `-hover` and `-text` tokens. `bootstrapTheme` maps them.
  - **Breaking:**
    - a badge with the `accent` tone is now subtle by default; use `appearance="solid"` for the previous look;
    - the icon of a neutral alert takes the text color;
    - `AlertTone`, `BadgeTone` and `ToastTone` are deprecated aliases of `Tone`.
- d5cd252: Typed, composable themes (decision 0024, step 3). `@panneau/ui` adds `defineTheme()`, which type-checks token names, builds on other themes with `extends` and reports unknown tokens, a `palette` for themes (`--panneau-palette-<name>`), `mergeThemes()`, `findUnknownTokens()`, `SEMANTIC_TOKENS` and `PanneauTokens` for a project's own tokens. `@panneau/protocol` adds the `Theme` schema, `theme.schema.json` and `mergeThemes()`, and `definition.theme` now carries a theme that extends themes of plugins by id. The `Theme` of `@panneau/core` plugins is now that of the protocol, and `resolveTheme()` merges the theme of a definition.
- 27a1e08: Typography roles and fonts in themes (decision 0024, step 4). `@panneau/ui` adds the font roles `--panneau-font-family-body`, `-heading` and `-display` (`--panneau-font-family` is now a deprecated alias of the body family), `--panneau-font-numeric`, the `Heading` component with its size tokens (1 to 4, `display-1`, `display-2`), `Text`, and an opt-in `Prose` container for rich content. Themes take `fonts`, font faces or hosted stylesheets, which `PanneauRoot` adds to the page once. `bootstrapTheme` now sets the body family. `@panneau/protocol` adds `fonts` to the `Theme` schema. Numbers in fields and lists use `--panneau-font-numeric`.

### Patch Changes

- f86c757: Global element rules of a site, such as Bootstrap's Reboot, no longer leak into Panneau: a `h5` card title no longer gets `margin-bottom: 0.5rem`, legends no longer float, and dividers are no longer faded. The reset of the root now weighs two element selectors, more than a site's element rules and less than any class, and components reset the elements they render (titles, legends, paragraphs, lists, rules) in their own classes.
- @panneau/intl@5.0.0-alpha.2

## 5.0.0-alpha.1

### Major Changes

- 10aaed0: Add `@panneau/ui`: the design tokens (`--panneau-*` CSS variables), a sober default theme in light and dark, a Bootstrap-compatible theme, `PanneauRoot`, and accessible primitives on React Aria Components (buttons, text, number, select, combo box, checkbox, switch, radio, date and time inputs, dialog, popover, menu, tabs, tooltip, toasts, alert, badge, spinner, card, disclosure), with Lucide icons and English and French messages.

### Minor Changes

- dbab586: Icons by name. `getNamedIcon(name)` of `@panneau/ui` turns a Lucide icon name (`"send"`) into an icon component, which loads that icon the first time it renders (one dynamic import per icon), with an empty space of the same size until then. `loadNamedIcon(name)` loads one ahead of time. `@panneau/lists` shows the icon an action names (`"icon": "send"`), and takes icon components by action id for actions written in code (`actionIcons={{ archive: Archive }}` on `ListView` and `List`), which win over names. `getActionIcon()` and `ActionIcons` are exported.
- 8d1313a: The messages of `@panneau/ui`, `@panneau/fields` and `@panneau/forms` now live in `@panneau/intl`. `@panneau/ui/locales`, `@panneau/fields/locales` and `@panneau/forms/locales` still export the `en` and `fr` messages of their package, but are deprecated: use `withPanneauMessages()`, `en` or `fr` from `@panneau/intl`, which have the messages of every package. `fieldsPlugin` now carries the French messages of every package, those of `@panneau/forms` included.
- daf7c87: `PanneauRoot` provides an `IntlProvider` when there is none above it, with the messages of every Panneau package (from `@panneau/intl`) in its `locale`: `<PanneauRoot locale="fr">` renders in French without any react-intl setup. Without a `locale`, or with one Panneau doesn't translate, it renders in English, as before. An app's own `IntlProvider` is kept as is.

### Patch Changes

- 56a9917: Document how Vite apps keep `getNamedIcon()` from splitting `lucide-react` into one chunk per icon in development: exclude `lucide-react/dynamicIconImports.mjs` from `optimizeDeps`. Panneau's Storybook does it, and named icon stories wait longer for their first icon.
- Updated dependencies [712dfcb]
- Updated dependencies
- Updated dependencies [8d1313a]
- Updated dependencies [9c844ee]
  - @panneau/intl@5.0.0-alpha.1
