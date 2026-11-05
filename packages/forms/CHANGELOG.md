# @panneau/forms

## 5.0.0-alpha.19

### Minor Changes

- b547a0a: Compound fields: field types of plugins made of sub-fields (decision 0065):
  
  - `@panneau/protocol`: a type that isn't built in and has `fields` is a compound field. Its value is an object of them, or a list of objects with `multiple`, and `checkValues()` checks it as a `group` or a `repeater`. `getNestedShape()`, `isCompoundField()` and `isBuiltInFieldType()` in `@panneau/protocol/runtime`. In the JSON Schema, the OpenAPI spec and `docs/protocol.md`.
  - `@panneau/fields`: a compound field without its plugin renders as a group, or as a repeater with `multiple`. `defineCompoundField({ layout, summarize })` makes the entry of a compound type; `summarizeCompound()` and `restParts()` help with it. `GroupField` and `RepeaterField` take `renderFields`, and `RepeaterField` takes `itemTitle`. Two optional plugins: `credits` (`@panneau/fields/credits`: a person or a name, their roles, featured) and `sessions` (`@panneau/fields/sessions`: dates and a venue).
  - `@panneau/forms`: errors, paths and counts of compound fields follow their shape. A `component` node of a layout gets its rendered `children` and the `fields` of the form (`LayoutComponentProps`), and renders its children without its plugin. The `publication` component (`@panneau/forms/publication`) frames the publication fields under the state of the item: published, scheduled or not, or the label and tone of its status.
  - `@panneau/core`: compound fields aren't default columns of a list.
  - `@panneau/lists`: a column of a compound field without a display of its own shows the summaries of its plugin.
  - `@panneau/intl`: the messages of the `publication` component, in English and French.

### Patch Changes

- Updated dependencies [b547a0a]
- Updated dependencies [f07ce4c]
  - @panneau/protocol@5.0.0-alpha.19
  - @panneau/core@5.0.0-alpha.19
  - @panneau/fields@5.0.0-alpha.19
  - @panneau/intl@5.0.0-alpha.19
  - @panneau/ui@5.0.0-alpha.19

## 5.0.0-alpha.18

### Minor Changes

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

### Patch Changes

- Updated dependencies [b200640]
- Updated dependencies [93223bd]
- Updated dependencies [19d0892]
- Updated dependencies [11bcf36]
- Updated dependencies [aae4bf7]
- Updated dependencies [d46a16d]
  - @panneau/protocol@5.0.0-alpha.18
  - @panneau/ui@5.0.0-alpha.18
  - @panneau/core@5.0.0-alpha.18
  - @panneau/intl@5.0.0-alpha.18
  - @panneau/fields@5.0.0-alpha.18

## 5.0.0-alpha.17

### Patch Changes

- Updated dependencies [2a1f32d]
  - @panneau/fields@5.0.0-alpha.17
  - @panneau/core@5.0.0-alpha.17
  - @panneau/intl@5.0.0-alpha.17
  - @panneau/protocol@5.0.0-alpha.17
  - @panneau/ui@5.0.0-alpha.17

## 5.0.0-alpha.16

### Minor Changes

- f41f26f: Addresses and links ([decisions 0054](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0054-addresses.md) and [0055](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0055-links.md)).
  
  - **`address`:** a new built-in type, the parts of a postal address, `{ street, unit, city, region, postalCode, country }`, with a `point` when `settings.point` is on. `AddressField` (`@panneau/fields/address`) shows the country first, which sets the labels (_Province_, _State_, _ZIP code_), the order and the regions of the other parts, normalizes the postal code of Canada and the United States when it loses focus (`H2X 1Y4`), fills every part with a place found by the address search of the `FieldsProvider`'s maps, and places the address on a map with `point`. Settings: `country`, `countries`, `preferred`, `required` (the parts a filled address must have, `street`, `city` and `country` by default) and `point`. Lists show the address on one line, with the flag of its country.
  - **`link`:** a new built-in type, `{ type, url, page, file, label, newTab }`, to a URL, a page (an item of the field's `resource`, searched in each of them), an email address (`mailto:`), a phone number (`tel:`), a media (with the media plugin), or a type that the site adds in `settings.types`, with a label per locale and a new tab chosen, set by the type (`newTab: external`) or never. `LinkField` is in `@panneau/fields/link`. Lists show the label, linked to the URL.
  - **The `postalCode` rule** is a new portable rule: a postal code of its country, given as a code or another field (`{ "field": "country" }`), for Canada and the United States. `normalizePostalCode()` and `isPostalCode()` are in `@panneau/protocol`, with `getLinkTypes()` and `resolveLinkNewTab()`.
  - `checkValues()` checks the parts of addresses and links, and keys their failures by the path of each part (`venue.postalCode`, `cta.url`); forms show them under the input of the part. The schemas `AddressValue`, `LinkValue`, `AddressSettings` and `LinkSettings` describe them, and `validateDefinition()` checks the settings.
  - The conformance kit checks that a backend refuses an invalid postal code or link at the path of the part (`update.parts`), on a resource with an `address` or a `link` field.
  - `GeocodingResult` has the parts of an `address`, which `createNominatimSource()` now asks for.
- 9278b2c: Several countries, the providers of an embed, and color palettes ([decision 0058](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0058-multiple-countries-embed-providers-color-palettes.md)).
  
  - **`country` with `multiple`:** the value is an array of distinct ISO codes, in the order they were chosen. `CountryField` takes `multiple`: the chosen countries show with their flags and names, each with a button that removes it, and the combo box adds one, leaving out those already chosen. `min` and `max` count the countries. Lists show the flags and the names.
  - **The `providers` rule:** a new portable rule, `{ "rule": "providers", "value": ["YouTube", "Vimeo"] }`, that checks the `provider` of an `embed` value without case (a value without one is left to the backend). `EmbedField` takes `providers`: it names them under its help, and refuses an embed of another provider as soon as its preview comes back. Forms name the providers in the rule's message, in English and French.
  - **`color` with a palette:** `settings.palette`, `[{ value, label, color }]`, the colors to pick from. `ColorField` takes `palette`: a select of its colors with their swatches, that can be emptied unless the field is required. `getColorPalette()` and `getSwatchColor()` of `@panneau/fields/color` read it. Lists show the swatch and the label of a palette's color.
  - No codemod is needed: v4 fields had none of these options. A project with a taxonomy of countries, its own embed rule or a `select` of color names migrates its data or its definitions by hand.
- 8281dc0: Date ranges and money ([decision 0053](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0053-date-ranges-and-money.md)).
  
  - **`daterange`:** a new built-in type, `{ start, end }`: days (`2026-11-04`, both inclusive), or date-times with `settings.time`, written in UTC. `settings.allDay` adds an "All day" switch, whose values have days as bounds and `allDay: true`; `settings.open` (`start`, `end` or `both`) lets a bound be `null`; `settings.timeZone` is the zone date-times are shown and typed in, and `settings.chooseTimeZone` keeps a zone the user picks in the value (`timeZone`). `DateRangeField` (`@panneau/fields/daterange`) edits both bounds in one control, with one calendar. Lists show the range in the locale's format (`Nov 4 – 6, 2026`, `From Nov 4, 2026`), sort it by its start, and the calendar layout shows an item on each day of its range.
  - **`money`:** a new built-in type, `{ amount, currency }`, the amount an integer in the minor unit of an ISO 4217 currency. `settings.currency` fixes the currency, `settings.currencies` lists those to pick from. `MoneyField` (`@panneau/fields/money`) types the amount in the currency format of the locale, without floating point errors. Lists show it in that format. `min` and `max` apply to the amount, and forms show them as amounts (`This amount must be at least $1.00.`).
  - `@panneau/protocol`: the `daterange` and `money` portable rules, implied by their types; `DateRangeValue`, `MoneyValue`, `DateRangeSettings` and `MoneySettings`, which `validateDefinition()` checks; `CURRENCY_CODES`, `getCurrencyDigits()`, `toMinorUnits()` and `fromMinorUnits()`. `matchesFilterRange()` and the mock backend keep the date ranges that overlap a `date-range` filter. `lintDefinition()` accepts a `daterange` as the field of a calendar. The conformance kit checks, with `writes`, that a backend refuses a reversed range and an amount in major units (`create.implied-rules`).
  - `@panneau/ui`: `DateRangePicker`, whose bounds can each stay empty.

### Patch Changes

- Updated dependencies [f41f26f]
- Updated dependencies [9278b2c]
- Updated dependencies [8281dc0]
- Updated dependencies [cd47332]
- Updated dependencies [3522797]
- Updated dependencies [f41f26f]
  - @panneau/protocol@5.0.0-alpha.16
  - @panneau/fields@5.0.0-alpha.16
  - @panneau/intl@5.0.0-alpha.16
  - @panneau/core@5.0.0-alpha.16
  - @panneau/ui@5.0.0-alpha.16

## 5.0.0-alpha.15

### Patch Changes

- Updated dependencies [658b3d3]
- Updated dependencies [97456b6]
- Updated dependencies [d85d11a]
- Updated dependencies [b05ef33]
- Updated dependencies [acdc6e2]
  - @panneau/protocol@5.0.0-alpha.15
  - @panneau/intl@5.0.0-alpha.15
  - @panneau/core@5.0.0-alpha.15
  - @panneau/fields@5.0.0-alpha.15
  - @panneau/ui@5.0.0-alpha.15

## 5.0.0-alpha.14

### Patch Changes

- Updated dependencies [4f141f9]
- Updated dependencies [4f141f9]
  - @panneau/ui@5.0.0-alpha.14
  - @panneau/fields@5.0.0-alpha.14
  - @panneau/core@5.0.0-alpha.14
  - @panneau/intl@5.0.0-alpha.14
  - @panneau/protocol@5.0.0-alpha.14

## 5.0.0-alpha.13

### Patch Changes

- Updated dependencies [f3036ed]
- Updated dependencies [b07c7ab]
- Updated dependencies [7a5a38e]
- Updated dependencies [1e19478]
- Updated dependencies [24c4fa6]
- Updated dependencies [47b7556]
- Updated dependencies [5002faa]
- Updated dependencies [bdd0a17]
  - @panneau/protocol@5.0.0-alpha.13
  - @panneau/core@5.0.0-alpha.13
  - @panneau/fields@5.0.0-alpha.13
  - @panneau/intl@5.0.0-alpha.13
  - @panneau/ui@5.0.0-alpha.13

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
  - @panneau/ui@5.0.0-alpha.12
  - @panneau/intl@5.0.0-alpha.12
  - @panneau/fields@5.0.0-alpha.12
  - @panneau/core@5.0.0-alpha.12
  - @panneau/protocol@5.0.0-alpha.12

## 5.0.0-alpha.11

### Patch Changes

- Updated dependencies [84bab2b]
  - @panneau/ui@5.0.0-alpha.11
  - @panneau/fields@5.0.0-alpha.11
  - @panneau/core@5.0.0-alpha.11
  - @panneau/intl@5.0.0-alpha.11
  - @panneau/protocol@5.0.0-alpha.11

## 5.0.0-alpha.10

### Patch Changes

- 2fcd438: A chosen file counts as filled, and rules can be limited to the create or update mode of a form.
  
  - `@panneau/protocol`: `isFilled()` counts a file chosen in the browser (`File`, `Blob`) as filled, and other collections by their `length` or `size` (an empty `FileList`, `Map` or `Set` isn't filled), so a required `file` field saves without direct uploads, its file sent in `multipart/form-data` (#163). `accept` and `maxSize` read the type and size of such a file. A portable rule takes `"mode": "create"` or `"mode": "update"`, to apply in that mode only: a password required to create a user, optional to edit one (#164). `checkValues()` applies it in the mode of its options, and `checkRules()` takes the mode as a fourth argument; without a mode, such a rule is skipped. The conformance kit checks that a backend doesn't apply a `required` limited to `create` to updates.
  - `@panneau/core`: `resolveFields()` and `resolveForm()` with a mode keep the rules of that mode, without their `mode`, in nested fields too, and drop those of the other. A form has a `mode` (`form.mode`): its `mode` option, or `update` with a version and `create` without. Two different files are no longer equal for `isEqual()`, so choosing another file is a change.
  - `@panneau/fields`: the required mark and the other rules read by fields (`findRule()`, `isRequired()`) ignore a rule limited to a mode until the form resolves it.
  - `@panneau/forms`: `Form` infers its mode as `useForm()` does when it has no `mode` prop, and `FormView` resolves its fields in the mode of its form, so the required mark matches the rules checked on save. In `create` mode, both leave out `updateOnly` fields, as the checks already did.
- Updated dependencies [810fc90]
- Updated dependencies [2fcd438]
- Updated dependencies [68f5322]
  - @panneau/protocol@5.0.0-alpha.10
  - @panneau/core@5.0.0-alpha.10
  - @panneau/fields@5.0.0-alpha.10
  - @panneau/intl@5.0.0-alpha.10
  - @panneau/ui@5.0.0-alpha.10

## 5.0.0-alpha.9

### Patch Changes

- Updated dependencies [a49284e]
- Updated dependencies [30f227f]
- Updated dependencies [33a2779]
- Updated dependencies [2a6cf2a]
- Updated dependencies [ca1aa46]
  - @panneau/ui@5.0.0-alpha.9
  - @panneau/protocol@5.0.0-alpha.9
  - @panneau/core@5.0.0-alpha.9
  - @panneau/fields@5.0.0-alpha.9
  - @panneau/intl@5.0.0-alpha.9

## 5.0.0-alpha.8

### Patch Changes

- 83c82d4: The declaration files work in TypeScript projects on `"module": "NodeNext"`. Their relative specifiers now name their file (`./schemas/index.js`, `./rest.js`), so the types that an entry point re-exports, such as `Definition` of `@panneau/protocol`, are no longer missing under Node's resolution, and the CSS Modules that some declarations imported are declared in place. Nothing changes for projects on the `Bundler` resolution.
- Updated dependencies [6e76c06]
- Updated dependencies [83c82d4]
- Updated dependencies [477d974]
  - @panneau/ui@5.0.0-alpha.8
  - @panneau/core@5.0.0-alpha.8
  - @panneau/fields@5.0.0-alpha.8
  - @panneau/intl@5.0.0-alpha.8
  - @panneau/protocol@5.0.0-alpha.8

## 5.0.0-alpha.7

### Minor Changes

- fb534de: Skeletons instead of spinners while content loads (#121, decision 0034), drawn by the components themselves, so a product that uses them without the app gets them too:
  
  - `ListView`: while `items` is `undefined`, rows of its columns in its layout, as many as the page size, up to 10.
  - `ItemDetails`: `item` can be `undefined` while it loads, for the labels with a skeleton of each value.
  - `Form` and `FormView`: `isLoading` draws the layout of the form, and for each field its label and a block of its height, from its type. The app's edit page uses it while the item loads.
  - The media picker draws its cards with `Skeleton`, and its own skeleton CSS is gone.
  - The app: the item panel draws its title, actions and details, the preview a block in its frame, and the boot the shell with its sidebar and a page header, instead of a centered spinner.
  - New messages, in English and French: `lists.loading`, `lists.loadingItem`, `forms.loading`, `app.previewLoading`.

### Patch Changes

- 9c6c087: Every component is memoized by the React Compiler again. The packages were built with Babel 8, on which React Compiler 1.0 skips any component with a default value in its props (`Fieldset`, `Text`, `TextInput` and most others), so they shipped without memoization. The build is back on Babel 7, and the components the compiler still skipped (`Panneau`, `FormView`, `ListView`, `Select`, the file, location, embed, slug and relation fields, `MediaField`, `MediaPicker` and `ImageEditor`) are rewritten so that it compiles them. Nothing changes in their behavior.
- Updated dependencies [9c6c087]
- Updated dependencies [060e0de]
- Updated dependencies [fb534de]
- Updated dependencies [fb534de]
  - @panneau/fields@5.0.0-alpha.7
  - @panneau/ui@5.0.0-alpha.7
  - @panneau/protocol@5.0.0-alpha.7
  - @panneau/intl@5.0.0-alpha.7
  - @panneau/core@5.0.0-alpha.7

## 5.0.0-alpha.6

### Patch Changes

- Updated dependencies [75a6496]
- Updated dependencies [48676ff]
- Updated dependencies [75a6496]
- Updated dependencies [4e453d2]
- Updated dependencies [75a6496]
  - @panneau/protocol@5.0.0-alpha.6
  - @panneau/fields@5.0.0-alpha.6
  - @panneau/intl@5.0.0-alpha.6
  - @panneau/core@5.0.0-alpha.6
  - @panneau/ui@5.0.0-alpha.6

## 5.0.0-alpha.5

### Minor Changes

- 3830b4f: Navigating the app shell no longer loses unsaved changes, and announces each page:
  
  - **`@panneau/core`:** `createLeaveGuards()`, `LeaveGuardsProvider` and `useLeaveGuard()` let a router ask the forms below it before leaving a page.
  - **`@panneau/forms`:** under a `LeaveGuardsProvider`, a form with unsaved changes (`guardUnsavedChanges`, on by default) asks in a dialog before the router leaves its page, not only before the page closes or reloads.
  - **`@panneau/app`:**
      - links, "Go to…" and actions ask before leaving a form with unsaved changes, and so do the browser's back and forward buttons;
      - the tab is named after the page (`Ten walks for the fall · Articles · Northwind Journal`);
      - when the route changes, focus moves to the title of the new page and the page scrolls to the top. Opening the panel of an item focuses the panel, and closing it gives focus back to the item's link.
- 88a3d09: Fields check their value with the backend, and the slug field does what sites' `PageSlug` did (decision 0032). A field with `check: true` sends `POST /resources/{resource}/fields/{field}/check` as it is typed (`FieldCheckRequest`), and the backend answers whether the value is available, a free suggestion, the URL's `prefix` and `url`, and `disabled` for an item the field doesn't apply to (`FieldCheckResponse`). The mock backend answers it, and the conformance kit checks it (`fields.check`). `DataAdapter.checkField?()` sends it; `createFieldCheckSource(adapter, resource, id)` gives the fields context its `checkSource`, which `FormView` takes too. The `slug` field follows its source in its own locale, or in the default one, shows the backend's URL, and offers the suggestion when the slug is taken. Field entries get the `locale` of the value they edit.
- 81ec6b2: The protocol of the image editor and the `image` field (decision 0031):
  
  - **`image` fields**, a built-in type: `media` fields for images, with the editor's options `ratios` (suggested), `rotate`, `focalPoint` and `transformBase` (`media`, `original` or `choose`). `lintDefinition()` checks their libraries as for `media`, and the mock backend references their images.
  - **The `crop` portable rule:** `{ "rule": "crop", "value": { "ratios": ["16:9", "1:1"], "required": true } }`. It requires a crop for each image, and one of the ratios once rendered, within one pixel. `checkRules()` and `checkValues()` check it, and `@panneau/forms` words it ("Crop the image to 16:9 or 1:1.") in English and French.
  - **`MediaTransform`** says its `base`: from the original file (the default), or over the media's own transform (`"media"`), with `baseTransform`, the media's transform it was made on. It keeps the keys that editor tools add.
  - **`MediaInfo.transform`:** the media's own transform. The mock backend gives it from the library's `transform` field.
  - **`parseRatio()`, `matchesRatio()` and `renderedCropSize()`** in `@panneau/protocol/runtime`.

### Patch Changes

- Updated dependencies [3830b4f]
- Updated dependencies [bdb1173]
- Updated dependencies [88a3d09]
- Updated dependencies [b86f35e]
- Updated dependencies [eadfc08]
- Updated dependencies [f2c79b5]
- Updated dependencies [81ec6b2]
- Updated dependencies [6d1f1d8]
- Updated dependencies [6d1f1d8]
- Updated dependencies [8372b27]
- Updated dependencies [199a687]
- Updated dependencies [fb33783]
- Updated dependencies [5779047]
- Updated dependencies [5b9aa44]
- Updated dependencies [5b2f3ce]
  - @panneau/core@5.0.0-alpha.5
  - @panneau/intl@5.0.0-alpha.5
  - @panneau/protocol@5.0.0-alpha.5
  - @panneau/fields@5.0.0-alpha.5
  - @panneau/ui@5.0.0-alpha.5

## 5.0.0-alpha.4

### Minor Changes

- 3974fb5: `FormView` takes an `uploadSource`, which it gives to its fields, like `relationSource`.

### Patch Changes

- Updated dependencies [b9852a0]
- Updated dependencies [ecc77a6]
- Updated dependencies [db1f253]
- Updated dependencies [3974fb5]
- Updated dependencies [3974fb5]
  - @panneau/protocol@5.0.0-alpha.4
  - @panneau/intl@5.0.0-alpha.4
  - @panneau/fields@5.0.0-alpha.4
  - @panneau/core@5.0.0-alpha.4
  - @panneau/ui@5.0.0-alpha.4

## 5.0.0-alpha.3

### Patch Changes

- Updated dependencies [3af252d]
- Updated dependencies [5a2ae0c]
- Updated dependencies [4ad084e]
- Updated dependencies [2b657fd]
  - @panneau/protocol@5.0.0-alpha.3
  - @panneau/intl@5.0.0-alpha.3
  - @panneau/ui@5.0.0-alpha.3
  - @panneau/core@5.0.0-alpha.3
  - @panneau/fields@5.0.0-alpha.3

## 5.0.0-alpha.2

### Minor Changes

- 3befc22: Class names are now stable and readable, without a hash, so that projects can target them like Bootstrap's: `.panneau-card`, `.panneau-card-header`, `.panneau-button-sm` (decision 0024). Each package lists its classes in `api/<package>.classes.md`. They are public API.

### Patch Changes

- f86c757: Global element rules of a site, such as Bootstrap's Reboot, no longer leak into Panneau: a `h5` card title no longer gets `margin-bottom: 0.5rem`, legends no longer float, and dividers are no longer faded. The reset of the root now weighs two element selectors, more than a site's element rules and less than any class, and components reset the elements they render (titles, legends, paragraphs, lists, rules) in their own classes.
- Updated dependencies [deb08a8]
- Updated dependencies [8c15647]
- Updated dependencies [5af1673]
- Updated dependencies [1a76a03]
- Updated dependencies [f86c757]
- Updated dependencies [3befc22]
- Updated dependencies [3b5c39f]
- Updated dependencies [7ee3af3]
- Updated dependencies [e4cb313]
- Updated dependencies [d5cd252]
- Updated dependencies [27a1e08]
  - @panneau/ui@5.0.0-alpha.2
  - @panneau/protocol@5.0.0-alpha.2
  - @panneau/fields@5.0.0-alpha.2
  - @panneau/core@5.0.0-alpha.2
  - @panneau/intl@5.0.0-alpha.2

## 5.0.0-alpha.1

### Major Changes

- 632b700: Add `@panneau/forms`: `Form` (from fields and an `onSubmit`, with or without a definition) and `FormView` (for a form state made with `useForm()`), which render the form state of `@panneau/core`. Layout with rows, columns, collapsible sections, tabs, a sidebar and `visibleWhen`; errors next to fields, in a summary, counted on tabs and sections, with a scroll to the first one; network errors with a retry; unsaved changes guards; an error boundary per field; and the version conflict dialog. Rule messages and the UI are in English and French.

### Minor Changes

- 8d1313a: The messages of `@panneau/ui`, `@panneau/fields` and `@panneau/forms` now live in `@panneau/intl`. `@panneau/ui/locales`, `@panneau/fields/locales` and `@panneau/forms/locales` still export the `en` and `fr` messages of their package, but are deprecated: use `withPanneauMessages()`, `en` or `fr` from `@panneau/intl`, which have the messages of every package. `fieldsPlugin` now carries the French messages of every package, those of `@panneau/forms` included.

### Patch Changes

- dfb0b1f: Add pure selectors of a form state to `@panneau/core`: `selectValue(state, path)`, `selectErrors(state, path, { nested })`, `selectErrorCount(state, paths)` and `selectVisible(state, target, parentPath)`. Components read the state they subscribed to with them. The form's reading methods (`getValue()`, `getErrors()`, `countErrors()`, `isVisible()`) are now documented as non-React APIs: the React Compiler memoizes their calls by their arguments, so they return stale results in components. `@panneau/forms` uses the selectors of `@panneau/core` instead of its own.
- Updated dependencies [dbab586]
- Updated dependencies [712dfcb]
- Updated dependencies [b1d02aa]
- Updated dependencies [8d1313a]
- Updated dependencies [e5a3533]
- Updated dependencies [dfb0b1f]
- Updated dependencies
- Updated dependencies [8d1313a]
- Updated dependencies [345e06c]
- Updated dependencies [632b700]
- Updated dependencies [83999da]
- Updated dependencies [2401025]
- Updated dependencies [2565d67]
- Updated dependencies [61da236]
- Updated dependencies [b3c9d6c]
- Updated dependencies [9c844ee]
- Updated dependencies [daf7c87]
- Updated dependencies [56a9917]
- Updated dependencies [10aaed0]
- Updated dependencies [aa02ea8]
  - @panneau/ui@5.0.0-alpha.1
  - @panneau/intl@5.0.0-alpha.1
  - @panneau/core@5.0.0-alpha.1
  - @panneau/fields@5.0.0-alpha.1
  - @panneau/protocol@5.0.0-alpha.1
