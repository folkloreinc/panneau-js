# @panneau/core

## 5.0.0-alpha.22

### Patch Changes

- Updated dependencies [d8a77d0]
- Updated dependencies [d8a77d0]
  - @panneau/protocol@5.0.0-alpha.22

## 5.0.0-alpha.21

### Patch Changes

- @panneau/protocol@5.0.0-alpha.21

## 5.0.0-alpha.20

### Patch Changes

- @panneau/protocol@5.0.0-alpha.20

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

## 5.0.0-alpha.18

### Minor Changes

- b200640: The widgets of the dashboard (decision 0064):
  
  - `@panneau/protocol`: the built-in widget types are `stat`, `series` and `list`, and `StatWidgetData`, `SeriesWidgetData` and `ListWidgetData` are the shapes of their data at `GET /dashboard/widgets/{widget}`, in the schemas and the OpenAPI document (with a `500` for data in the wrong shape). A `stat` or a `list` with `settings.resource` and `settings.query` reads the list of a resource instead. `validateDefinition()` checks the widgets: unique ids, a resource that exists, filters of its list, no `stat` on a list paged with cursors. `checkWidgetData()`, `getWidgetResource()` and the widget constants are in `@panneau/protocol/runtime`. The mock backend answers the widgets with its `widgets` option, and the conformance kit checks the endpoint (`dashboard.widgets`, `dashboard.widgets.resource`, `dashboard.widgets.unknown`).
  - `@panneau/ui`: `Stat`, a number in large type with its label, its help, a tone and a link, and `LineChart`, a line on the chart colors of the theme with its values in a table for assistive technologies. Both draw a skeleton while they load.
  - `@panneau/data`: `useWidgetData()`, `widgetDataQueryOptions()` and `queryKeys.widget()`.
  - `@panneau/core`: `WidgetProps`, the props of the widgets of plugins.
  - `@panneau/intl`: the messages of the widgets, in English and French.
  - `@panneau/app`: the built-in `dashboard` page draws the widgets of `definition.dashboard` in a grid of 12 columns, one column on a phone. Each widget draws a skeleton of its type while it loads, its error with "Try again" when it fails, and nothing on a `403` or on a resource the user can't list, without touching the others. Without widgets, the home page still shows the cards of the resources.
- d46a16d: "Undo" instead of a confirmation (decision 0063):
  
  - `@panneau/protocol`: an action declares `undoable: true`, and its result carries `undo`: `{ action, items, params }`, an action of the same resource that undoes the run, the items it changed, and its parameters. `UNDO_LIMIT` (100): above it, the client confirms, and the result has no `undo`. The built-in `restore` undoes the `delete` of a resource with a trash. In the JSON Schema, the OpenAPI spec and `docs/protocol.md`. The mock backend keeps a trash for a resource whose `delete` is undoable, answers its `undo`, and runs `restore`; the conformance kit runs the undo of a result and checks that the item is back (`action.undo`).
  - `@panneau/core`: `asksConfirmation(action, count)`: an undoable action asks first only above the limit, or when it is queued, unless it sets `confirm`. A declared `delete` that is undoable doesn't take the built-in confirmation.
  - `@panneau/actions`: the toast of a result with an `undo` has "Undo", which runs it, refreshes, and says it was undone.
  - `@panneau/lists`: undoable actions run without a confirmation up to the limit; a value changed in place says so in a toast whose "Undo" saves the previous value the same way.
  - `@panneau/app`: the item header runs undoable actions without a confirmation.

### Patch Changes

- Updated dependencies [b200640]
- Updated dependencies [19d0892]
- Updated dependencies [aae4bf7]
- Updated dependencies [d46a16d]
  - @panneau/protocol@5.0.0-alpha.18

## 5.0.0-alpha.17

### Patch Changes

- @panneau/protocol@5.0.0-alpha.17

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
  - @panneau/protocol@5.0.0-alpha.16

## 5.0.0-alpha.15

### Patch Changes

- Updated dependencies [658b3d3]
- Updated dependencies [97456b6]
- Updated dependencies [d85d11a]
- Updated dependencies [b05ef33]
- Updated dependencies [acdc6e2]
  - @panneau/protocol@5.0.0-alpha.15

## 5.0.0-alpha.14

### Patch Changes

- @panneau/protocol@5.0.0-alpha.14

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

- f3036ed: The rest of the UI follows the abilities of the current user (decision 0046): pages and fields have abilities, menus leave out what the user can't reach, and a route reached without the ability shows a forbidden state.
  
  - `@panneau/protocol`: `abilities` on a page (`{ "view": false }`) and on a field (`{ "view": false }`, `{ "update": false }`), where only `false` restricts. The JSON Schema and the OpenAPI document follow. The mock backend reads the abilities of resources (`403` on lists without `viewAny`, on creates without `create`), of items (`403` without `view`, `update` or `delete`), and of fields (items leave out the values of hidden fields, writes ignore those of fields the user can't see or update); an item of `items` can give its own `abilities`. The conformance kit checks that resources without `viewAny` answer `403` on their list, that items leave out hidden fields, that a dry run of `delete` skips an item without `delete` and, with `writes`, that an empty create of a resource without `create` and an empty update of an item without `update` answer `403`.
  - `@panneau/core`: `canViewField()`, `canUpdateField()`, `getVisibleFields()` and `canViewPage()`. `resolveFields()` and `resolveForm()` leave out the fields the user can't see, and make those they can't edit read-only. `resolveList()` leaves the fields the user can't see out of columns and sorts, and those they can't edit out of `inlineEdit`.
  - `@panneau/fields`: a field with `abilities.update: false` is read-only.
  - `@panneau/intl`: the message of an item the user can't view (`itemForbidden`).
  - `@panneau/app`: the forbidden error page (`ErrorPage` with `kind="forbidden"`) also shows on the create route of a resource without `create`, and on a page with `view: false`. The item panel says when the user can't view the item, without "Retry". The edit route of an item without `update: true` goes to its panel. `pages.home` with `view: false` shows the built-in home. Menus leave out the pages the user can't open, and the separators left at their start, at their end or next to another one. Lists, panels and forms leave out the fields the user can't see.
- 1e19478: Gallery and calendar layouts for lists ([decision 0044](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0044-gallery-and-calendar.md)).
  
  - `@panneau/protocol`: a list has `calendar` (`ListCalendar`: `field`, `filter`, `perPage`), in the JSON Schema and its types. `lintDefinition()` checks that its field is a `date` or a `datetime`, and that the list has its `date-range` filter.
  - `@panneau/core`: `resolveList()` resolves `calendar` (`ResolvedCalendar`, or `null`; `DEFAULT_CALENDAR_PER_PAGE`). In the `calendar` layout of a list with a calendar, the list state's `query` is the month's: the list's query with its `date-range` filter set to the days around the month, `perPage` from the calendar, and no page or cursor. The view has `month`, in the URL (`month=2026-11`) when it isn't the current month, with `setMonth()`, and it isn't remembered. `ListDefaults` takes `calendar`. `currentMonth()`, `shiftMonth()`, `isMonth()` and `getCalendarRange()` are exported.
  - `@panneau/lists`: `GalleryLayout` (the image of each item, its title, checkbox and actions) and `CalendarLayout` (the weeks of a month from the first day of the week of the locale, with the previous, next and current month; on narrow lists, the days that have items) are built in and exported. `ListView` takes `itemImage` and `calendar`, and leaves out the gallery without the first and the calendar without the second. In the calendar, the list's filter of the calendar is hidden, there is no pagination, and a notice says when the month has more items than the list got. `ListLayoutProps` has `getItemImage` and `calendar` (`ListCalendarProps`). `getImageUrl()` reads the URL of a media reference, a file or a URL. `List` takes the calendar too.
  - `@panneau/intl`: messages of the gallery and the calendar, in English and French.
  - `@panneau/app`: a list offers the layouts its definition declares, or the table and the cards when it declares none, with the image of the resource's items and its calendar.
- 47b7556: Users choose the columns of a list, and lists remember their view ([decision 0042](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0042-list-view-columns-and-remembered-view.md)).
  
  - `@panneau/protocol`: a column has `hidden` (not shown until the user shows it) and `hideable` (`false`: always shown), in the JSON Schema and its types.
  - `@panneau/core`: `resolveList()` resolves `hidden` and `hideable` on each column. The list state has a `view`, the layout and the ids of the columns shown, with `setLayout()`, `setColumns()` and `resetColumns()`, kept in the URL (`layout`, `columns`) when it isn't the default, and never sent to the backend. With `remember: { key, store? }`, `createList()` and `useList()` remember the filters, sort, page size, layout and columns the user changes, and restore them when the URL has no parameter of the list: they then write them to the URL, in place of its entry. A URL with any parameter of the list opens as it is, and isn't remembered until the user changes something. `createStorageViewStore()` keeps views in `localStorage` (the default store); `ListViewStore`, `ListViewState` and `RememberedView` are exported. `ListDefaults` takes `layout` and `columns`.
  - `@panneau/lists`: a "Columns" menu in the toolbar shows, hides and orders the columns, with buttons to move them and "Reset columns". Columns with `hidden` are left out until the user shows them; those with `hideable: false` can't be hidden. `ListView` reads its layout and its columns from the view of the list state: `columns` is every column of the list, and `columnChoice={false}` leaves the menu out. Its `layout` prop still controls the layout.
  - `@panneau/intl`: messages of the column menu, in English and French.
  - `@panneau/app`: each list of a resource remembers its view for the user, in the browser.
- Updated dependencies [f3036ed]
- Updated dependencies [b07c7ab]
- Updated dependencies [7a5a38e]
- Updated dependencies [1e19478]
- Updated dependencies [24c4fa6]
- Updated dependencies [47b7556]
  - @panneau/protocol@5.0.0-alpha.13

## 5.0.0-alpha.12

### Patch Changes

- @panneau/protocol@5.0.0-alpha.12

## 5.0.0-alpha.11

### Patch Changes

- @panneau/protocol@5.0.0-alpha.11

## 5.0.0-alpha.10

### Minor Changes

- 2fcd438: A chosen file counts as filled, and rules can be limited to the create or update mode of a form.
  
  - `@panneau/protocol`: `isFilled()` counts a file chosen in the browser (`File`, `Blob`) as filled, and other collections by their `length` or `size` (an empty `FileList`, `Map` or `Set` isn't filled), so a required `file` field saves without direct uploads, its file sent in `multipart/form-data` (#163). `accept` and `maxSize` read the type and size of such a file. A portable rule takes `"mode": "create"` or `"mode": "update"`, to apply in that mode only: a password required to create a user, optional to edit one (#164). `checkValues()` applies it in the mode of its options, and `checkRules()` takes the mode as a fourth argument; without a mode, such a rule is skipped. The conformance kit checks that a backend doesn't apply a `required` limited to `create` to updates.
  - `@panneau/core`: `resolveFields()` and `resolveForm()` with a mode keep the rules of that mode, without their `mode`, in nested fields too, and drop those of the other. A form has a `mode` (`form.mode`): its `mode` option, or `update` with a version and `create` without. Two different files are no longer equal for `isEqual()`, so choosing another file is a change.
  - `@panneau/fields`: the required mark and the other rules read by fields (`findRule()`, `isRequired()`) ignore a rule limited to a mode until the form resolves it.
  - `@panneau/forms`: `Form` infers its mode as `useForm()` does when it has no `mode` prop, and `FormView` resolves its fields in the mode of its form, so the required mark matches the rules checked on save. In `create` mode, both leave out `updateOnly` fields, as the checks already did.
- 68f5322: Lists have the `show`, `edit` and `delete` buttons of v4 again, and `duplicate`: every resource has these four item actions without declaring them, shown on the items whose abilities allow them. A resource can also open its items in their form instead of the panel (decision 0040).
  
  - `@panneau/protocol`:
      - The built-in item actions `show`, `edit`, `duplicate` and `delete` need their ability on an item: `view`, `update`, `duplicate`, `delete`. A missing or false ability hides them. A resource picks some of them, in its order, with `itemActions` (`["edit", "delete"]`, `[]` for none). A declared action with one of these ids replaces the built-in one, takes its `placement`, `confirm`, `destructive` and `dryRun` when it doesn't set them, and its `label` is optional. The id set to `false` hides the action too (`"edit": false`). An item without abilities shows none of the four.
      - The ids `show` and `edit` are reserved for `link` actions; every other action needs a `label`. The generated JSON Schema and OpenAPI document check both with `if`/`then`, and also that a `link` has a `url` or a `route` and a `client` action a `component`, as the Zod schemas do.
      - `POST /resources/{resource}/{id}/duplicate` copies an item, and answers `201` with the copy, or a `409` problem when the copy conflicts with another item (a unique value).
      - A resource takes `open`: `panel` (the default) or `edit`, where an item's title goes.
      - `BUILT_IN_ITEM_ACTIONS`, `ITEM_ACTION_ABILITIES`, `isBuiltInItemAction()`, `BUILT_IN_LINK_ACTIONS` and `isBuiltInLink()` are in the runtime entry point.
      - The mock backend allows the four on its items, duplicates items, and answers dry runs of the built-in `delete`. It reads abilities as clients do: a missing ability doesn't allow an action, in dry runs, in `delete` (skipped items are reported, and the only item of an item action is a `403`) and in `duplicate` (`403`). Its example definition shows `itemActions` and `open`.
      - The conformance kit checks that the built-in `delete` answers a dry run without being declared (`action.delete`) and, with `writes`, the duplication of an item that allows it, with the `ETag` of the copy (`duplicate`).
  - `@panneau/core`: `getItemActions(resource, item, surface)` decides the actions of an item on each surface, `row`, `menu`, `panel` and `form`, each with its link or to run: the built-in item actions (from `itemActions`, replaced by declared ones with their ids), then the declared actions, by their placement and the item's abilities, without the one that leads to the surface (no `show` in the panel, no `edit` in the form). `form` is the header of the item, in its panel and its form, so an item shows the same actions in its row, its panel and its form. `selectItemActions()` does the same with actions already placed, and `fillActionUrl()` fills a URL template. `getResourceActions()` gives the actions of a resource with its built-in item actions (and without `show` when items open in their form): `show` and `edit` in rows and headers, `duplicate` and `delete` in the menu of rows and headers, `delete` on selections too, so lists are selectable. `isActionAllowedOn()` checks the abilities of the built-in item actions, also on an item without abilities, which shows none of them: a declared `show` or `edit` is now hidden on an item without `view: true` or `update: true`. `getOpenMode()` reads `open`.
  - `@panneau/intl`: `getActionLabel()` labels an action, and the built-in item actions in the locale: "View", "Edit", "Duplicate", "Delete" ("Voir", "Modifier", "Dupliquer", "Supprimer").
  - `@panneau/lists`: rows and their menu show the actions of `selectItemActions()`. `ListView` takes `getLinkHref`, which resolves the built-in links and the links with a `route`, and leaves out the built-in links it can't resolve. `isAllowedOn()` follows the abilities of the built-in item actions.
  - `@panneau/data`: `duplicate()` on the data adapter (optional), in the REST adapter, and `useDuplicateItem()`.
  - `@panneau/actions`: results and runs label actions with `getActionLabel()`.
  - `@panneau/app`: rows, their menu, the panel and the edit form show the actions of `getItemActions()`, and the panel and the form with the same component: "Edit", "Duplicate", "Delete" and the declared links in the panel, "View", "Duplicate", "Delete" and the declared links in the form. The panel now shows only the actions placed in `form`, as the form does; links with a `route` are links in rows too, and links outside the admin open in a new tab. `duplicate` asks first when a form has unsaved changes, then copies the item and opens the copy in its form; it is left out with an adapter that can't duplicate. Deleting from the panel closes it. The links of the panel's header have the class of the edit page's (`.panneau-pages-action-link`): `.panneau-item-panel-action` is gone. With `"open": "edit"`, titles open the form, and the show route redirects there with its hash, after the `viewAny` check of the list; an item that can't be updated still opens in the panel. While the item loads, the show route shows nothing rather than the list for an instant.

### Patch Changes

- Updated dependencies [810fc90]
- Updated dependencies [2fcd438]
- Updated dependencies [68f5322]
  - @panneau/protocol@5.0.0-alpha.10

## 5.0.0-alpha.9

### Minor Changes

- 30f227f: Lists can be paged with cursors, for lists too large to count (decision 0039).
  
  - `@panneau/protocol`: a list's definition takes `"pagination": "cursor"`. Its pages take `cursor` in the query (`ListQuery.cursor`, `?cursor=…`), and answer `meta: { perPage, nextCursor, previousCursor?, total? }` (`CursorPagination`) instead of page numbers. `meta` of `ListResponse` is now either kind: code that read `meta.total` or `meta.lastPage` checks which with `isCursorPage()` of `@panneau/protocol/runtime`. The mock backend pages such lists with cursors, and the conformance kit accepts them.
  - `@panneau/core`: the list state of a list paged with cursors has no `page`. `nextPage(cursor)` and `previousPage(previousCursor?)` move through its pages, back through the cursors it followed when the backend gives no `previousCursor`. Another sort, filter, search or page size starts over.
  - `@panneau/lists`: `ListView` takes `cursors` (`{ next, previous? }`) and shows the previous and next pages without page numbers (`CursorPagination`). `getPagingProps(meta)` gives a `ListView` its `total` or its `cursors` from the `meta` of a page.
  - `@panneau/media` and `@panneau/app` follow the cursors of the lists and media libraries paged with them.

### Patch Changes

- Updated dependencies [30f227f]
- Updated dependencies [2a6cf2a]
- Updated dependencies [ca1aa46]
  - @panneau/protocol@5.0.0-alpha.9

## 5.0.0-alpha.8

### Patch Changes

- 83c82d4: The declaration files work in TypeScript projects on `"module": "NodeNext"`. Their relative specifiers now name their file (`./schemas/index.js`, `./rest.js`), so the types that an entry point re-exports, such as `Definition` of `@panneau/protocol`, are no longer missing under Node's resolution, and the CSS Modules that some declarations imported are declared in place. Nothing changes for projects on the `Bundler` resolution.
- Updated dependencies [83c82d4]
- Updated dependencies [477d974]
  - @panneau/protocol@5.0.0-alpha.8

## 5.0.0-alpha.7

### Patch Changes

- Updated dependencies [060e0de]
  - @panneau/protocol@5.0.0-alpha.7

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

### Patch Changes

- Updated dependencies [75a6496]
- Updated dependencies [48676ff]
- Updated dependencies [75a6496]
  - @panneau/protocol@5.0.0-alpha.6

## 5.0.0-alpha.5

### Minor Changes

- 3830b4f: Navigating the app shell no longer loses unsaved changes, and announces each page:
  
  - **`@panneau/core`:** `createLeaveGuards()`, `LeaveGuardsProvider` and `useLeaveGuard()` let a router ask the forms below it before leaving a page.
  - **`@panneau/forms`:** under a `LeaveGuardsProvider`, a form with unsaved changes (`guardUnsavedChanges`, on by default) asks in a dialog before the router leaves its page, not only before the page closes or reloads.
  - **`@panneau/app`:**
      - links, "Go to…" and actions ask before leaving a form with unsaved changes, and so do the browser's back and forward buttons;
      - the tab is named after the page (`Ten walks for the fall · Articles · Northwind Journal`);
      - when the route changes, focus moves to the title of the new page and the page scrolls to the top. Opening the panel of an item focuses the panel, and closing it gives focus back to the item's link.
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
- 6d1f1d8: Previews of items, in the panel of the show route ([decisions 0009 and 0028](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0028-item-panel.md)):
  
  - `@panneau/core`: plugins register preview components by name in `previews`, for resources whose `features.preview` is `{ "mode": "component", "component": "<name>" }`. They get `PreviewProps`: the item, its resource and the locale, to render the page as the site shows it, blocks, partials or charts.
  - `@panneau/data`: `previewItem()`, optional on adapters and implemented by the REST adapter, posts values to `POST /resources/{resource}/{id}/preview` and returns the short-lived URL of the item's page. `useItemPreview()`, `itemPreviewQueryOptions()` and `queryKeys.itemPreview()` fetch it.
  - `@panneau/protocol`: the mock backend answers the preview route, with a `data:` page of the item's values, or the URL of its `previewUrl` option.
  - `@panneau/app`: the panel of an item opens on a Preview tab, before its Details, when its resource has a preview, and remembers the tab. A button widens the panel, for previews (`--panneau-item-panel-width-wide`, half of the page by default).
  - `@panneau/intl`: the messages of previews, in English and French.

### Patch Changes

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
- Updated dependencies [88a3d09]
- Updated dependencies [b86f35e]
- Updated dependencies [81ec6b2]
- Updated dependencies [6d1f1d8]
- Updated dependencies [8372b27]
- Updated dependencies [5779047]
- Updated dependencies [5b2f3ce]
  - @panneau/protocol@5.0.0-alpha.5

## 5.0.0-alpha.4

### Patch Changes

- Updated dependencies [b9852a0]
- Updated dependencies [ecc77a6]
- Updated dependencies [db1f253]
  - @panneau/protocol@5.0.0-alpha.4

## 5.0.0-alpha.3

### Patch Changes

- Updated dependencies [3af252d]
- Updated dependencies [5a2ae0c]
  - @panneau/protocol@5.0.0-alpha.3

## 5.0.0-alpha.2

### Minor Changes

- d5cd252: Typed, composable themes (decision 0024, step 3). `@panneau/ui` adds `defineTheme()`, which type-checks token names, builds on other themes with `extends` and reports unknown tokens, a `palette` for themes (`--panneau-palette-<name>`), `mergeThemes()`, `findUnknownTokens()`, `SEMANTIC_TOKENS` and `PanneauTokens` for a project's own tokens. `@panneau/protocol` adds the `Theme` schema, `theme.schema.json` and `mergeThemes()`, and `definition.theme` now carries a theme that extends themes of plugins by id. The `Theme` of `@panneau/core` plugins is now that of the protocol, and `resolveTheme()` merges the theme of a definition.

### Patch Changes

- Updated dependencies [5af1673]
- Updated dependencies [d5cd252]
- Updated dependencies [27a1e08]
  - @panneau/protocol@5.0.0-alpha.2

## 5.0.0-alpha.1

### Major Changes

- b1d02aa: Add `@panneau/core`: the plugin registry (`definePlugin`, `PanneauProvider`), the definition engine (`resolveForm`, `resolveList`, abilities), form state behind a `FormStore` (dot-path values, dirty tracking, portable-rule validation, server errors, visibility, submit with version conflicts), list state (query, selection, URL sync through a `Router`) and their React hooks (`useForm`, `useFormField`, `useList`, `usePlugins`, `useResource`).

### Minor Changes

- dfb0b1f: Add pure selectors of a form state to `@panneau/core`: `selectValue(state, path)`, `selectErrors(state, path, { nested })`, `selectErrorCount(state, paths)` and `selectVisible(state, target, parentPath)`. Components read the state they subscribed to with them. The form's reading methods (`getValue()`, `getErrors()`, `countErrors()`, `isVisible()`) are now documented as non-React APIs: the React Compiler memoizes their calls by their arguments, so they return stale results in components. `@panneau/forms` uses the selectors of `@panneau/core` instead of its own.

### Patch Changes

- 2565d67: Add `@panneau/protocol/runtime`: the constants of the protocol and the helpers that run in the browser (`checkValues()`, `checkRules()`, `evaluateCondition()`, `lintDefinition()`, `getValue()`, `isFilled()`, `isProblem()`, `toSearchParams()`, `fromSearchParams()`), without loading zod. The main entry point still exports everything. `isProblem()` no longer uses the `Problem` schema, and accepts the same values. `@panneau/core` and `@panneau/fields` import the helpers from there, so zod (about 360 KB of source) is no longer in the bundles of products that use the forms and lists.
- b3c9d6c: Range filters (`date-range`) send their bounds as their own keys: `filter[published_at][from]=2026-01-01&filter[published_at][to]=2026-01-31`, both inclusive, with an open end left out. `FilterValue` can be a `FilterRange` (`{ from?, to? }`), which `toSearchParams()` and `fromSearchParams()` read and write, and the protocol adds `isFilterRange()` and `matchesFilterRange()`, the reference of how a backend reads the bounds. The mock backend filters by ranges, and the conformance kit checks that a backend reads the bounds of a resource's `date-range` filter. `@panneau/lists` sends a date range as a `FilterRange` instead of `[from, to]` with an empty string for an open end, and filters items in memory by ranges. `@panneau/core` drops an empty range from the query.
- Updated dependencies [345e06c]
- Updated dependencies [632b700]
- Updated dependencies [83999da]
- Updated dependencies [2401025]
- Updated dependencies [2565d67]
- Updated dependencies [61da236]
- Updated dependencies [b3c9d6c]
- Updated dependencies [aa02ea8]
  - @panneau/protocol@5.0.0-alpha.1
