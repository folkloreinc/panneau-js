# @panneau/lists

## 5.0.0-alpha.47

### Patch Changes

- 35b9955: Fields, columns, filters and pages without a `label` show their key made readable instead of the key as written: `published_at` reads "Published at", `author_id` reads "Author", `seo.title` reads "Seo title". The same fallback names fields, list columns, filters and their chips, sort options, the columns menu, the details of an item, the error summary and the conflict dialog of a form, inline editing, the filters of the media picker, and the pages in the navigation and the "Go to…" palette. A label given by the definition is shown as given, an empty one included. `@panneau/protocol/runtime` exports the fallback: `humanizeKey()`, `labelOrKey()` and `getFieldLabel()`.
- a55f51b: Confirmations and toasts of actions name the item or the resource (decision 0062). The confirmation of the built-in `delete` names what it deletes in its title: "Delete “Spring contest”?", "Delete 3 articles?"; the confirmation of another action says it in its message: "“Archive” will apply to 3 articles.". `ConfirmDialog` takes `itemLabel` (the title of the item) and `labels` (the resource's singular and plural), and `ListView` takes `resourceLabel` for its confirmations: the app passes them, by the `itemTitle` and `label` of the resource. An action that fails from the header of an item names it: "“Archive” failed for “Spring contest”.". The mock backend's delete writes the message we want backends to write: "“Spring contest” deleted.", "Page deleted.", "3 pages deleted.", in place of "1 deleted.". New messages in `@panneau/intl`, in English and French: `confirmDeleteTitle` and `confirmMessageFor` of `listsMessages`. `ConfirmDialog` loads its dialog with `import()` when a confirmation first opens, out of the JavaScript of the first page.
- ecf96f3: The calendar of a list says when a month has no items ("No items in November 2026"), in an empty state where its grid would be, with its buttons to the other months above it, rather than a grid of empty days; it doesn't say so while the items of the month load. Each item shows its state next to its title, as a dot in the tone of its option, the tone of its badge in the table and the cards, with the state's label for screen readers, and its whole title on hover. `ListView` takes `itemStatus`, the field that holds the state of items (`itemStatus` of the resource, decision 0103), which the app passes; layouts get `getItemStatus()`, and `ListCalendarProps` has `isLoading`. The built-in calendar layout loads with `import()` when a list shows it, with a skeleton of its grid meanwhile.
- 1c63342: Items open from the cache when their link in a list was hovered or focused: the form or the panel shows without its skeleton. Resting the pointer on the link of an item for 100 ms, or focusing it, prefetches the item, unless it is still fresh; a pointer crossing rows and the hover of touch fetch nothing. New: `usePrefetchItem()` in `@panneau/data/query`, and the `onItemIntent` prop of `ListView` and of list layouts in `@panneau/lists`, which lists without a data layer can leave out.
- f8c5d4f: Lists keep their header and their selection in view, open an item from anywhere on its row, and offer to create the first item (#443). `@panneau/lists`: the header of the table and the selection bar, with its actions, stick under the top of the window while the list scrolls, in every density; a table wider than the list scrolls in its own box, as high as the window, where its header sticks. A click on a row, a card or a tile outside its controls (checkbox, actions, cells edited in place, links) follows the link of its title, so ⌘-click, Ctrl-click and a middle click open it in a new tab; the title stays the only link and tab stop of the row, and text in a row can still be selected. In select mode, a click on a row selects its item. `ListView` takes `emptyAction`, a node or `{ label, href }`, shown in a list without items, filters or search. A selected row of the table reads darker than a hovered one, which still shows over it (#405). `@panneau/ui`: `--panneau-frame-top`, a semantic token (`0px`), the space the frame of the app takes at the top of the window, under which what sticks to the top stays. `@panneau/app`: the top bar of a small screen sets it, and an empty list of a resource the user can create in shows "New …", with the menu of its types.
- d256517: List filters say which are active, keep the secondary ones in "More filters", and fit a phone. A filter control with a value is marked, in the tones of what is selected (`--panneau-selected-*`), with a button that clears it. A filter of the definition shows first in the toolbar with `"primary": true`; the others are behind a "More filters" button, with the count of those that are active, and without any `primary`, the first 3 show first. A filter with a value keeps its chip under the toolbar. In a narrow list (a phone), every filter is behind one "Filters" button with the count of the active ones, which opens them in a sheet, next to the search. The page sizes of a list are a setting of the resource: `perPageOptions` of its list, 10, 20, 50 and 100 by default, which `resolveList()` of `@panneau/core` now gives (`DEFAULT_PER_PAGE_OPTIONS`) and the app offers. A page size the browser remembers for a list that it no longer offers falls back to the list's `perPage`.
- 52083a1: The details of an item show its values in full, as list cells don't. Displays get a `variant` (`DisplayVariant`): `cell` in lists, where nothing changes, and `details` in `ItemDetails`, which plugins' displays get too. In details, related items are a list linked to their items, through the `getItemHref()` of the relation source of the fields (the app gives it), with their image, their description and the labels of plain ids; every media shows, not the first one; rich text keeps its formatting, sanitized by DOMPurify (a new dependency of `@panneau/lists`, loaded with the first rich text shown in details, and plain text until then: HTML only, without scripts, event handlers, `style` and `class` attributes, `<style>` blocks or form controls, links to `http`, `https`, `mailto`, `tel` and relative URLs only, and `rel="noopener noreferrer"` on those that open a new tab); text keeps its line breaks and JSON is indented, without the two-line clamp of a cell; and a localized value shows each of its locales under its name, the interface's locale first.
- 9a26df5: Edits in place show at once (decision 0105). A cell of a list shows the value it saves right away and stays usable: a value picked while it saves is saved after it, with the version the first save got, and a failed save puts the value back and says why. `useUpdateItem(resource, { optimistic: true })` writes the values at once in the cached item and in every cached list that holds it, sends the edits of an item one after the other without a stale `If-Match`, and puts back only the edit that failed. The list of a resource in the app uses it; the form's save is unchanged.
- Updated dependencies [2aab034]
- Updated dependencies [79abfd4]
- Updated dependencies [ff56beb]
- Updated dependencies [35b9955]
- Updated dependencies [a55f51b]
- Updated dependencies [ecf96f3]
- Updated dependencies [09cca06]
- Updated dependencies [9e90547]
- Updated dependencies [060c1e9]
- Updated dependencies [b754dda]
- Updated dependencies [3eb376c]
- Updated dependencies [7e99405]
- Updated dependencies [8ad5274]
- Updated dependencies [55eced0]
- Updated dependencies [f8c5d4f]
- Updated dependencies [d256517]
- Updated dependencies [4686a26]
- Updated dependencies [1350d30]
  - @panneau/intl@5.0.0-alpha.47
  - @panneau/fields@5.0.0-alpha.47
  - @panneau/ui@5.0.0-alpha.47
  - @panneau/protocol@5.0.0-alpha.47
  - @panneau/core@5.0.0-alpha.47

## 5.0.0-alpha.46

### Patch Changes

- 0e4d88a: Search the related resource in the `relation` filters of resource lists: the app now gives a relation source to the fields context of every page (lists and their filters, item panels, forms), not just to forms.
- f4f816c: Keep the thumb of a checked `Switch` inside its track in right-to-left text, and read `prefers-reduced-motion` with `prefersReducedMotion()` in `ListView`.
- Updated dependencies [f4f816c]
- Updated dependencies [b146a56]
  - @panneau/ui@5.0.0-alpha.46
  - @panneau/fields@5.0.0-alpha.46
  - @panneau/core@5.0.0-alpha.46
  - @panneau/intl@5.0.0-alpha.46
  - @panneau/protocol@5.0.0-alpha.46

## 5.0.0-alpha.45

### Minor Changes

- e0865af: Focus and announcements in lists (decision 0095). `@panneau/lists`: the focus that was in an item that leaves a list goes to the same control of the next item, or of the previous one, or to the list (a group named like it) when it is left empty; an item that leaves goes when its fade ends (`animationend`), with a timer only when the animation doesn't end, instead of a copy of `--panneau-duration-slow`. The built-in layouts give each item's element `data-item-id`. `ConfirmDialog` opens on "Cancel" for a destructive action, and its confirming button is pending, not disabled, while the dry run counts, so it keeps the focus. `ListView` has one polite status message of its results, said after a new search, filter or page: how many items, or that none match. `@panneau/intl`: the messages `resultsCount` and `resultsOnPage` of lists, in English and in French.
- 62b099c: `ListView` and `List` group their props by what they are about, before the API freezes in 5.0:
  
  - `actions={{ available, onRun, preview, icons, primary }}` takes the place of `actions`, `onAction`, `previewAction`, `actionIcons` and `primaryAction`;
  - `inline={{ fields, onEdit, formatError }}` takes the place of `inlineEdit`, `onInlineEdit` and `formatError`;
  - `layouts={{ available, current, onChange, components }}` takes the place of `layouts`, `layout`, `onLayoutChange` and `layoutComponents`.
  
  To migrate, run `npx @panneau/codemods@alpha list-view-props resources/js` (`--dry` first). It rewrites the props of `ListView` and `List`, and reports the props spread on them: spreading what `resolveList()` gives (`{...resolved}`) no longer fits, since its `actions`, `layouts` and `inlineEdit` go in the objects. Give its `columns`, `filters`, `search`, `selectable`, `calendar` and `perPageOptions` as props, and the rest in the objects. The types of the objects are exported: `ListViewActions`, `ListViewInline` and `ListViewLayouts`, with `ListInlineEditHandler` and `ListInlineEditEvent`.
- 9dc08d7: Lists ask for the fields they show, and relation fields resolve their ids in one request. `@panneau/lists`: `useListFields()` gives the fields that a `ListView` shows of its items (its columns shown, the title and the image of items, the field of the calendar), and `getListFields()` computes them, for the `fields` of the list query; `undefined` with a column that has `render` or a layout that isn't built in. `@panneau/app`: the list of a resource sends them. `@panneau/fields`: `createRelationSource().resolve()` asks for the ids of every field of a form in one list query on `filter[ids]` (by groups of 100), instead of a `get()` per id, keeps the items in its new `items` option (the item queries of the query client, in the app), and has a new `peek()`, the reference of an item it already has; `useRelationReferences()` no longer keeps a cache of its own, and `RelationListAdapter` no longer has `get()`. `@panneau/data`: lists and items stay fresh for 30 seconds, until a mutation invalidates them. `@panneau/protocol`: `MAX_PER_PAGE` (100), the most items a page has: `perPage`, `perPageOptions` and `calendar.perPage` of a list are at most 100, the mock backend caps `perPage` there and gives the fields of `fields` only, and the conformance checks both (`list.per-page`, `list.fields`, where a backend can also give the values of `itemTitle` and `itemImage`).
- 3117891: Panneau's messages load on first use, in the language the app shows (#346): a minimal app goes from 1600 KB to 1544 KB minified (499 KB to 485 KB gzip). `@panneau/intl`: `loadPanneauMessages(locale)` loads the messages of every package for a locale with an `import()` the first time, and `getLoadedPanneauMessages(locale)` returns them once loaded. `@panneau/ui`: `PanneauRoot` loads them, and renders in English until then, without the English catalog. `@panneau/app`: the app waits for them with the messages of the plugins. `@panneau/fields` and `@panneau/lists`: `locales.fr` of `fieldsPlugin` and `listsPlugin` is a loader. The thumbnails of the embed display, the embed field and the media field load when scrolled to (`loading="lazy"`).
- db712f6: One way to resolve plugin entries (decision 0097).
  
  **Breaking: the ids of the built-in plugins.** `panneau-fields`, `panneau-lists`, `panneau-media` and `panneau-editor` are now `panneau.fields`, `panneau.lists`, `panneau.media` and `panneau.editor`, without aliases. A plugin id is `{vendor}.{name}`. Nothing reads an id but the check that ids are unique, so this only breaks a project that relies on those strings.
  
  **Breaking for types: the props of the definition are unchecked.** The components and panels of form layouts, and pages, get the `props` of the definition as `WithDefinitionProps<…>`. A component that required one of them (`({ label }: { label: string })`) no longer type-checks: declare them optional, beside the props of its kind (`LayoutComponentProps & { label?: string }`).
  
  `@panneau/core`: `PluginKinds` types the entries of each kind, and packages add theirs by declaration merging. `PanneauPlugin` and `PluginRegistry` derive from it, and `definePlugin()` keeps the type of the plugin. `resolveEntry()`, `getEntries()`, `useEntry()` and `useEntries()` read every kind in one order: built-ins, plugins, then the overrides of the component that renders them, with a warning in development when nothing gives an entry (`warnMissingEntry()`). `PageProps` (the id of a page, the definition, the base path and the params) joins `WidgetProps`, which gets the `currency` and the `period` of built-in widgets. `PluginComponent` and `PluginComponentKind` are deprecated.
  
  `@panneau/forms` declares `fields`, `components` and `panels`; `@panneau/lists` `fields`, `displays`, `listLayouts` and the new `filters`, the filter controls of plugins by filter type; `@panneau/actions` `actions`. `@panneau/app`: a plugin can replace a built-in widget type (`stat`), whose data is still checked against the protocol, and the built-in `dashboard` page. `docs/extending.md` describes every kind.
- 44ba63b: One copy of the shared helpers. A protocol-relative link (`//example.com`) opens in a new tab from a row and from the header of an item, as it does from the editor: every package decides with `isExternalUrl()` of `@panneau/protocol/runtime`. `@panneau/lists`: `ActionButton` is public, and takes `inHeader` (the color of the action, outlined, with the icon of an external link), which the actions of an item in `@panneau/app` now use. `getActionHref()` is no longer public: use `fillActionUrl()` of `@panneau/core`. `@panneau/ui`: `cx()` is public, the one `cx` of every package. `@panneau/core`: `ruleMessages` holds the English messages of the rules by the keys of `@panneau/intl` (`panneau.forms.rule.<key>`), `crop` included, and `formatRuleFailure()` uses them: numbers are formatted (`1,200`) and lists take a serial comma (`YouTube, Vimeo, or Spotify`). `@panneau/media`: the picker's own `formatDuration` is now `formatPlaybackTime`, apart from `formatDuration()` of `@panneau/fields/duration`.

### Patch Changes

- 9e17345: Primitives and tokens used everywhere (#353). `@panneau/ui`: `--panneau-focus-offset`, the gap between an element and its focus ring, which every ring reads; rings outside inputs are outlines, which stay visible in forced colors. `--panneau-frame-bottom` is a semantic token (`0px`), which the dock and the region of toasts set, in place of `--panneau-bottom-offset`: a project that set `--panneau-bottom-offset` sets `--panneau-frame-bottom`. `SegmentedControl` takes `hideLabels`, `Disclosure` takes `headerEnd`, and `prefersReducedMotion()` reads the system's preference. Chevrons that show and hide content point to the end and turn down once it is shown, also in the panels of `Aside`. `@panneau/media`: the empty states of the picker are `EmptyState`s, and the cards of the picker and the stage of the image editor have component tokens (`mediaPickerTokens`, `imageEditorTokens`). `@panneau/lists`: the switch of layouts is a `SegmentedControl`. `@panneau/app`: the runs of `ActionRunsButton` show a `Spinner` and a `Badge`, the summary above a list is a `Disclosure`, and the groups of the sidebar follow the chevrons of `Disclosure`. `@panneau/editor`: paragraphs of the rich text field have the gap of `Prose`.
- f8ae53c: The deprecated APIs are removed before the first beta, so that 5.0.0 ships without them. To migrate a project that started on an alpha:
  
  - **Buttons:** `variant="primary"`, `secondary`, `ghost` and `danger` of `Button`, `LinkButton` and `IconButton` are gone, with the `ButtonVariant` type. Run `npx @panneau/codemods@alpha button-variants resources/js` (`--dry` first): it gives each button the `tone` and the `appearance` the alias stood for (`primary` is `tone="accent"`, `ghost` is `appearance="ghost"`, `danger` is `tone="danger"`, `secondary` is the default), and reports what it can't read, such as a `variant` in an object of props. `variant` now only names a variant of the theme.
  - **Tones:** `AlertTone`, `BadgeTone` and `ToastTone` of `@panneau/ui` are gone: use `Tone`.
  - **Messages:** `@panneau/fields/locales`, `@panneau/forms/locales` and `@panneau/ui/locales` are gone: use `en`, `fr` or `withPanneauMessages()` of `@panneau/intl`, which hold the messages of every package.
  - **Pages:** `LinkButton` of `@panneau/app` is gone: use `LinkButton` of `@panneau/ui`, with `tone="accent"` and an icon component (`icon={Plus}`). `back` of `PageHeader` is gone: use `parents={[back]}`.
  
  `@panneau/codemods` has the `button-variants` codemod (`panneau-codemods button-variants <paths>`, or `runCodemods({ codemod: 'button-variants' })`). Inside the packages, every button takes a `tone` and an `appearance`, and a lint rule forbids the aliases.
- 323fdeb: Less JavaScript to load before the first page (#346): a minimal app goes from 2082 KB to 1600 KB minified (609 KB to 499 KB gzip). `@panneau/app`: the auth pages and the account page load on first use, with the skeleton of their shape until then, and the README's setup adds `@react-aria/optimize-locales-plugin` to the Vite config, to keep React Aria's strings to the app's languages. `@panneau/fields`: the entries of `builtInFields` with heavy code (`tel` and the metadata of phone numbers, `location`, `address`, `link`, `embed`, `file`, `country`, `region`, `color`, `json`, `daterange`, `duration`, `money`) load on first use, with the skeleton of the field until then; `lazyFieldEntry()` does the same for the types of plugins. `@panneau/lists`: the `tel` display loads with the first number shown, which shows as it is until then.
- Updated dependencies [0bbbeea]
- Updated dependencies [b4d79ec]
- Updated dependencies [ecfec65]
- Updated dependencies [1e60706]
- Updated dependencies [e0865af]
- Updated dependencies [9dc08d7]
- Updated dependencies [3117891]
- Updated dependencies [db712f6]
- Updated dependencies [5fcdf58]
- Updated dependencies [9e17345]
- Updated dependencies [003b237]
- Updated dependencies [f8ae53c]
- Updated dependencies [44ba63b]
- Updated dependencies [323fdeb]
- Updated dependencies [0f82abf]
  - @panneau/protocol@5.0.0-alpha.45
  - @panneau/ui@5.0.0-alpha.45
  - @panneau/core@5.0.0-alpha.45
  - @panneau/intl@5.0.0-alpha.45
  - @panneau/fields@5.0.0-alpha.45

## 5.0.0-alpha.44

### Minor Changes

- 333cb75: Empty states, avatars, tiles, button groups and breadcrumbs (decision 0092). `@panneau/ui` exports `EmptyState` (an icon, a title, a description and actions, in two sizes), `Avatar` and `AvatarGroup` (a picture, or initials on a tint of a chart color picked from the name, with a ring in a tone and a status in words for a state of the person), `Tile` and `TileGroup` (a media, a title, a description and actions, and the whole tile a link with `href`), `ButtonGroup` (attached buttons, and split buttons with a `MenuTrigger`) and `Breadcrumbs` (with the middle crumbs folded into a menu by `maxItems`), with their component tokens. `TextArea` takes a `header` and a `footer`, drawn inside its box. `@panneau/intl` has their messages, in English and French. Empty lists and lists without a match, and widgets of the dashboard without data, show an `EmptyState`; the user's menu shows the user's initials in the color of their name.

### Patch Changes

- Updated dependencies [333cb75]
- Updated dependencies [70ac183]
- Updated dependencies [07c2ed8]
  - @panneau/ui@5.0.0-alpha.44
  - @panneau/intl@5.0.0-alpha.44
  - @panneau/fields@5.0.0-alpha.44
  - @panneau/protocol@5.0.0-alpha.44
  - @panneau/core@5.0.0-alpha.44

## 5.0.0-alpha.43

### Minor Changes

- 2136caf: Actions in their tones (decision 0091). An action can declare a `tone`, a tone of the theme, which colors its icon in rows and outlines its button in the header of an item (its form and its panel). Without one, the built-in actions keep their colors (`show` `info`, `edit` `accent`, `restore` `success`), a `link` whose URL leaves the admin, such as the page of an item on the site, is `info`, and the others stay `neutral`; an action that destroys is always `danger`. In the header of an item, an action with a tone is outlined in it, without a fill, and the neutral ones stay secondary buttons. `getActionTone()` is exported by `@panneau/lists`. The toolbar and the selection don't change.

### Patch Changes

- Updated dependencies [2136caf]
  - @panneau/protocol@5.0.0-alpha.43
  - @panneau/core@5.0.0-alpha.43
  - @panneau/fields@5.0.0-alpha.43
  - @panneau/ui@5.0.0-alpha.43
  - @panneau/intl@5.0.0-alpha.43

## 5.0.0-alpha.42

### Patch Changes

- Updated dependencies [019247e]
- Updated dependencies [66a1a2a]
  - @panneau/ui@5.0.0-alpha.42
  - @panneau/fields@5.0.0-alpha.42
  - @panneau/intl@5.0.0-alpha.42
  - @panneau/core@5.0.0-alpha.42
  - @panneau/protocol@5.0.0-alpha.42

## 5.0.0-alpha.41

### Patch Changes

- a6e6843: Actions that destroy come last, outlined (decision 0088, amended). In the header of an item, its edit form and its panel, "Delete" (and every action with `destructive: true`) is no longer in a "More actions" menu: it is a button again, after the links and the other actions, outlined in the danger color without a fill. It keeps its confirmation and "Undo". In rows, "Delete" is the last icon of the row again, as before 5.0.0-alpha.39, and goes to the row's menu only when the icons don't fit.
- @panneau/core@5.0.0-alpha.41
  - @panneau/fields@5.0.0-alpha.41
  - @panneau/intl@5.0.0-alpha.41
  - @panneau/protocol@5.0.0-alpha.41
  - @panneau/ui@5.0.0-alpha.41

## 5.0.0-alpha.40

### Patch Changes

- Updated dependencies [0511341]
  - @panneau/protocol@5.0.0-alpha.40
  - @panneau/ui@5.0.0-alpha.40
  - @panneau/intl@5.0.0-alpha.40
  - @panneau/core@5.0.0-alpha.40
  - @panneau/fields@5.0.0-alpha.40

## 5.0.0-alpha.39

### Minor Changes

- ab10f01: Destructive actions in a menu (decision 0088). In the header of an item, its edit form and its panel, actions that destroy (`destructive: true`, as the built-in `delete`) are no longer solid danger buttons before the others: they are in a "More actions" menu (`…`), after the other actions, which are all secondary buttons. In rows, they are always in the row's menu, at every width, even alone in it; a row that doesn't have them keeps the place of the menu. In both menus, they keep their icon and the danger color, their confirmation and "Undo". The bulk actions of a selection don't change.

### Patch Changes

- @panneau/core@5.0.0-alpha.39
  - @panneau/fields@5.0.0-alpha.39
  - @panneau/intl@5.0.0-alpha.39
  - @panneau/protocol@5.0.0-alpha.39
  - @panneau/ui@5.0.0-alpha.39

## 5.0.0-alpha.38

### Patch Changes

- Updated dependencies [6c3dd8d]
  - @panneau/protocol@5.0.0-alpha.38
  - @panneau/core@5.0.0-alpha.38
  - @panneau/fields@5.0.0-alpha.38
  - @panneau/ui@5.0.0-alpha.38
  - @panneau/intl@5.0.0-alpha.38

## 5.0.0-alpha.37

### Patch Changes

- Updated dependencies [0d49d7d]
- Updated dependencies [757b4fb]
- Updated dependencies [ddb93fe]
- Updated dependencies [94074cc]
- Updated dependencies [7d7408d]
- Updated dependencies [a339007]
  - @panneau/protocol@5.0.0-alpha.37
  - @panneau/intl@5.0.0-alpha.37
  - @panneau/ui@5.0.0-alpha.37
  - @panneau/core@5.0.0-alpha.37
  - @panneau/fields@5.0.0-alpha.37

## 5.0.0-alpha.36

### Patch Changes

- Updated dependencies [c2b7df7]
- Updated dependencies [6441b21]
  - @panneau/protocol@5.0.0-alpha.36
  - @panneau/intl@5.0.0-alpha.36
  - @panneau/core@5.0.0-alpha.36
  - @panneau/fields@5.0.0-alpha.36
  - @panneau/ui@5.0.0-alpha.36

## 5.0.0-alpha.35

### Minor Changes

- 1ecdaa8: Add the motion tokens `--panneau-duration-slow`, `--panneau-ease-out` and `--panneau-ease-in`, used by every component in place of easings written by hand. An item that leaves a list (deleted, or out of its filters) now fades out at its place before it goes, in the table, the cards and the gallery (`isLeaving` in the props of a layout).

### Patch Changes

- Updated dependencies [60b8651]
- Updated dependencies [1ecdaa8]
  - @panneau/ui@5.0.0-alpha.35
  - @panneau/fields@5.0.0-alpha.35
  - @panneau/core@5.0.0-alpha.35
  - @panneau/intl@5.0.0-alpha.35
  - @panneau/protocol@5.0.0-alpha.35

## 5.0.0-alpha.34

### Patch Changes

- @panneau/core@5.0.0-alpha.34
  - @panneau/fields@5.0.0-alpha.34
  - @panneau/intl@5.0.0-alpha.34
  - @panneau/protocol@5.0.0-alpha.34
  - @panneau/ui@5.0.0-alpha.34

## 5.0.0-alpha.33

### Patch Changes

- Updated dependencies [16fd93b]
  - @panneau/protocol@5.0.0-alpha.33
  - @panneau/core@5.0.0-alpha.33
  - @panneau/fields@5.0.0-alpha.33
  - @panneau/ui@5.0.0-alpha.33
  - @panneau/intl@5.0.0-alpha.33

## 5.0.0-alpha.32

### Patch Changes

- Updated dependencies [5de54d2]
  - @panneau/protocol@5.0.0-alpha.32
  - @panneau/core@5.0.0-alpha.32
  - @panneau/fields@5.0.0-alpha.32
  - @panneau/ui@5.0.0-alpha.32
  - @panneau/intl@5.0.0-alpha.32

## 5.0.0-alpha.31

### Patch Changes

- Updated dependencies [3044946]
  - @panneau/ui@5.0.0-alpha.31
  - @panneau/fields@5.0.0-alpha.31
  - @panneau/core@5.0.0-alpha.31
  - @panneau/intl@5.0.0-alpha.31
  - @panneau/protocol@5.0.0-alpha.31

## 5.0.0-alpha.30

### Patch Changes

- Updated dependencies [8d18be8]
  - @panneau/ui@5.0.0-alpha.30
  - @panneau/fields@5.0.0-alpha.30
  - @panneau/core@5.0.0-alpha.30
  - @panneau/intl@5.0.0-alpha.30
  - @panneau/protocol@5.0.0-alpha.30

## 5.0.0-alpha.29

### Patch Changes

- 179efeb: Themes can set selections apart from the accent, and style focus rings and filled buttons (decision 0073). New component tokens: `--panneau-selected-bg`, `--panneau-selected-text` and `--panneau-selected-subtle`, read by checkboxes, radios, switches, the slider, tabs, calendars, selected rows, cards and media, and the rich text toolbar (they default to the accent, so nothing changes without them); `--panneau-input-border-color-focus`, `--panneau-input-focus-ring` and `--panneau-input-focus-ring-invalid`; `--panneau-button-solid-border-color` and `--panneau-button-pressed-scale`; `--panneau-field-required-color`; `--panneau-switch-track-border-color`; `--panneau-segmented-control-segment-color-hover` and `-segment-bg-hover`, so a hovered segment no longer takes the text color of the selected one. `checkTheme()` checks translucent colors over what is under them, explicit tone values that refer to the palette, and the selection against the surface. The active formats of the rich text toolbar are visible again, and the links of the login page use the link color.
- e3465c2: Touch targets follow the density (decision 0072). A new density token, `--panneau-target-size` (1.5rem, and 2.75rem in the touch density), sets the smallest size of what a pointer or a finger hits: rows of checkboxes, radios and switches, the slider, the remove button of tags, the sidebar's links, sortable table headers and the "back" link of pages. Checkboxes, radios and switches read it instead of their `pointer: coarse` rules, so the `touch` density makes them larger on any device, and touch screens see no change. The rich text toolbar wraps by groups, never leaving one button alone on a line.
- Updated dependencies [b9c9189]
- Updated dependencies [d417492]
- Updated dependencies [51599d6]
- Updated dependencies [44a0ede]
- Updated dependencies [ef36326]
- Updated dependencies [179efeb]
- Updated dependencies [d6800eb]
- Updated dependencies [e3465c2]
  - @panneau/ui@5.0.0-alpha.29
  - @panneau/intl@5.0.0-alpha.29
  - @panneau/protocol@5.0.0-alpha.29
  - @panneau/core@5.0.0-alpha.29
  - @panneau/fields@5.0.0-alpha.29

## 5.0.0-alpha.28

### Patch Changes

- 041732f: Fields can be left out of forms with `notInForm: true` (decision 0071): items still give their value, which lists, details and references read, such as the URL of a page shown under its title. `resolveFields()` and `resolveForm()` drop such a field even when the layout names it, `checkValues()` and inline editing skip it, the mock backend ignores its value on writes, and the conformance kit checks that a backend does too (`update.not-in-form`).
- Updated dependencies [041732f]
  - @panneau/protocol@5.0.0-alpha.28
  - @panneau/core@5.0.0-alpha.28
  - @panneau/fields@5.0.0-alpha.28
  - @panneau/ui@5.0.0-alpha.28
  - @panneau/intl@5.0.0-alpha.28

## 5.0.0-alpha.27

### Patch Changes

- cac1376: The file field shows each file as a card: the thumbnail of an image (or its `thumbnailUrl`, such as the poster of a video), the icon of its type for other files, and its name, type and size. An image just chosen shows before it is saved. Stored files can give a `thumbnailUrl`. The gallery and table thumbnails of lists, and the media picker, show the icon of a file's type (a PDF without a preview), never a broken image. `FileThumbnail`, `getFileKind()` and `kindOfMime()` are exported from `@panneau/fields`.
- Updated dependencies [cac1376]
  - @panneau/fields@5.0.0-alpha.27
  - @panneau/protocol@5.0.0-alpha.27
  - @panneau/core@5.0.0-alpha.27
  - @panneau/ui@5.0.0-alpha.27
  - @panneau/intl@5.0.0-alpha.27

## 5.0.0-alpha.26

### Patch Changes

- 8461e06: Lists show their checkboxes once "Select" is pressed in their toolbar (decision 0070), and hide them with "Done", which clears the selection. Without it, rows have no column of checkboxes before them, and their titles line up with the headers and the filters. A selection shows the checkboxes too, and running a selection action ends it. Shown checkboxes no longer wait for hover.
- e322361: "Show" in the toast of a run opens the list of the items it changed (decision 0069). Every list has a filter on the ids of its items, `filter[ids][]=12`, at most 100 (`IDS_FILTER`, `IDS_FILTER_LIMIT`), which the mock and local lists apply. Lists show it as a chip, "2 items", that removes it. A list's definition can no longer declare a filter with the id `ids`. The conformance kit checks that a backend reads it (`list.filter-ids`). `ActionRunnerProvider` takes `onShowItems(resource, ids)`, which the app gives, and offers "Show" for the items of a selection by ids that the run changed, when the toast has no "Undo", "Details" or "Download".
- Updated dependencies [8461e06]
- Updated dependencies [e322361]
- Updated dependencies [d44397d]
  - @panneau/intl@5.0.0-alpha.26
  - @panneau/protocol@5.0.0-alpha.26
  - @panneau/ui@5.0.0-alpha.26
  - @panneau/fields@5.0.0-alpha.26
  - @panneau/core@5.0.0-alpha.26

## 5.0.0-alpha.25

### Patch Changes

- Updated dependencies [f316d86]
- Updated dependencies [f316d86]
- Updated dependencies [f316d86]
- Updated dependencies [516f777]
- Updated dependencies [f316d86]
- Updated dependencies [f316d86]
- Updated dependencies [f316d86]
  - @panneau/intl@5.0.0-alpha.25
  - @panneau/fields@5.0.0-alpha.25
  - @panneau/protocol@5.0.0-alpha.25
  - @panneau/ui@5.0.0-alpha.25
  - @panneau/core@5.0.0-alpha.25

## 5.0.0-alpha.24

### Patch Changes

- @panneau/core@5.0.0-alpha.24
  - @panneau/fields@5.0.0-alpha.24
  - @panneau/intl@5.0.0-alpha.24
  - @panneau/protocol@5.0.0-alpha.24
  - @panneau/ui@5.0.0-alpha.24

## 5.0.0-alpha.23

### Patch Changes

- c310e38: Lighter lists (decision 0068): in the table, the arrow of a sortable column shows on hover and focus, and always on the sorted column; the checkbox of a row shows on hover and focus, and on every row once one is selected; both always show on touch screens. Headers lose their background, rows get one on hover, and an item without an image shows an empty square instead of an icon. In the gallery, the checkbox of an item moves from its image to its caption, and a selected item has an accent outline.
- Updated dependencies [c310e38]
- Updated dependencies [c310e38]
  - @panneau/fields@5.0.0-alpha.23
  - @panneau/intl@5.0.0-alpha.23
  - @panneau/ui@5.0.0-alpha.23
  - @panneau/core@5.0.0-alpha.23
  - @panneau/protocol@5.0.0-alpha.23

## 5.0.0-alpha.22

### Minor Changes

- d8a77d0: After a create, the list (decision 0066):
  
  - `@panneau/app`: creating an item goes back to the list of its resource, in place of the create page, instead of opening its edit page with a toast. The list highlights the new item and scrolls it into view. Only a list that doesn't show it (its filters, its sort or its page) says it was created, in a toast with "Open".
  - `@panneau/lists`: `ListView` takes `highlightedItemId`: the item gets a subtle background that fades after about 3 seconds (without the fade when the system asks for less motion), is scrolled into view, and is marked `data-highlighted`. Layouts get `isHighlighted(item)`.
  - `@panneau/ui`: toasts rise above a footer that sticks to the bottom (`useToastOffset()`) only while it covers the bottom of the viewport. The footer of a short form, after its last field, no longer sends them up the screen.
  - `@panneau/intl`: "Open", for the toast of a created item, in English and French.
  - `@panneau/protocol`: the mock backend gives a created or duplicated item an id that none of the items it started with has.

### Patch Changes

- d8a77d0: Relation fields show their items as cards (decision 0067): the item's image, or its resource's icon, its label, linked to the item, its description, and buttons to change or remove it. "Change" opens the picker in place of the card, Escape or "Cancel" keeps the item, and the focus stays where the user was. Several items are a list of cards above the picker. `compact` keeps the former look (the item as the text of its picker, several items as chips): list filters use it.
  
  - `@panneau/fields`: `RelationReference` has an optional `description` and `imageUrl`, and `RelationSource` optional `describe(resource)` and `getItemHref(resource, id)`. References without the image or the description that the items of their resource have get them from `resolve()`. `createRelationSource()` fills them from the `itemSubtitle` and `itemImage` of the definition, and takes `getItemHref`. The options of the picker show the image and the description.
  - `@panneau/protocol`: `getImageUrl()` moves from `@panneau/lists` to `@panneau/protocol/runtime`. `@panneau/lists` still exports it.
  - `@panneau/app`: the cards of a form link to their items.
  - `@panneau/intl`: "Change", "Change {item}" and "Cancel" of relation fields, in English and French.
- Updated dependencies [d8a77d0]
- Updated dependencies [d8a77d0]
  - @panneau/ui@5.0.0-alpha.22
  - @panneau/intl@5.0.0-alpha.22
  - @panneau/protocol@5.0.0-alpha.22
  - @panneau/fields@5.0.0-alpha.22
  - @panneau/core@5.0.0-alpha.22

## 5.0.0-alpha.21

### Patch Changes

- Updated dependencies [2a87620]
  - @panneau/ui@5.0.0-alpha.21
  - @panneau/fields@5.0.0-alpha.21
  - @panneau/core@5.0.0-alpha.21
  - @panneau/intl@5.0.0-alpha.21
  - @panneau/protocol@5.0.0-alpha.21

## 5.0.0-alpha.20

### Patch Changes

- @panneau/core@5.0.0-alpha.20
  - @panneau/fields@5.0.0-alpha.20
  - @panneau/intl@5.0.0-alpha.20
  - @panneau/protocol@5.0.0-alpha.20
  - @panneau/ui@5.0.0-alpha.20

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

- 19d0892: The image of items in the table, and in media libraries (decision 0061):
  
  - `@panneau/protocol`: the `itemImage` of a resource of kind `media` defaults to the `media` of its items. `getItemImageField(resource)` gives it, or the resource's `itemImage`.
  - `@panneau/lists`: with `itemImage`, the table starts each title with a square thumbnail of the image of its item, loaded lazily, or a placeholder for an item without one, and its skeleton draws their placeholders. `getImageUrl()` gives the URL of a media only when it is an image or has a thumbnail, and the URL of a file only when it is an image that browsers show: a PDF or a HEIC original has no image. `file` values have a display (`FileDisplay`: the name of each file linked to its URL, after the thumbnail of an image or an icon), `image` values are shown as `media` ones, and `MediaDisplay` reads media references (the thumbnail of their `media`, their `label`).
  - `@panneau/app`: a media library offers its gallery and shows its thumbnails without declaring `itemImage`, and so do its items in "Go to…". The panel of a media shows its image over its details.
- d46a16d: "Undo" instead of a confirmation (decision 0063):
  
  - `@panneau/protocol`: an action declares `undoable: true`, and its result carries `undo`: `{ action, items, params }`, an action of the same resource that undoes the run, the items it changed, and its parameters. `UNDO_LIMIT` (100): above it, the client confirms, and the result has no `undo`. The built-in `restore` undoes the `delete` of a resource with a trash. In the JSON Schema, the OpenAPI spec and `docs/protocol.md`. The mock backend keeps a trash for a resource whose `delete` is undoable, answers its `undo`, and runs `restore`; the conformance kit runs the undo of a result and checks that the item is back (`action.undo`).
  - `@panneau/core`: `asksConfirmation(action, count)`: an undoable action asks first only above the limit, or when it is queued, unless it sets `confirm`. A declared `delete` that is undoable doesn't take the built-in confirmation.
  - `@panneau/actions`: the toast of a result with an `undo` has "Undo", which runs it, refreshes, and says it was undone.
  - `@panneau/lists`: undoable actions run without a confirmation up to the limit; a value changed in place says so in a toast whose "Undo" saves the previous value the same way.
  - `@panneau/app`: the item header runs undoable actions without a confirmation.

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

### Minor Changes

- 2a1f32d: Flags of regions ([decision 0059](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0059-flags-of-regions.md)).
  
  - **The provinces and territories of Canada and the states, district and territories of the United States have their flags**, as countries do: small images from Wikimedia Commons, which load the first time a region of their country shows. The regions of other countries have none.
  - `@panneau/fields`: `RegionField` shows the flag of the selected region and of each option. `@panneau/fields/region` exports `RegionFlag`, `useRegionFlags()`, `loadRegionFlags()`, `getRegionFlag()` and `REGION_FLAG_COUNTRIES`.
  - `@panneau/lists`: the `region` display shows the flag before the name of the region.
  - The flags are data URLs: a Content Security Policy needs `img-src data:`.
- 0cf20b0: Row actions are icons in their colors, as in Panneau 4, the same in every list (decision 0060): `show` blue (`info`), `edit` in the main color, `delete` red, with their labels as names and tooltips. The main action, the one the title opens, keeps its label while the row has room (`primaryAction` of `ListView`; the app sets it from `open`). `duplicate`, `delete` and the actions placed in `menu` are icons too: the `•••` menu only takes the last actions when the icons don't fit (many actions, a narrow list, a phone), and never a single one. The list measures the room it has, chooses the same layout for every row, and keeps the place of the actions a row doesn't have, so they line up. `delete` keeps its confirmation.

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
- cd47332: `duration` values in a declared unit, with days ([decision 0056](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0056-duration-units.md)).
  
  - **`settings.unit`** is the unit of a `duration` value: `seconds` (the default, as before), `minutes`, `hours` or `days`. The value stays a whole number in that unit, and so do the `min` and `max` rules. A day is 24 hours.
  - **`settings.precision`** takes the four units, as the smallest part the input shows. It defaults to the unit, and a precision finer than the unit is raised to it.
  - **`settings.largestUnit`** is the largest part the input shows: `hours` by default (or the precision when it is larger), or `days`. The largest part has no upper bound; hours stop at 23 below days.
  - `DurationField` takes `unit`, `precision` and `largestUnit`. `formatDuration()` and `splitDuration()` take them as options (their former calls work as before), and `formatDuration()` takes the `labels` of the units. New helpers: `resolveDurationUnits()`, `getDurationUnits()`, `isDurationUnit()`.
  - Lists show the days, in the unit and to the precision of the field: `2 d 4 h` (`2 j 4 h` in French).
  - `@panneau/protocol`: `DURATION_UNITS` and the `DurationSettings` schema, which `validateDefinition()` checks.
  - `@panneau/intl`: the messages of days.
  - Definitions without these settings behave as before. No codemod or Rector rule is needed: v4 had no duration field, and sites that keep minutes in a `number` field switch its type to `duration` and set `unit: minutes`, without touching their data.
- 3522797: Phone extensions ([decision 0057](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0057-phone-extensions.md)).
  
  - **`tel` values can have an extension**, after `;ext=` as in a `tel:` URI: `+15145550199;ext=123`. A number without an extension doesn't change.
  - `@panneau/protocol`: the `tel` rule takes `extension: true`, which accepts 1 to 10 digits after `;ext=`; without it, a value with an extension fails. The `tel` type implies `{ rule: 'tel', extension: true }` when `settings.extension` is `true`.
  - `@panneau/fields`: `TelField` takes `extension` (`settings.extension`), an input for the digits of the extension after the number. An extension typed or pasted after the number (`ext. 123`, `x123`, `poste 123`) moves to that input when the field is left. `@panneau/fields/tel` exports `splitExtension()`, `joinExtension()`, `readExtension()` and `MAX_EXTENSION_LENGTH`.
  - `@panneau/lists`: the `tel` display shows the extension, `+1 514 555 0199, ext. 123`, linked with `tel:+15145550199;ext=123`, when the field allows one.
  - `@panneau/intl`: their messages, in English and French.
  - `@panneau/codemods`: `TelField` takes `extension`.
  - No codemod or Rector rule: a v4 `telephone` field had no extension, and an extension kept in a separate field is merged into the number by a data conversion (`panneau:convert-phones` of `laravel-panneau`), not by rewriting code.

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

### Minor Changes

- b07c7ab: Countries, regions and phone numbers ([decision 0047](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0047-countries-regions-and-phone-numbers.md)).
  
  - **`country`:** a new built-in type, an ISO 3166-1 alpha-2 code (`CA`). `CountryField` (`@panneau/fields/country`) picks it by name in the user's locale, with its flag; `settings.countries` limits the choices and `settings.preferred` puts some first. Lists show the flag and the name.
  - **`region`:** a new built-in type, a state, a province or a territory of the country in the field that `from` names, or of `settings.country`. `RegionField` (`@panneau/fields/region`) picks among the regions of Argentina, Australia, Brazil, Canada, China, India, Japan, Mexico and the United States, named in English or French, and gives the code without the country (`QC`); for other countries, it is a text. Lists show the name.
  - **`tel` values are now E.164** (`+15145550199`). **Breaking:** the new `tel` rule, implied by the type, refuses numbers kept as typed. `TelField` shows the country of the number, its flag and its calling code in a menu at the start of the input, formats the number as it is typed, follows a number typed with its calling code, and turns a number as typed into E.164 when the field is left. `settings.country` (`country`) is the country of a new number. Lists show the flag and the international format.
  - `@panneau/ui`: options of `Select` and items of `ComboBox` take a decorative `prefix`; `ComboBox` takes a `prefix` before its input; `Select` takes `renderValue` and `appearance="bare"`, to sit inside another control.
  - `@panneau/fields` depends on `libphonenumber-js`.
  - `@panneau/ui`: a `TextInput` with a prefix or a suffix, and a `ComboBox`, now look read-only when they are (`isReadOnly`); a read-only `ComboBox` has no button to show its options.

### Patch Changes

- 1e19478: Gallery and calendar layouts for lists ([decision 0044](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0044-gallery-and-calendar.md)).
  
  - `@panneau/protocol`: a list has `calendar` (`ListCalendar`: `field`, `filter`, `perPage`), in the JSON Schema and its types. `lintDefinition()` checks that its field is a `date` or a `datetime`, and that the list has its `date-range` filter.
  - `@panneau/core`: `resolveList()` resolves `calendar` (`ResolvedCalendar`, or `null`; `DEFAULT_CALENDAR_PER_PAGE`). In the `calendar` layout of a list with a calendar, the list state's `query` is the month's: the list's query with its `date-range` filter set to the days around the month, `perPage` from the calendar, and no page or cursor. The view has `month`, in the URL (`month=2026-11`) when it isn't the current month, with `setMonth()`, and it isn't remembered. `ListDefaults` takes `calendar`. `currentMonth()`, `shiftMonth()`, `isMonth()` and `getCalendarRange()` are exported.
  - `@panneau/lists`: `GalleryLayout` (the image of each item, its title, checkbox and actions) and `CalendarLayout` (the weeks of a month from the first day of the week of the locale, with the previous, next and current month; on narrow lists, the days that have items) are built in and exported. `ListView` takes `itemImage` and `calendar`, and leaves out the gallery without the first and the calendar without the second. In the calendar, the list's filter of the calendar is hidden, there is no pagination, and a notice says when the month has more items than the list got. `ListLayoutProps` has `getItemImage` and `calendar` (`ListCalendarProps`). `getImageUrl()` reads the URL of a media reference, a file or a URL. `List` takes the calendar too.
  - `@panneau/intl`: messages of the gallery and the calendar, in English and French.
  - `@panneau/app`: a list offers the layouts its definition declares, or the table and the cards when it declares none, with the image of the resource's items and its calendar.
- 24c4fa6: Lists edit fields in place, one field at a time ([decision 0043](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0043-inline-editing.md)).
  
  - `@panneau/protocol`: a partial update reads the conditions (`visibleWhen`) and the rules that name other fields with the item's values for the fields it doesn't send: `checkValues()` takes `item`, and the mock backend passes it. A field shown when `status` is `published`, sent alone, is checked on a published item. The conformance kit checks, with `writes`, that a `PATCH` with a single field and `If-Match` changes that field alone (`update.single-field`).
  - `@panneau/lists`: a column whose field is in `inlineEdit` edits it in place in the table, for `text`, `number`, `select`, `boolean` and `date` fields, on items whose abilities allow `update`. A boolean is a checkbox; the others show a button that turns the cell into the field's control: Enter or leaving the cell saves, Escape cancels, a select or a date saves when picked. The value is checked by the field's portable rules, then saved through `onInlineEdit` (`ListInlineEditHandler`, `ListInlineEditEvent`), which resolves with the updated item. A `422` shows its messages on the cell, and a `412` shows the value someone else saved, with "Keep theirs" and "Save mine". `formatError` gives the messages of the rules. `ListLayoutProps` has `renderCell(item, column, content)`, which the table uses for its cells.
  - `@panneau/data`: `useUpdateItem()` puts the updated item in the cached lists of its resource that show it, before refetching them.
  - `@panneau/intl`: messages of inline editing, in English and French.
  - `@panneau/app`: the list of a resource edits its `inlineEdit` fields in place, and saves them with the item's version.
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
- Updated dependencies [5002faa]
- Updated dependencies [bdd0a17]
  - @panneau/protocol@5.0.0-alpha.13
  - @panneau/core@5.0.0-alpha.13
  - @panneau/fields@5.0.0-alpha.13
  - @panneau/intl@5.0.0-alpha.13
  - @panneau/ui@5.0.0-alpha.13

## 5.0.0-alpha.12

### Patch Changes

- b600b94: The panel of an item shows the values of its groups ([decision 0041](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0041-groups-in-item-details.md)).
  
  - `@panneau/lists`: `ItemDetails` takes groups: a column with `columns` (`ItemDetailsColumn`, exported) lists the values of its fields under its label, indented, read in the value of the column. While the item loads, each of them has its skeleton. New classes: `panneau-item-details-group` and `panneau-item-details-nested`.
  - `@panneau/app`: the panel of an item shows its `group` fields, with their nested fields, instead of leaving them out. Repeaters stay in the form only.
- Updated dependencies [0a8447e]
  - @panneau/ui@5.0.0-alpha.12
  - @panneau/intl@5.0.0-alpha.12
  - @panneau/fields@5.0.0-alpha.12
  - @panneau/core@5.0.0-alpha.12
  - @panneau/protocol@5.0.0-alpha.12

## 5.0.0-alpha.11

### Patch Changes

- 84bab2b: The links of an item's actions look like the buttons beside them, in rows and in the header of the item's panel and form, with room between them.
  
  - `@panneau/ui`: `LinkButton` is a link with the look of a `Button`: the same tones, appearances, sizes, hover and pressed backgrounds and focus ring. It goes through React Aria, so an app's router handles it. With `external`, it opens in a new tab, without access to the admin. `ButtonStyleProps` are the props of that look (tone, appearance, variant, size, icons, full width), shared by both.
  - `@panneau/lists`: the links of a row (`show`, `edit`, and other `link` actions) are `LinkButton`s, ghost and small like the other actions of the row, so their hover background is the one of the `…` menu button, on the same box. A destructive link is `danger`, like a destructive button. A link that leaves the admin (`http://`, `https://`) opens in a new tab. The actions of a row are `--panneau-space-2` apart, up from `--panneau-space-1`, and wrap on several lines in a narrow list or a card rather than overflow it; in a wide table they stay on one line. A link of the toolbar is outlined like the buttons beside it.
  - `@panneau/app`: the links in the header of an item's panel and form are `LinkButton`s, outlined like the buttons beside them, and `danger` when destructive. The `LinkButton` of `@panneau/app` renders the primary `LinkButton` of `@panneau/ui`, and is deprecated: use that one with `variant="primary"`, as the create link of lists, the link home of the not found page and the sign-in providers now do.
  
  Four public classes are removed, as these links have the classes of a button (`panneau-button`): `panneau-actions-link`, `panneau-actions-link-md`, `panneau-pages-action-link` and `panneau-pages-link-button`.
- Updated dependencies [84bab2b]
  - @panneau/ui@5.0.0-alpha.11
  - @panneau/fields@5.0.0-alpha.11
  - @panneau/core@5.0.0-alpha.11
  - @panneau/intl@5.0.0-alpha.11
  - @panneau/protocol@5.0.0-alpha.11

## 5.0.0-alpha.10

### Minor Changes

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
  - @panneau/core@5.0.0-alpha.10
  - @panneau/fields@5.0.0-alpha.10
  - @panneau/intl@5.0.0-alpha.10
  - @panneau/ui@5.0.0-alpha.10

## 5.0.0-alpha.9

### Minor Changes

- 30f227f: Lists can be paged with cursors, for lists too large to count (decision 0039).
  
  - `@panneau/protocol`: a list's definition takes `"pagination": "cursor"`. Its pages take `cursor` in the query (`ListQuery.cursor`, `?cursor=…`), and answer `meta: { perPage, nextCursor, previousCursor?, total? }` (`CursorPagination`) instead of page numbers. `meta` of `ListResponse` is now either kind: code that read `meta.total` or `meta.lastPage` checks which with `isCursorPage()` of `@panneau/protocol/runtime`. The mock backend pages such lists with cursors, and the conformance kit accepts them.
  - `@panneau/core`: the list state of a list paged with cursors has no `page`. `nextPage(cursor)` and `previousPage(previousCursor?)` move through its pages, back through the cursors it followed when the backend gives no `previousCursor`. Another sort, filter, search or page size starts over.
  - `@panneau/lists`: `ListView` takes `cursors` (`{ next, previous? }`) and shows the previous and next pages without page numbers (`CursorPagination`). `getPagingProps(meta)` gives a `ListView` its `total` or its `cursors` from the `meta` of a page.
  - `@panneau/media` and `@panneau/app` follow the cursors of the lists and media libraries paged with them.
- ca1aa46: Secret text fields, and options with a tone.
  
  - `text` fields with `"settings": { "secret": true }` hold a secret, such as an access key: the field types it in a password input, with a button that shows it, and keeps the browser from filling it in (`autocomplete="new-password"`). Lists and item details show it as dots. `TextField` takes `secret`.
  - The options of `select` fields take a `tone` (`{ "value": "failed", "label": "Failed", "tone": "danger" }`): a built-in tone or one of the theme. The `select` display of lists and item details shows each option as a badge in its tone.

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

### Minor Changes

- 75a6496: Two more field types ([decision 0033](../docs/decisions/0033-more-field-types.md)):
  
  - **`embed`:** the URL of a video, a sound or a post. The backend resolves it with the provider's oEmbed (`GET /embeds?url=`), and the field shows its title and thumbnail. Without the endpoint, the value is `{ url }`.
  - **`location`:** a point and its address, `{ lat, lng, address }`, placed on a Leaflet map loaded on demand, typed, or found by address through a pluggable geocoding source.
  
  And:
  
  - **`@panneau/protocol`:** `EmbedValue`, `EmbedResponse` and `LocationValue`, `GET /embeds` in the OpenAPI document, the two types in `BUILT_IN_FIELD_TYPES`, and `/embeds` in the mock backend.
  - **`@panneau/data`:** `resolveEmbed()`, optional in `DataAdapter`, implemented by the REST adapter.
  - **`@panneau/fields`:** `EmbedField` and `LocationField` at `@panneau/fields/embed` and `/location`; `createEmbedSource()`; the `embedSource` and `maps` of `FieldsProvider`; `GeocodingSource` and `createNominatimSource()`.
  - **`@panneau/lists`:** `EmbedDisplay` and `LocationDisplay`.
  - **`@panneau/app`:** the `maps` option, and the embed source of the adapter.
  - **`@panneau/intl`:** the messages of the new fields, in English and French.
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
- Updated dependencies [4e453d2]
- Updated dependencies [75a6496]
  - @panneau/protocol@5.0.0-alpha.6
  - @panneau/fields@5.0.0-alpha.6
  - @panneau/intl@5.0.0-alpha.6
  - @panneau/core@5.0.0-alpha.6
  - @panneau/ui@5.0.0-alpha.6

## 5.0.0-alpha.5

### Minor Changes

- 6d1f1d8: The show route of an item opens its details in a panel next to its list ([decision 0028](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0028-item-panel.md)), instead of the edit form:
  
  - `@panneau/app`: titles in a list link to the show route, with the list's query. The panel shows the item's values, a link to edit it, and the `link` actions of the resource that apply to it, such as its page on the site. Its button or Escape closes it, back to the list with its query. It sits beside the list from the `xl` width of the root, and over it below. Its tokens are `--panneau-item-panel-*` (`itemPanelTokens`).
  - `@panneau/lists`: `ItemDetails` shows the values of one item with the displays of the lists. `ListView` takes `currentItemId`, which marks the row of the item shown and makes the link of its title the current page. Layouts get `isCurrent`. A table keeps its title column readable in a narrow list, and scrolls instead.
  - `@panneau/intl`: the messages of the panel, in English and French.

### Patch Changes

- bdb1173: The filters of a list sit on one line: a `toggle` filter is centered on the line of the controls instead of between their labels and their boxes, and the two ends of a `date-range` filter are side by side under its legend, named “From” and “To” for assistive technologies only.
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

### Minor Changes

- 5a2ae0c: Dry runs of actions, so that a list can say how many items of a query selection ("Select all N items") an action will skip before the user confirms it. In the protocol, an action declares `dryRun`, and a request with `"dryRun": true` answers an action result without running anything; the mock backend answers them, and the conformance kit checks them (`action.dry-run`). `@panneau/actions` adds `useActionPreview()` and `previewAction()`, and `ListView` takes a `previewAction`: its confirmation shows that it is checking, then the backend's count, and runs at once when nothing is skipped and the action asks no confirmation.

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

- 5af1673: Densities (decision 0024, step 6). `PanneauRoot` takes `density`: `compact`, `comfortable`, `touch`, or `auto` (the default, as before: touch on touch screens). New density tokens `--panneau-control-padding-x` and `--panneau-row-padding-y`. The paddings of buttons, inputs, list box options and list tables now follow the density. Themes redefine each density in `densities`, and `bootstrapTheme` sets Bootstrap's control sizes for the comfortable density only. `@panneau/protocol` adds `densities` to the `Theme` schema and `density` to the definition's theme. Storybook has a density switcher.
- f86c757: Global element rules of a site, such as Bootstrap's Reboot, no longer leak into Panneau: a `h5` card title no longer gets `margin-bottom: 0.5rem`, legends no longer float, and dividers are no longer faded. The reset of the root now weighs two element selectors, more than a site's element rules and less than any class, and components reset the elements they render (titles, legends, paragraphs, lists, rules) in their own classes.
- 27a1e08: Typography roles and fonts in themes (decision 0024, step 4). `@panneau/ui` adds the font roles `--panneau-font-family-body`, `-heading` and `-display` (`--panneau-font-family` is now a deprecated alias of the body family), `--panneau-font-numeric`, the `Heading` component with its size tokens (1 to 4, `display-1`, `display-2`), `Text`, and an opt-in `Prose` container for rich content. Themes take `fonts`, font faces or hosted stylesheets, which `PanneauRoot` adds to the page once. `bootstrapTheme` now sets the body family. `@panneau/protocol` adds `fonts` to the `Theme` schema. Numbers in fields and lists use `--panneau-font-numeric`.
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

- 7274cad: Add `@panneau/lists`, which renders the list state of `@panneau/core`. `ListView` renders a list made with `useList()` and the items of its query; `List` does the same for items held in memory, from columns and items, with or without a definition. Lists have columns with displays (a registry entry per display, extended by plugins), table and cards layouts that turn into stacked rows on phones, sorting, search, filter controls with chips for the active filters, pagination, selection of ids or of every matching item with exceptions, and row and toolbar actions with confirmations, hidden when the user or the item doesn't allow them. Messages are in English and French, in `@panneau/intl`.

### Minor Changes

- dbab586: Icons by name. `getNamedIcon(name)` of `@panneau/ui` turns a Lucide icon name (`"send"`) into an icon component, which loads that icon the first time it renders (one dynamic import per icon), with an empty space of the same size until then. `loadNamedIcon(name)` loads one ahead of time. `@panneau/lists` shows the icon an action names (`"icon": "send"`), and takes icon components by action id for actions written in code (`actionIcons={{ archive: Archive }}` on `ListView` and `List`), which win over names. `getActionIcon()` and `ActionIcons` are exported.
- b3c9d6c: Range filters (`date-range`) send their bounds as their own keys: `filter[published_at][from]=2026-01-01&filter[published_at][to]=2026-01-31`, both inclusive, with an open end left out. `FilterValue` can be a `FilterRange` (`{ from?, to? }`), which `toSearchParams()` and `fromSearchParams()` read and write, and the protocol adds `isFilterRange()` and `matchesFilterRange()`, the reference of how a backend reads the bounds. The mock backend filters by ranges, and the conformance kit checks that a backend reads the bounds of a resource's `date-range` filter. `@panneau/lists` sends a date range as a `FilterRange` instead of `[from, to]` with an empty string for an open end, and filters items in memory by ranges. `@panneau/core` drops an empty range from the query.
- 9c844ee: Relation fields show the labels of values that are only ids (`"12"`), and can create items from the picker. `RelationSource` has two optional methods: `resolve(resource, ids)`, which gives the references of ids (fields that show the same ids share one request), and `create(resource, text)`, with `canCreate(resource)`, which the picker offers as "Create “…”". `createRelationSource()` resolves ids with the adapter's `get()`, and creates items with its `create()` when given `create: true` (the text becomes the `itemTitle`, in every locale when it is localized) or a function that gives the values. `RelationField` takes `onCreate`, which can open a dialog and resolves with the new reference. `useRelationReferences()` resolves references for other components. In `@panneau/lists`, relation filters resolve the labels of ids that come from the URL, for their chips and picker. `@panneau/intl` has the new messages, in English and French.

### Patch Changes

- 712dfcb: Add `@panneau/actions`: it runs the actions that lists and forms hand over. `ActionRunnerProvider` asks for the parameters of an action in a dialog (with the forms of `@panneau/forms`, client validation and the `422` errors of the action endpoint), runs it through an adapter (`runAction()`, `getActionRun()`, `cancelActionRun()` of a `DataAdapter`), shows its result (a toast with its message and counts, and the items that didn't succeed), calls `onResult` to refresh, opens downloads, follows redirects, and follows queued runs until they end. `useActionRunner(resource)` is the `onAction` of a list; `ActionRuns` lists the runs with their progress. `link` actions go through `onNavigate`, and `client` actions render the handler that a plugin registers. `@panneau/intl` has its messages, in English and French. In `@panneau/lists`, an `onAction` that gives `false` keeps the selection (the action didn't run), and resource actions show in the toolbar of a list that has no search, filters, sorting or layouts.
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
