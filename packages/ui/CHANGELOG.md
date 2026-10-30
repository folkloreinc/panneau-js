# @panneau/ui

## 5.0.0-alpha.7

### Minor Changes

- fb534de: `Skeleton` and `LoadingRegion` (#121, decision 0034): content that loads shows a skeleton of its shape instead of a spinner. `Skeleton` is a line of text (`lines` for several, the last one shorter), a `rect` sized by `width`, `height` or `aspectRatio`, or a `circle`. It is `aria-hidden`, has the `panneau-skeleton` class, reads the `skeleton` component tokens (`color`, `radius`, `duration`) and pulses unless the user prefers reduced motion. `LoadingRegion` goes around it, with `aria-busy="true"` and a status message that says once that the content loads.

### Patch Changes

- 9c6c087: Every component is memoized by the React Compiler again. The packages were built with Babel 8, on which React Compiler 1.0 skips any component with a default value in its props (`Fieldset`, `Text`, `TextInput` and most others), so they shipped without memoization. The build is back on Babel 7, and the components the compiler still skipped (`Panneau`, `FormView`, `ListView`, `Select`, the file, location, embed, slug and relation fields, `MediaField`, `MediaPicker` and `ImageEditor`) are rewritten so that it compiles them. Nothing changes in their behavior.
- Updated dependencies [060e0de]
- Updated dependencies [fb534de]
  - @panneau/intl@5.0.0-alpha.7

## 5.0.0-alpha.6

### Minor Changes

- 75a6496: Five more field types ([decision 0033](../docs/decisions/0033-more-field-types.md)):
  
  - **`tel`:** a phone number, as typed, with the phone keyboard. Lists link it with `tel:`.
  - **`range`:** a number on a slider, between the `min` and `max` rules (0 and 100 without them), with `step`, `decimals` and `suffix`. It is `null` until the slider is moved.
  - **`duration`:** a number of seconds, typed in hours, minutes and seconds; `settings.precision` hides the seconds. Lists show it with its units: `1 h 5 min 30 s`.
  - **`json`:** an object or an array, edited as JSON text. Text that doesn't parse stays a string, which the new `json` portable rule refuses: the `json` type implies it, so a form can't be saved with it.
  - **`tags`:** a list of strings, typed or among `options`. `settings.allowCustom: false` allows only the options. Lists show them as badges.
  
  And:
  
  - **`@panneau/protocol`:** the five types in `BUILT_IN_FIELD_TYPES`, and the `json` rule in `PORTABLE_RULES` and `checkRules()`.
  - **`@panneau/ui`:** `Slider`, and `TagsInput`, whose tags are added with Enter, a comma or a paste, and removed with Backspace or their button.
  - **`@panneau/fields`:** `TelField`, `RangeField`, `DurationField` (with `formatDuration()`), `JsonField` (with `parseJson()`) and `TagsField`, at `@panneau/fields/tel`, `/range`, `/duration`, `/json` and `/tags`.
  - **`@panneau/lists`:** `TelDisplay`, `DurationDisplay`, `JsonDisplay` and `TagsDisplay`; `range` shows as a number.
  - **`@panneau/core`:** the message of the `json` rule.
  - **`@panneau/intl`:** the messages of the new fields and rule, in English and French.
- 4e453d2: Rich choices, to pick one item among a few rich ones, such as a connected account:
  
  - **`MenuSection`**, a group of menu items with a `title`: a small muted eyebrow that labels the group.
  - **`Menu`** takes a `footer`: a short note under the items, after a line, that describes the menu and can't be focused.
  - **`MenuItem`** takes a leading `media` (an avatar or an image) instead of an `icon`, and, in a menu with a `selectionMode`, shows a check at the end of the selected items, on a sunken background.
  - **`PillTrigger`**, a compact rounded button that shows the current value, with an optional leading media and a chevron, for a `MenuTrigger` or a `PopoverTrigger`.
  - **`RadioGroup`** takes `appearance="cards"`: bordered cards in a grid of `columns` (2 by default) that becomes one column in a narrow container, the selected card with a stronger border. Its options (`RadioGroupOption`) take a leading `media`, in both appearances.
  
  New component tokens: `--panneau-menu-*`, `--panneau-pill-trigger-*`, and `--panneau-radio-media-*` and `--panneau-radio-card-*`.

### Patch Changes

- 75a6496: - **`NumberInput`:** the `suffix` has room on both sides, and the control gets its padding back when it is read-only, without steppers.
  - **`Select`:** the chosen option's description follows its label on one line in the trigger, instead of two lines pressed against its edges.
- Updated dependencies [75a6496]
- Updated dependencies [48676ff]
- Updated dependencies [75a6496]
  - @panneau/intl@5.0.0-alpha.6

## 5.0.0-alpha.5

### Minor Changes

- b86f35e: A "Go to…" command palette ([decision 0029](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0029-go-to-palette.md)), which products can also use without the app:
  
  - `@panneau/ui`:
      - `CommandPalette`: a search field over groups of items to go to or run, in a dialog near the top of the screen (the whole screen on a phone).
      - It matches items without case or accents, needs every word to match, and ranks the best matches first (`matchCommands()`, `normalizeSearch()`). Groups that are already `matched`, such as results of a server, are shown as they are, after the others.
      - `useCommandShortcut()` opens it with ⌘K or Ctrl+K, unless something already handled the key.
      - Tokens: `--panneau-command-palette-*`.
  - `@panneau/core`: plugins add `commands` (`Command`, `getCommands()`). `isSearchable()` and `getSearchableResources()` tell which resources the global search covers: `features.search`, which defaults to `list.search`.
  - `@panneau/data`: `useSearch()`, `searchQueryOptions()` and `queryKeys.search()`.
  - `@panneau/protocol`:
      - resources get `itemSubtitle` and `itemImage`, next to `itemTitle`;
      - `features.search` defaults to `list.search`;
      - the mock backend answers `GET /search`: 5 items per resource, 20 in all, from 2 characters.
  - `@panneau/app`: "Go to…" in the sidebar (an icon when collapsed), in the phone's top bar, and on ⌘K or Ctrl+K.
      - It lists recent items, kept in the browser, then the navigation, "New {resource}", the commands of plugins and the app's actions.
      - The server's search results follow, grouped by resource, with their subtitle and image.
      - An item opens its edit form.
  - `@panneau/intl`: the messages of the palette, in English and French.
- 5779047: The global search reads `limit` and `resources`, and can be narrowed to one resource ([decision 0030](../docs/decisions/0030-search-parameters-and-scope.md)):
  
  - **`@panneau/protocol`:**
      - `GET /search` takes `limit` (1 to 20, 5 by default) and `resources` (comma-separated searchable resources). An invalid parameter is a `422` problem keyed by parameter, and a backend may answer `429` with `Retry-After`.
      - `readSearchQuery()`, `toSearchQueryParams()`, `isSearchableResource()` and the `SEARCH_*` limits are in `@panneau/protocol/runtime`. The mock backend uses them, and `openapi.json` documents them.
      - `runConformance()` checks the search: `search`, `search.scope` and `search.invalid`.
  - **`@panneau/data`:** `adapter.search(q, { limit, resources })`, `useSearch(q, { limit, resources })` and `searchQueryOptions(adapter, q, { limit, resources })`. Search keys are now `['panneau', 'search', q, options]`. A `429` is a `RateLimitedError`, with `retryAfter` from `Retry-After` (`readRetryAfter()`).
  - **`@panneau/ui`:** `CommandPalette` takes a `scope`, shown as a chip before the field, and `onScopeRemove`, called by Backspace in the empty field or the chip's button. Items with `keepsOpen` don't close it. Without results, its list shows its `status`.
  - **`@panneau/core`:** `isSearchable()` uses the protocol's `isSearchableResource()`.
  - **`@panneau/app`:** "Search in" narrows "Go to…" to one resource, with 20 results. "See all N results" opens the list of a resource, searched, when it has more results than shown. Too many searches are said in the palette.
  - **`@panneau/intl`:** the messages of the scope, in English and French.
- 5b9aa44: `Dialog` gets an `xl` size (`--panneau-dialog-width-xl`, 72rem) for pickers and editors, `fullScreenOnPhone` to take the whole screen on phones instead of opening as a sheet at the bottom, and `headerContent`, shown between the title and the close button (under the title on phones). New `SegmentedControl`: a row of a few choices, one always selected, as a radio group moved through with the arrow keys, with icons, two sizes, `fullWidth`, and its component tokens (`--panneau-segmented-control-*`).

### Patch Changes

- 5b2f3ce: Small fixes to the interface, and a link to the user's profile:
  
  - **`@panneau/ui`:**
      - a text before or after the value of a `TextInput` (`prefix`, `suffix`) reads with it, without a gap: `/episodes/ete-a-montreal`, as in the slug field. Icons and other elements keep their space;
      - `DatePicker` with a time (`granularity` `hour`, `minute` or `second`): the calendar has a field for the time, and stays open after a day is picked (`shouldCloseOnSelect` defaults to `false`). The calendar is as wide as its content, its month buttons lose the divider of the field's button, and the space of `10/15/2026, 9:30 AM` is back;
      - the description of an option (`Select`, `ComboBox`, `Menu`) is smaller, under its label, and an option with one has more room (`--panneau-list-box-item-padding-y-described`).
  - **`@panneau/app`:**
      - on a small screen too, the page is on a panel inset from the edges, with rounded corners, as on a large one. The shell's `inset`, `panel-border`, `panel-radius` and `panel-shadow` tokens apply at every width;
      - the user in the sidebar links to their profile: their item in the resource of users, when the definition has it.
  - **`@panneau/protocol`:** `user.resource` names the resource of users. Without it, clients look for a resource `users`.
  - **`@panneau/intl`:** the labels of the profile link and of the calendar's time, in English and French.
- Updated dependencies [bdb1173]
- Updated dependencies [88a3d09]
- Updated dependencies [b86f35e]
- Updated dependencies [eadfc08]
- Updated dependencies [f2c79b5]
- Updated dependencies [81ec6b2]
- Updated dependencies [6d1f1d8]
- Updated dependencies [6d1f1d8]
- Updated dependencies [199a687]
- Updated dependencies [fb33783]
- Updated dependencies [5779047]
- Updated dependencies [5b2f3ce]
  - @panneau/intl@5.0.0-alpha.5

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
