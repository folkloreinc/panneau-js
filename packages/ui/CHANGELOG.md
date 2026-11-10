# @panneau/ui

## 5.0.0-alpha.29

### Minor Changes

- 44a0ede: The stroke of `Icon` scales with the icon at every size (#274). Icons under 16px (`xs` and `sm`) had a fixed 2px stroke, which made them look bolder than the `md` icons next to them, such as the icon of a small icon-only button beside a menu. The new `--panneau-icon-stroke-width` component token sets the stroke in units of Lucide's 24-unit grid (`2` by default, about 1.33px at 16px), so a theme can choose a lighter or a bolder icon set. A project that set `.panneau-icon { stroke-width: 2; }` as a workaround can remove it.

### Patch Changes

- b9c9189: One aside next to lists and forms (decision 0074). `@panneau/ui` has `Aside`, the column next to the main content of a page or a form, made of `AsidePanel`s, and `AsideLayout`, which places it: beside the content from 56rem of the layout, where it stays in view as the page scrolls, and below the content or over it on narrower layouts. A button widens it, panels with a title collapse, and the browser remembers both under a key (`usePreference`, which moves from the app to `@panneau/ui`). Its look comes from the new `aside` component tokens.
  
  The item panel of lists is an `Aside`: it goes beside the list from 56rem of the list's column, and its close button is labelled "Close". The `--panneau-item-panel-*` tokens and `itemPanelTokens` of `@panneau/app` are gone: set `--panneau-aside-*` instead. The classes of the panel's header, toolbar and body are now those of `.panneau-aside`, and `.panneau-form-layout`, `.panneau-form-sidebar` and `.panneau-form-with-sidebar` give way to `.panneau-aside-layout` and `.panneau-aside`.
  
  The `sidebar` nodes of form layouts are panels of an `Aside`: a card that stays in view as the form scrolls. A `sidebar` with a `label` has a title, which the user can collapse unless `collapsible: false`, and `collapsed: true` starts it collapsed. It opens to show an error. `Form` takes `sidebarStorageKey`, under which the browser remembers its collapsed panels; the app sets it per resource.
- d417492: A dock, in place of the sidebar (decision 0076). With `theme.navigation: "dock"` in the definition, the app shows the `main` menu in a dock at the bottom of the window instead of the sidebar: a raised pill from the `lg` width, where groups open their links in a menu, then "Go to…", the queued action runs and the user's menu (profile, color scheme, log out). On phones, it is a bar of tabs with the first entries and "More" for the others. A bar at the top keeps the site and the current context. `@panneau/protocol` adds `navigation` (`sidebar`, the default, or `dock`) to the definition's theme, and `@panneau/app` exports `dockTokens` (`--panneau-dock-*`). The footer of forms, asides beside the content and toasts stay above the dock (`--panneau-frame-bottom`). Menu items that are links are no longer underlined.
- 51599d6: The panels of a form's sidebar, defined by the resource (decision 0075). A `sidebar` node of a form layout with a `panel` is a block of the app or of a plugin, which gets the node, the form, its fields and its children rendered (`FormPanelProps`), with the node's `props`. A panel that no component provides renders its children.
  
  - Plugins register panels under `panels`, a new kind of `@panneau/core`, and `Form` takes `panels`. In the app, `useFormPage()` gives a panel the resource and the item of its form.
  - Built-in panels: `save` (the state of the form and its Save button) and `errors` (the errors after a failed save) in `@panneau/forms`, which show beside the form only, where the form then has no footer nor summary at the top; `publication` in `@panneau/forms/publication`, with Publish and Unpublish buttons that set the publication and save; `actions` in `@panneau/app`, which takes the actions of the item out of the page header.
  - `AsidePanel` takes `isBesideOnly`, and an aside hides its empty panels.
  - The `pages` of the protocol's example have a sidebar with these panels.
- 179efeb: Themes can set selections apart from the accent, and style focus rings and filled buttons (decision 0073). New component tokens: `--panneau-selected-bg`, `--panneau-selected-text` and `--panneau-selected-subtle`, read by checkboxes, radios, switches, the slider, tabs, calendars, selected rows, cards and media, and the rich text toolbar (they default to the accent, so nothing changes without them); `--panneau-input-border-color-focus`, `--panneau-input-focus-ring` and `--panneau-input-focus-ring-invalid`; `--panneau-button-solid-border-color` and `--panneau-button-pressed-scale`; `--panneau-field-required-color`; `--panneau-switch-track-border-color`; `--panneau-segmented-control-segment-color-hover` and `-segment-bg-hover`, so a hovered segment no longer takes the text color of the selected one. `checkTheme()` checks translucent colors over what is under them, explicit tone values that refer to the palette, and the selection against the surface. The active formats of the rich text toolbar are visible again, and the links of the login page use the link color.
- d6800eb: The app now takes the density of the definition's theme (`theme.density`: `compact`, `comfortable`, `touch` or `auto`), as decision 0024 says: set it to `touch` for larger controls everywhere. The tags input is as tall as other inputs in each density: it was 8px taller.
- e3465c2: Touch targets follow the density (decision 0072). A new density token, `--panneau-target-size` (1.5rem, and 2.75rem in the touch density), sets the smallest size of what a pointer or a finger hits: rows of checkboxes, radios and switches, the slider, the remove button of tags, the sidebar's links, sortable table headers and the "back" link of pages. Checkboxes, radios and switches read it instead of their `pointer: coarse` rules, so the `touch` density makes them larger on any device, and touch screens see no change. The rich text toolbar wraps by groups, never leaving one button alone on a line.
- Updated dependencies [b9c9189]
- Updated dependencies [d417492]
- Updated dependencies [51599d6]
- Updated dependencies [ef36326]
  - @panneau/intl@5.0.0-alpha.29

## 5.0.0-alpha.28

### Patch Changes

- @panneau/intl@5.0.0-alpha.28

## 5.0.0-alpha.27

### Patch Changes

- @panneau/intl@5.0.0-alpha.27

## 5.0.0-alpha.26

### Patch Changes

- d44397d: The indicator of the selected tab takes the width of the tab, not that of its text. A multiple select shows its chosen options as one line, their labels in a list ("Draft, In review, and Published"), cut at its end when it is too long: their whole content, descriptions included, stacked in the trigger.
- Updated dependencies [8461e06]
- Updated dependencies [e322361]
  - @panneau/intl@5.0.0-alpha.26

## 5.0.0-alpha.25

### Patch Changes

- f316d86: The thumb of a slider stays between the edges of its field, as the other fields line up: at its ends, it reached half its width past them. The rail and the fill still take the whole width.
- f316d86: The spinner is a quarter of a circle with rounded ends, turning on a faint ring of the same color, instead of a ring with one quarter cut out.
- f316d86: The indicator of the selected tab covers the line under the tabs again: the list scrolls, which cut the indicator to a thin line above it, with a gap.
- f316d86: Toasts line up their icon, the first line of their text and their buttons on one axis: the text sat a few pixels above the buttons. They are more compact, their action is a ghost button next to the close button, and the colored edge of a warning or an error is a straight band at their start instead of a thick rounded border.
- Updated dependencies [f316d86]
- Updated dependencies [f316d86]
  - @panneau/intl@5.0.0-alpha.25

## 5.0.0-alpha.24

### Patch Changes

- @panneau/intl@5.0.0-alpha.24

## 5.0.0-alpha.23

### Patch Changes

- Updated dependencies [c310e38]
  - @panneau/intl@5.0.0-alpha.23

## 5.0.0-alpha.22

### Patch Changes

- d8a77d0: After a create, the list (decision 0066):
  
  - `@panneau/app`: creating an item goes back to the list of its resource, in place of the create page, instead of opening its edit page with a toast. The list highlights the new item and scrolls it into view. Only a list that doesn't show it (its filters, its sort or its page) says it was created, in a toast with "Open".
  - `@panneau/lists`: `ListView` takes `highlightedItemId`: the item gets a subtle background that fades after about 3 seconds (without the fade when the system asks for less motion), is scrolled into view, and is marked `data-highlighted`. Layouts get `isHighlighted(item)`.
  - `@panneau/ui`: toasts rise above a footer that sticks to the bottom (`useToastOffset()`) only while it covers the bottom of the viewport. The footer of a short form, after its last field, no longer sends them up the screen.
  - `@panneau/intl`: "Open", for the toast of a created item, in English and French.
  - `@panneau/protocol`: the mock backend gives a created or duplicated item an id that none of the items it started with has.
- Updated dependencies [d8a77d0]
- Updated dependencies [d8a77d0]
  - @panneau/intl@5.0.0-alpha.22

## 5.0.0-alpha.21

### Patch Changes

- 2a87620: `LineChart`: no top of the scale when every value is 0, where it showed a `0` over the flat line, and the caption of its hidden table no longer shows over the plot in Chrome, where the visually hidden class on the table itself left its caption visible.
- @panneau/intl@5.0.0-alpha.21

## 5.0.0-alpha.20

### Patch Changes

- @panneau/intl@5.0.0-alpha.20

## 5.0.0-alpha.19

### Patch Changes

- Updated dependencies [b547a0a]
- Updated dependencies [f07ce4c]
  - @panneau/intl@5.0.0-alpha.19

## 5.0.0-alpha.18

### Minor Changes

- b200640: The widgets of the dashboard (decision 0064):
  
  - `@panneau/protocol`: the built-in widget types are `stat`, `series` and `list`, and `StatWidgetData`, `SeriesWidgetData` and `ListWidgetData` are the shapes of their data at `GET /dashboard/widgets/{widget}`, in the schemas and the OpenAPI document (with a `500` for data in the wrong shape). A `stat` or a `list` with `settings.resource` and `settings.query` reads the list of a resource instead. `validateDefinition()` checks the widgets: unique ids, a resource that exists, filters of its list, no `stat` on a list paged with cursors. `checkWidgetData()`, `getWidgetResource()` and the widget constants are in `@panneau/protocol/runtime`. The mock backend answers the widgets with its `widgets` option, and the conformance kit checks the endpoint (`dashboard.widgets`, `dashboard.widgets.resource`, `dashboard.widgets.unknown`).
  - `@panneau/ui`: `Stat`, a number in large type with its label, its help, a tone and a link, and `LineChart`, a line on the chart colors of the theme with its values in a table for assistive technologies. Both draw a skeleton while they load.
  - `@panneau/data`: `useWidgetData()`, `widgetDataQueryOptions()` and `queryKeys.widget()`.
  - `@panneau/core`: `WidgetProps`, the props of the widgets of plugins.
  - `@panneau/intl`: the messages of the widgets, in English and French.
  - `@panneau/app`: the built-in `dashboard` page draws the widgets of `definition.dashboard` in a grid of 12 columns, one column on a phone. Each widget draws a skeleton of its type while it loads, its error with "Try again" when it fails, and nothing on a `403` or on a resource the user can't list, without touching the others. Without widgets, the home page still shows the cards of the resources.
- 93223bd: Quicker long forms ([#227](https://github.com/folkloreinc/panneau-js/issues/227)):
  
  - `@panneau/forms`: ⌘ Enter on Apple platforms, Ctrl Enter elsewhere, saves a `FormView` (and a `Form`) from any of its fields, a text area and the rich text editor included. Keys pressed in a dialog or a popover that a field opens are left to it. The submit button gives the shortcut in its tooltip and in `aria-keyshortcuts`. After a failed save, every collapsed section that holds an error opens, not only the one of the first error; tabs keep their error counts, and the tab of the first error shows.
  - `@panneau/editor`: Mod-Enter no longer adds a line break, so that it saves the form. Shift Enter still does.
  - `@panneau/ui`: `Button` (and `IconButton`) render `aria-keyshortcuts`, which React Aria left out: the "Go to…" button of the sidebar now gives its shortcut too.
  - `@panneau/intl`: the `panneau.forms.saveShortcut` message, in English and French.
- 11bcf36: Toasts (decision 0062):
  
  - `@panneau/ui`: toasts show at the bottom, centered, above what sticks to the bottom of the page (`useToastOffset(ref)`), and take the whole width on a phone. `PanneauRoot` takes a `toastPlacement` (`bottom`, `bottom-end`, `top-end`). `show()` takes a `key`: a toast with the key of one already shown replaces it. At most three show at once, the older ones folded behind the newest until the region is hovered or focused. Timeouts follow what a toast holds (`getToastTimeout()`): about 5 seconds, longer for a longer text, about 10 seconds with an action (instead of never), none for an error. A success keeps the neutral look; only warnings and errors color the edge. They appear from below, without motion when the system asks for less.
  - `@panneau/forms`: a form says "Saved" in its footer, next to its button, until its values change, instead of in a toast, and a failed save says so there too, without a toast. `saved` keeps "Saved" when the form starts over from the item it just saved. `showSavedToast` only applies to a form without a footer. The footer raises the toasts above it.
  - `@panneau/actions`: toasts name what an action was done to (the item by its title, or the count of items), one per action and target. No toast when a queued run starts: the runs button shows it, and the toast comes when it ends (not at all when the open list of runs shows it and the result says nothing more).
  - `@panneau/app`: creating an item says what was created in a toast, since the page changes; saving it again says "Saved" in the footer of its form.
- aae4bf7: Tones: what each one means for a state is written once, in the protocol's docs (`neutral` not started, `info` in progress, `success` done, `warning` needs attention soon, `danger` a problem to fix now, `muted` over), and `accent` is never a state. A new built-in tone, `muted`, for what is over (Archived, Cancelled): no fill in its `subtle` appearance, only a grey outline and the muted text. Its semantic tokens (`--panneau-color-muted`, `-subtle`, `-border`, `-solid`, `-solid-hover`, `-solid-text`) are in the default theme for both schemes and in `bootstrapTheme`, and `checkTheme()` checks their contrast. Projects coming from Panneau 4 map Bootstrap's `dark` to `muted`. The `Tones` story shows each tone with its meaning and examples.

### Patch Changes

- Updated dependencies [b200640]
- Updated dependencies [93223bd]
- Updated dependencies [11bcf36]
- Updated dependencies [d46a16d]
  - @panneau/intl@5.0.0-alpha.18

## 5.0.0-alpha.17

### Patch Changes

- @panneau/intl@5.0.0-alpha.17

## 5.0.0-alpha.16

### Minor Changes

- 8281dc0: Date ranges and money ([decision 0053](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0053-date-ranges-and-money.md)).
  
  - **`daterange`:** a new built-in type, `{ start, end }`: days (`2026-11-04`, both inclusive), or date-times with `settings.time`, written in UTC. `settings.allDay` adds an "All day" switch, whose values have days as bounds and `allDay: true`; `settings.open` (`start`, `end` or `both`) lets a bound be `null`; `settings.timeZone` is the zone date-times are shown and typed in, and `settings.chooseTimeZone` keeps a zone the user picks in the value (`timeZone`). `DateRangeField` (`@panneau/fields/daterange`) edits both bounds in one control, with one calendar. Lists show the range in the locale's format (`Nov 4 – 6, 2026`, `From Nov 4, 2026`), sort it by its start, and the calendar layout shows an item on each day of its range.
  - **`money`:** a new built-in type, `{ amount, currency }`, the amount an integer in the minor unit of an ISO 4217 currency. `settings.currency` fixes the currency, `settings.currencies` lists those to pick from. `MoneyField` (`@panneau/fields/money`) types the amount in the currency format of the locale, without floating point errors. Lists show it in that format. `min` and `max` apply to the amount, and forms show them as amounts (`This amount must be at least $1.00.`).
  - `@panneau/protocol`: the `daterange` and `money` portable rules, implied by their types; `DateRangeValue`, `MoneyValue`, `DateRangeSettings` and `MoneySettings`, which `validateDefinition()` checks; `CURRENCY_CODES`, `getCurrencyDigits()`, `toMinorUnits()` and `fromMinorUnits()`. `matchesFilterRange()` and the mock backend keep the date ranges that overlap a `date-range` filter. `lintDefinition()` accepts a `daterange` as the field of a calendar. The conformance kit checks, with `writes`, that a backend refuses a reversed range and an amount in major units (`create.implied-rules`).
  - `@panneau/ui`: `DateRangePicker`, whose bounds can each stay empty.

### Patch Changes

- f41f26f: A `url` field keeps the focus when the link to open the URL appears as it is typed: a `TextInput` whose `prefix` or `suffix` is `null` keeps its input in the same control.
- Updated dependencies [f41f26f]
- Updated dependencies [9278b2c]
- Updated dependencies [8281dc0]
- Updated dependencies [cd47332]
- Updated dependencies [3522797]
  - @panneau/intl@5.0.0-alpha.16

## 5.0.0-alpha.15

### Patch Changes

- Updated dependencies [658b3d3]
- Updated dependencies [97456b6]
- Updated dependencies [d85d11a]
- Updated dependencies [b05ef33]
- Updated dependencies [acdc6e2]
  - @panneau/intl@5.0.0-alpha.15

## 5.0.0-alpha.14

### Patch Changes

- 4f141f9: The chosen option of a `Select` lines up in its trigger again: its label starts at the padding of the trigger, without the room of the check that marks it in the list, and sits in the middle of the trigger rather than a few pixels below. It showed in the per page select of lists and the text style select of the rich text field.
- 4f141f9: Toasts show at the top right, newest first, instead of the bottom right, where they covered the sticky actions of forms (the Save button). On narrow screens, they span the top of the screen.
- @panneau/intl@5.0.0-alpha.14

## 5.0.0-alpha.13

### Minor Changes

- b07c7ab: Countries, regions and phone numbers ([decision 0047](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0047-countries-regions-and-phone-numbers.md)).
  
  - **`country`:** a new built-in type, an ISO 3166-1 alpha-2 code (`CA`). `CountryField` (`@panneau/fields/country`) picks it by name in the user's locale, with its flag; `settings.countries` limits the choices and `settings.preferred` puts some first. Lists show the flag and the name.
  - **`region`:** a new built-in type, a state, a province or a territory of the country in the field that `from` names, or of `settings.country`. `RegionField` (`@panneau/fields/region`) picks among the regions of Argentina, Australia, Brazil, Canada, China, India, Japan, Mexico and the United States, named in English or French, and gives the code without the country (`QC`); for other countries, it is a text. Lists show the name.
  - **`tel` values are now E.164** (`+15145550199`). **Breaking:** the new `tel` rule, implied by the type, refuses numbers kept as typed. `TelField` shows the country of the number, its flag and its calling code in a menu at the start of the input, formats the number as it is typed, follows a number typed with its calling code, and turns a number as typed into E.164 when the field is left. `settings.country` (`country`) is the country of a new number. Lists show the flag and the international format.
  - `@panneau/ui`: options of `Select` and items of `ComboBox` take a decorative `prefix`; `ComboBox` takes a `prefix` before its input; `Select` takes `renderValue` and `appearance="bare"`, to sit inside another control.
  - `@panneau/fields` depends on `libphonenumber-js`.
  - `@panneau/ui`: a `TextInput` with a prefix or a suffix, and a `ComboBox`, now look read-only when they are (`isReadOnly`); a read-only `ComboBox` has no button to show its options.

### Patch Changes

- Updated dependencies [f3036ed]
- Updated dependencies [b07c7ab]
- Updated dependencies [7a5a38e]
- Updated dependencies [1e19478]
- Updated dependencies [24c4fa6]
- Updated dependencies [47b7556]
- Updated dependencies [5002faa]
- Updated dependencies [bdd0a17]
  - @panneau/intl@5.0.0-alpha.13

## 5.0.0-alpha.12

### Patch Changes

- 0a8447e: Localized fields show one locale at a time, as in Panneau 4, and forms use the width they have.
  
  - `@panneau/fields`: a localized field shows the input of one locale under its label, with a switch of the locales (`FR`, `EN`) at the end of the label's line. The switch marks a locale in error with a red dot, and an empty locale with an amber dot when the field is required, or with `+` when it isn't: a translation to add. The first locale shows first; every input stays mounted. `LocalizedField` takes `locale` and `onLocaleChange` to control the locale shown, and `invalidLocales`. The input of a locale has no visible label: `label` of `LocalizedInputProps` is meant for its `aria-label`. Field entries take `hideLabel` (also on `NestedField`), which `getFieldProps()` turns into an `aria-label`, and `invalidPaths`, the paths in error inside the field, which a binding gives to fields that show their nested fields. The fields of a group flow in columns of at least 14rem: short fields share a row, and wide ones take a row of their own. `isWideField()` tells them apart: text areas, groups, repeaters, localized fields, several values, radios and checkboxes, and the types of plugins are wide. `RevealContext`, `createRevealRegistry()` and `useRevealer()` let fields that hide some of their own show the path a form reveals.
  - `@panneau/forms`: the fields that a layout doesn't place, which is every field of a form without a layout, flow in columns of at least 16rem after the layout, and in the form's skeleton too. `Form` gives `FormView` its layout as given. When it focuses the field of an error, a form first shows its locale, as it opens its tab or section. The errors of a localized field are listed, and the first one focused, in the order of the form's locales, not alphabetically. Its reveal registry is the one of `@panneau/fields`.
  - `@panneau/ui`: `Fieldset` takes `legendEnd`, controls at the end of the legend's line. The group is then named by the legend through `aria-labelledby`.
  - `@panneau/app`: the form of an item takes the width of a list (80rem) when its layout has a sidebar.
  - `@panneau/intl`: messages of the locale switch, in English and French.
  
  The `panneau-localized-field-locales` class is removed: the locales of a localized field are in a `panneau-fieldset`.
- Updated dependencies [0a8447e]
  - @panneau/intl@5.0.0-alpha.12

## 5.0.0-alpha.11

### Patch Changes

- 84bab2b: The links of an item's actions look like the buttons beside them, in rows and in the header of the item's panel and form, with room between them.
  
  - `@panneau/ui`: `LinkButton` is a link with the look of a `Button`: the same tones, appearances, sizes, hover and pressed backgrounds and focus ring. It goes through React Aria, so an app's router handles it. With `external`, it opens in a new tab, without access to the admin. `ButtonStyleProps` are the props of that look (tone, appearance, variant, size, icons, full width), shared by both.
  - `@panneau/lists`: the links of a row (`show`, `edit`, and other `link` actions) are `LinkButton`s, ghost and small like the other actions of the row, so their hover background is the one of the `…` menu button, on the same box. A destructive link is `danger`, like a destructive button. A link that leaves the admin (`http://`, `https://`) opens in a new tab. The actions of a row are `--panneau-space-2` apart, up from `--panneau-space-1`, and wrap on several lines in a narrow list or a card rather than overflow it; in a wide table they stay on one line. A link of the toolbar is outlined like the buttons beside it.
  - `@panneau/app`: the links in the header of an item's panel and form are `LinkButton`s, outlined like the buttons beside them, and `danger` when destructive. The `LinkButton` of `@panneau/app` renders the primary `LinkButton` of `@panneau/ui`, and is deprecated: use that one with `variant="primary"`, as the create link of lists, the link home of the not found page and the sign-in providers now do.
  
  Four public classes are removed, as these links have the classes of a button (`panneau-button`): `panneau-actions-link`, `panneau-actions-link-md`, `panneau-pages-action-link` and `panneau-pages-link-button`.
- @panneau/intl@5.0.0-alpha.11

## 5.0.0-alpha.10

### Patch Changes

- Updated dependencies [68f5322]
  - @panneau/intl@5.0.0-alpha.10

## 5.0.0-alpha.9

### Minor Changes

- a49284e: Panneau runs under a Content Security Policy without `'unsafe-inline'` for styles. `PanneauRoot`, `<Panneau>` and `createPanneauApp()` take a `nonce`, which the `<style>` and `<link>` elements of themes and fonts get. Without it, they read the nonce where React Aria does: `<meta property="csp-nonce">`, then `__webpack_nonce__`. The README of `@panneau/ui` explains what a strict policy needs.

### Patch Changes

- 33a2779: Submitting a form in a `Dialog` or a `Popover` no longer submits the form around it. React bubbles events along the component tree, through the portal the overlay renders in, so the dialog's form also submitted the form that opened it (a resource's form, for example). The content of `Dialog` and `Popover` now stops the `submit` events that leave it.
- Updated dependencies [ca1aa46]
  - @panneau/intl@5.0.0-alpha.9

## 5.0.0-alpha.8

### Minor Changes

- 6e76c06: The app loads the messages of its plugins, and its home route follows the definition.
  
  - `<Panneau>` and `createPanneauApp()` load the messages that plugins provide (`locales`) in the locale of the definition, over Panneau's, before they render the shell. A plugin's pages no longer need an `IntlProvider` of their own. Messages that fail to load are left out, with an error in the console.
  - The home route renders `pages.home` of the definition when it has one, as decision 0019 says: the page of a plugin, with its `props`, or the built-in `dashboard` (the cards of the resources until the dashboard has widgets). Without it, the home is the cards of the resources, as before.
  - `PanneauRoot` takes `messages`, added to Panneau's in the `IntlProvider` it provides when there is none above it.

### Patch Changes

- 83c82d4: The declaration files work in TypeScript projects on `"module": "NodeNext"`. Their relative specifiers now name their file (`./schemas/index.js`, `./rest.js`), so the types that an entry point re-exports, such as `Definition` of `@panneau/protocol`, are no longer missing under Node's resolution, and the CSS Modules that some declarations imported are declared in place. Nothing changes for projects on the `Bundler` resolution.
- Updated dependencies [83c82d4]
- Updated dependencies [477d974]
  - @panneau/intl@5.0.0-alpha.8

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
