# @panneau/media

## 5.0.0-alpha.54

### Patch Changes

- 4bfcd2f: The preview of an `image` field draws a thin line around the image itself, inside the margins of its box, so an image with white edges, like a poster, no longer blends into the grey card. It has no background, so transparent images stay as they are. `TransformedImage` takes a `frameClassName` for that line.
- 405d32e: The media picker starts filtered on the type its opener accepts: a `media` field that accepts `application/pdf` opens on "Documents", an `image` field on "Images", `video/*` on "Videos" and `audio/*` on "Audio". The user can still choose "All types", where the media not accepted stay greyed out. An `accept` of several types, or none, starts on "All types" as before.
- 1d26c77: The media picker offers the date added both ways when a library sorts by `createdAt`: "Newest first", then "Oldest first" (`createdAt`), unless the field has a label of its own.
- Updated dependencies [50f8638]
- Updated dependencies [e65232f]
  - @panneau/protocol@5.0.0-alpha.54
  - @panneau/core@5.0.0-alpha.54
  - @panneau/data@5.0.0-alpha.54
  - @panneau/fields@5.0.0-alpha.54
  - @panneau/ui@5.0.0-alpha.54
  - @panneau/intl@5.0.0-alpha.54

## 5.0.0-alpha.53

### Patch Changes

- Updated dependencies [efb2142]
  - @panneau/ui@5.0.0-alpha.53
  - @panneau/fields@5.0.0-alpha.53
  - @panneau/core@5.0.0-alpha.53
  - @panneau/data@5.0.0-alpha.53
  - @panneau/intl@5.0.0-alpha.53
  - @panneau/protocol@5.0.0-alpha.53

## 5.0.0-alpha.52

### Patch Changes

- Updated dependencies [fae7983]
- Updated dependencies [8f02df8]
- Updated dependencies [fb3f8d8]
  - @panneau/fields@5.0.0-alpha.52
  - @panneau/intl@5.0.0-alpha.52
  - @panneau/ui@5.0.0-alpha.52
  - @panneau/core@5.0.0-alpha.52
  - @panneau/data@5.0.0-alpha.52
  - @panneau/protocol@5.0.0-alpha.52

## 5.0.0-alpha.51

### Patch Changes

- Updated dependencies [441351f]
  - @panneau/data@5.0.0-alpha.51
  - @panneau/intl@5.0.0-alpha.51
  - @panneau/fields@5.0.0-alpha.51
  - @panneau/ui@5.0.0-alpha.51
  - @panneau/core@5.0.0-alpha.51
  - @panneau/protocol@5.0.0-alpha.51

## 5.0.0-alpha.50

### Patch Changes

- febe9ba: Fields reorder their items by dragging a handle (#473, decisions 0109 and 0111), with the pointer, touch, or the keyboard, and announce each move:
  
  - Repeaters and blocks: a handle at the start of each item's header. "Move up" and "Move down" stay in the tools. Values, errors, open state and focus follow each item by its key, and "Undo" after a removal still works after a move.
  - Multiple relations: a handle on each card, and a menu of moves ("Move to the start", "Move before…", "Move after…", "Move to the end") before "Remove".
  - Multiple media: a gallery of images reorders as a grid, with the handle and the menu on each image's name; other media reorder as cards. The files of a multiple `file` field reorder too.
  - Read-only and disabled fields have no handle.
  
  `@panneau/ui` adds what they use: `ReorderList` takes `layout="grid"`, lists inside items let the drags of other lists through, `ReorderMenu` is the menu of moves, `TileGroup` reorders its tiles with `onMove` and `itemLabel`, `moveItem()` moves a value of a list, and `isReorderDrag()` lets a drop zone refuse the drags of reorderable items, as the drop zones of files of `@panneau/fields` now do. `@panneau/intl` has the messages of the menu, and `namedItem` for the names of repeater items.
- e310777: The selection as text has its own token (#476, amends decision 0073): `--panneau-selected-strong`, for text and icons of a selection on the page's backgrounds and on `--panneau-selected-subtle`. It defaults to the accent as text (`--panneau-color-accent-strong`), and `checkTheme()` checks it at 4.5:1 on the surface and on `selected-subtle`. The selected ratio of `ImageEditor` reads it instead of the fill `--panneau-selected-bg`, so a light accent or a light selection keeps its label readable.
  
  Two edges of the React Compiler rewrites of #132 behave as before them again (#133): `Select` and `RelationField` use their default placeholder only when `placeholder` is left out, not when it is `null`; and `ListView` ends the pending state of an action even when the toast of its failure throws.
- Updated dependencies [24c9683]
- Updated dependencies [955586a]
- Updated dependencies [85067b3]
- Updated dependencies [489d353]
- Updated dependencies [627a778]
- Updated dependencies [31ce5c6]
- Updated dependencies [687391c]
- Updated dependencies [febe9ba]
- Updated dependencies [e310777]
  - @panneau/protocol@5.0.0-alpha.50
  - @panneau/ui@5.0.0-alpha.50
  - @panneau/fields@5.0.0-alpha.50
  - @panneau/intl@5.0.0-alpha.50
  - @panneau/data@5.0.0-alpha.50
  - @panneau/core@5.0.0-alpha.50

## 5.0.0-alpha.49

### Patch Changes

- Updated dependencies [da59be7]
- Updated dependencies [8c35edc]
- Updated dependencies [f2c5e9f]
  - @panneau/protocol@5.0.0-alpha.49
  - @panneau/ui@5.0.0-alpha.49
  - @panneau/fields@5.0.0-alpha.49
  - @panneau/intl@5.0.0-alpha.49
  - @panneau/core@5.0.0-alpha.49
  - @panneau/data@5.0.0-alpha.49

## 5.0.0-alpha.48

### Patch Changes

- Updated dependencies [291ac00]
- Updated dependencies [9298806]
- Updated dependencies [54fbe80]
- Updated dependencies [f9ff33d]
- Updated dependencies [2451268]
- Updated dependencies [674aeec]
  - @panneau/intl@5.0.0-alpha.48
  - @panneau/protocol@5.0.0-alpha.48
  - @panneau/fields@5.0.0-alpha.48
  - @panneau/ui@5.0.0-alpha.48
  - @panneau/core@5.0.0-alpha.48
  - @panneau/data@5.0.0-alpha.48

## 5.0.0-alpha.47

### Patch Changes

- 79abfd4: Undo a removal in a field: removing an item of a repeater, a card of a relation or a media of a media field now offers "Undo" in a toast (decision 0063), which puts it back at its place, with its value. Outside a `PanneauRoot`, where there is no toast region, the removal stays immediate. Repeater items now have a stable key, which isn't part of their value: the state of their fields (an editor's history), whether they are expanded and the focus follow them when they move. `@panneau/ui` exports `useUndoToast()`, which offers "Undo" in a toast and is `null` outside a `PanneauRoot`.
- 06f3e83: Ask before losing unsaved changes when closing the parameters of an action or the media picker, with the dialog and the words of leaving a form page ("Leave without saving?", "Stay" keeps the values). Closing them unchanged doesn't ask. The parameters of an action are also guarded when the page is reloaded or left through the app's router.
- 35b9955: Fields, columns, filters and pages without a `label` show their key made readable instead of the key as written: `published_at` reads "Published at", `author_id` reads "Author", `seo.title` reads "Seo title". The same fallback names fields, list columns, filters and their chips, sort options, the columns menu, the details of an item, the error summary and the conflict dialog of a form, inline editing, the filters of the media picker, and the pages in the navigation and the "Go to…" palette. A label given by the definition is shown as given, an empty one included. `@panneau/protocol/runtime` exports the fallback: `humanizeKey()`, `labelOrKey()` and `getFieldLabel()`.
- b754dda: Media fields take files dropped anywhere on them, their media included, with a visible and announced drop state and the same checks as their button (types, size, one file without `multiple`), and files pasted while the focus is inside them, except in a text input. The search of the media picker, and its text filters, wait for a pause in typing (300 ms), and Enter searches at once. A media uploaded in the picker or the media library now shows first in the library it went to, whatever the sort, until the next search, filter or sort, and once only when the pages that follow have it too. `@panneau/fields` exports `FileDropZone`, the zone that takes these drops and pastes, and `FilePicker` gets `isDroppable`, `false` inside one.
- Updated dependencies [2aab034]
- Updated dependencies [79abfd4]
- Updated dependencies [ff56beb]
- Updated dependencies [35b9955]
- Updated dependencies [a55f51b]
- Updated dependencies [ecf96f3]
- Updated dependencies [09cca06]
- Updated dependencies [1c63342]
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
- Updated dependencies [9a26df5]
  - @panneau/intl@5.0.0-alpha.47
  - @panneau/fields@5.0.0-alpha.47
  - @panneau/ui@5.0.0-alpha.47
  - @panneau/protocol@5.0.0-alpha.47
  - @panneau/core@5.0.0-alpha.47
  - @panneau/data@5.0.0-alpha.47

## 5.0.0-alpha.46

### Patch Changes

- e864d98: The preview of an `image` field draws the media's `thumbnailUrl`, stretched to the size of the original so that its crop is the same, instead of loading the original. The original is only loaded when the image editor opens, or when the thumbnail doesn't load or doesn't have the proportions of the original.
- Updated dependencies [f4f816c]
- Updated dependencies [b146a56]
  - @panneau/ui@5.0.0-alpha.46
  - @panneau/fields@5.0.0-alpha.46
  - @panneau/core@5.0.0-alpha.46
  - @panneau/data@5.0.0-alpha.46
  - @panneau/intl@5.0.0-alpha.46
  - @panneau/protocol@5.0.0-alpha.46

## 5.0.0-alpha.45

### Minor Changes

- db712f6: One way to resolve plugin entries (decision 0097).
  
  **Breaking: the ids of the built-in plugins.** `panneau-fields`, `panneau-lists`, `panneau-media` and `panneau-editor` are now `panneau.fields`, `panneau.lists`, `panneau.media` and `panneau.editor`, without aliases. A plugin id is `{vendor}.{name}`. Nothing reads an id but the check that ids are unique, so this only breaks a project that relies on those strings.
  
  **Breaking for types: the props of the definition are unchecked.** The components and panels of form layouts, and pages, get the `props` of the definition as `WithDefinitionProps<…>`. A component that required one of them (`({ label }: { label: string })`) no longer type-checks: declare them optional, beside the props of its kind (`LayoutComponentProps & { label?: string }`).
  
  `@panneau/core`: `PluginKinds` types the entries of each kind, and packages add theirs by declaration merging. `PanneauPlugin` and `PluginRegistry` derive from it, and `definePlugin()` keeps the type of the plugin. `resolveEntry()`, `getEntries()`, `useEntry()` and `useEntries()` read every kind in one order: built-ins, plugins, then the overrides of the component that renders them, with a warning in development when nothing gives an entry (`warnMissingEntry()`). `PageProps` (the id of a page, the definition, the base path and the params) joins `WidgetProps`, which gets the `currency` and the `period` of built-in widgets. `PluginComponent` and `PluginComponentKind` are deprecated.
  
  `@panneau/forms` declares `fields`, `components` and `panels`; `@panneau/lists` `fields`, `displays`, `listLayouts` and the new `filters`, the filter controls of plugins by filter type; `@panneau/actions` `actions`. `@panneau/app`: a plugin can replace a built-in widget type (`stat`), whose data is still checked against the protocol, and the built-in `dashboard` page. `docs/extending.md` describes every kind.
- 9e17345: Primitives and tokens used everywhere (#353). `@panneau/ui`: `--panneau-focus-offset`, the gap between an element and its focus ring, which every ring reads; rings outside inputs are outlines, which stay visible in forced colors. `--panneau-frame-bottom` is a semantic token (`0px`), which the dock and the region of toasts set, in place of `--panneau-bottom-offset`: a project that set `--panneau-bottom-offset` sets `--panneau-frame-bottom`. `SegmentedControl` takes `hideLabels`, `Disclosure` takes `headerEnd`, and `prefersReducedMotion()` reads the system's preference. Chevrons that show and hide content point to the end and turn down once it is shown, also in the panels of `Aside`. `@panneau/media`: the empty states of the picker are `EmptyState`s, and the cards of the picker and the stage of the image editor have component tokens (`mediaPickerTokens`, `imageEditorTokens`). `@panneau/lists`: the switch of layouts is a `SegmentedControl`. `@panneau/app`: the runs of `ActionRunsButton` show a `Spinner` and a `Badge`, the summary above a list is a `Disclosure`, and the groups of the sidebar follow the chevrons of `Disclosure`. `@panneau/editor`: paragraphs of the rich text field have the gap of `Prose`.

### Patch Changes

- 3117891: Panneau's messages load on first use, in the language the app shows (#346): a minimal app goes from 1600 KB to 1544 KB minified (499 KB to 485 KB gzip). `@panneau/intl`: `loadPanneauMessages(locale)` loads the messages of every package for a locale with an `import()` the first time, and `getLoadedPanneauMessages(locale)` returns them once loaded. `@panneau/ui`: `PanneauRoot` loads them, and renders in English until then, without the English catalog. `@panneau/app`: the app waits for them with the messages of the plugins. `@panneau/fields` and `@panneau/lists`: `locales.fr` of `fieldsPlugin` and `listsPlugin` is a loader. The thumbnails of the embed display, the embed field and the media field load when scrolled to (`loading="lazy"`).
- f8ae53c: The deprecated APIs are removed before the first beta, so that 5.0.0 ships without them. To migrate a project that started on an alpha:
  
  - **Buttons:** `variant="primary"`, `secondary`, `ghost` and `danger` of `Button`, `LinkButton` and `IconButton` are gone, with the `ButtonVariant` type. Run `npx @panneau/codemods@alpha button-variants resources/js` (`--dry` first): it gives each button the `tone` and the `appearance` the alias stood for (`primary` is `tone="accent"`, `ghost` is `appearance="ghost"`, `danger` is `tone="danger"`, `secondary` is the default), and reports what it can't read, such as a `variant` in an object of props. `variant` now only names a variant of the theme.
  - **Tones:** `AlertTone`, `BadgeTone` and `ToastTone` of `@panneau/ui` are gone: use `Tone`.
  - **Messages:** `@panneau/fields/locales`, `@panneau/forms/locales` and `@panneau/ui/locales` are gone: use `en`, `fr` or `withPanneauMessages()` of `@panneau/intl`, which hold the messages of every package.
  - **Pages:** `LinkButton` of `@panneau/app` is gone: use `LinkButton` of `@panneau/ui`, with `tone="accent"` and an icon component (`icon={Plus}`). `back` of `PageHeader` is gone: use `parents={[back]}`.
  
  `@panneau/codemods` has the `button-variants` codemod (`panneau-codemods button-variants <paths>`, or `runCodemods({ codemod: 'button-variants' })`). Inside the packages, every button takes a `tone` and an `appearance`, and a lint rule forbids the aliases.
- 44ba63b: One copy of the shared helpers. A protocol-relative link (`//example.com`) opens in a new tab from a row and from the header of an item, as it does from the editor: every package decides with `isExternalUrl()` of `@panneau/protocol/runtime`. `@panneau/lists`: `ActionButton` is public, and takes `inHeader` (the color of the action, outlined, with the icon of an external link), which the actions of an item in `@panneau/app` now use. `getActionHref()` is no longer public: use `fillActionUrl()` of `@panneau/core`. `@panneau/ui`: `cx()` is public, the one `cx` of every package. `@panneau/core`: `ruleMessages` holds the English messages of the rules by the keys of `@panneau/intl` (`panneau.forms.rule.<key>`), `crop` included, and `formatRuleFailure()` uses them: numbers are formatted (`1,200`) and lists take a serial comma (`YouTube, Vimeo, or Spotify`). `@panneau/media`: the picker's own `formatDuration` is now `formatPlaybackTime`, apart from `formatDuration()` of `@panneau/fields/duration`.
- Updated dependencies [0bbbeea]
- Updated dependencies [62d73ad]
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
  - @panneau/data@5.0.0-alpha.45
  - @panneau/ui@5.0.0-alpha.45
  - @panneau/core@5.0.0-alpha.45
  - @panneau/intl@5.0.0-alpha.45
  - @panneau/fields@5.0.0-alpha.45

## 5.0.0-alpha.44

### Minor Changes

- 70ac183: Rows that show one thing are drawn with `Tile` and `TileGroup` (decision 0092): the chosen items of a relation field, the items of the dashboard's list widgets, the passkeys of the account page, and the chosen files of a media field. A row with a link is a link as a whole. Their own stable classes are removed: `.panneau-relation-field-card`, `-card-actions`, `-card-description`, `-card-label`, `-card-text`, `-cards`, `-link` and `-option-thumbnail`; `.panneau-dashboard-item`, `-item-description` and `-item-text`; `.panneau-pages-passkey`, `-passkey-name` and `-passkeys`; `.panneau-media-field-item` and `-thumbnail`. Restyle them with the tile's tokens and its `.panneau-tile` and `.panneau-tile-group` classes.

### Patch Changes

- Updated dependencies [333cb75]
- Updated dependencies [70ac183]
- Updated dependencies [07c2ed8]
  - @panneau/ui@5.0.0-alpha.44
  - @panneau/intl@5.0.0-alpha.44
  - @panneau/fields@5.0.0-alpha.44
  - @panneau/protocol@5.0.0-alpha.44
  - @panneau/data@5.0.0-alpha.44
  - @panneau/core@5.0.0-alpha.44

## 5.0.0-alpha.43

### Patch Changes

- Updated dependencies [2136caf]
  - @panneau/protocol@5.0.0-alpha.43
  - @panneau/core@5.0.0-alpha.43
  - @panneau/data@5.0.0-alpha.43
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
  - @panneau/data@5.0.0-alpha.42
  - @panneau/protocol@5.0.0-alpha.42

## 5.0.0-alpha.41

### Patch Changes

- @panneau/core@5.0.0-alpha.41
  - @panneau/data@5.0.0-alpha.41
  - @panneau/fields@5.0.0-alpha.41
  - @panneau/intl@5.0.0-alpha.41
  - @panneau/protocol@5.0.0-alpha.41
  - @panneau/ui@5.0.0-alpha.41

## 5.0.0-alpha.40

### Patch Changes

- Updated dependencies [0511341]
  - @panneau/protocol@5.0.0-alpha.40
  - @panneau/ui@5.0.0-alpha.40
  - @panneau/data@5.0.0-alpha.40
  - @panneau/intl@5.0.0-alpha.40
  - @panneau/core@5.0.0-alpha.40
  - @panneau/fields@5.0.0-alpha.40

## 5.0.0-alpha.39

### Patch Changes

- @panneau/core@5.0.0-alpha.39
  - @panneau/data@5.0.0-alpha.39
  - @panneau/fields@5.0.0-alpha.39
  - @panneau/intl@5.0.0-alpha.39
  - @panneau/protocol@5.0.0-alpha.39
  - @panneau/ui@5.0.0-alpha.39

## 5.0.0-alpha.38

### Minor Changes

- 6c3dd8d: Image fields without transforms (decision 0087). A `media` or `image` field can say that its values keep no transform for one use: `"transforms": false`, which `laravel-panneau` writes for `transforms(false)`. An `image` field without transforms has no Edit action, no editor and no crop step: it shows each image as the media is, and drops the `transform` of the values it sends. `ImageField` and `ImageOptions` take `transforms`, which `getImageOptions()` reads. `lintDefinition()` reports `ratios` and the `crop` rule on a field without transforms. The codemods pass `transforms` to `ImageField`.

### Patch Changes

- Updated dependencies [6c3dd8d]
  - @panneau/protocol@5.0.0-alpha.38
  - @panneau/core@5.0.0-alpha.38
  - @panneau/data@5.0.0-alpha.38
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
  - @panneau/data@5.0.0-alpha.37
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
  - @panneau/data@5.0.0-alpha.36
  - @panneau/fields@5.0.0-alpha.36
  - @panneau/ui@5.0.0-alpha.36

## 5.0.0-alpha.35

### Patch Changes

- Updated dependencies [60b8651]
- Updated dependencies [1ecdaa8]
  - @panneau/ui@5.0.0-alpha.35
  - @panneau/fields@5.0.0-alpha.35
  - @panneau/core@5.0.0-alpha.35
  - @panneau/data@5.0.0-alpha.35
  - @panneau/intl@5.0.0-alpha.35
  - @panneau/protocol@5.0.0-alpha.35

## 5.0.0-alpha.34

### Minor Changes

- 776ae81: Add `MediaLibrary` to `@panneau/media/picker`: the library of the media picker as a page, with the same sources, search, filters, upload and details, without the dialog and without picking. A click on a media opens its details. `MediaPicker` and `MediaLibrary` share one implementation, and `MediaPickerProps` now extends the new `MediaLibraryOptions` (decision 0081).

### Patch Changes

- @panneau/core@5.0.0-alpha.34
  - @panneau/data@5.0.0-alpha.34
  - @panneau/fields@5.0.0-alpha.34
  - @panneau/intl@5.0.0-alpha.34
  - @panneau/protocol@5.0.0-alpha.34
  - @panneau/ui@5.0.0-alpha.34

## 5.0.0-alpha.33

### Patch Changes

- Updated dependencies [16fd93b]
  - @panneau/protocol@5.0.0-alpha.33
  - @panneau/core@5.0.0-alpha.33
  - @panneau/data@5.0.0-alpha.33
  - @panneau/fields@5.0.0-alpha.33
  - @panneau/ui@5.0.0-alpha.33
  - @panneau/intl@5.0.0-alpha.33

## 5.0.0-alpha.32

### Patch Changes

- Updated dependencies [5de54d2]
  - @panneau/protocol@5.0.0-alpha.32
  - @panneau/core@5.0.0-alpha.32
  - @panneau/data@5.0.0-alpha.32
  - @panneau/fields@5.0.0-alpha.32
  - @panneau/ui@5.0.0-alpha.32
  - @panneau/intl@5.0.0-alpha.32

## 5.0.0-alpha.31

### Patch Changes

- Updated dependencies [3044946]
  - @panneau/ui@5.0.0-alpha.31
  - @panneau/fields@5.0.0-alpha.31
  - @panneau/core@5.0.0-alpha.31
  - @panneau/data@5.0.0-alpha.31
  - @panneau/intl@5.0.0-alpha.31
  - @panneau/protocol@5.0.0-alpha.31

## 5.0.0-alpha.30

### Patch Changes

- Updated dependencies [8d18be8]
  - @panneau/ui@5.0.0-alpha.30
  - @panneau/fields@5.0.0-alpha.30
  - @panneau/core@5.0.0-alpha.30
  - @panneau/data@5.0.0-alpha.30
  - @panneau/intl@5.0.0-alpha.30
  - @panneau/protocol@5.0.0-alpha.30

## 5.0.0-alpha.29

### Patch Changes

- 179efeb: Themes can set selections apart from the accent, and style focus rings and filled buttons (decision 0073). New component tokens: `--panneau-selected-bg`, `--panneau-selected-text` and `--panneau-selected-subtle`, read by checkboxes, radios, switches, the slider, tabs, calendars, selected rows, cards and media, and the rich text toolbar (they default to the accent, so nothing changes without them); `--panneau-input-border-color-focus`, `--panneau-input-focus-ring` and `--panneau-input-focus-ring-invalid`; `--panneau-button-solid-border-color` and `--panneau-button-pressed-scale`; `--panneau-field-required-color`; `--panneau-switch-track-border-color`; `--panneau-segmented-control-segment-color-hover` and `-segment-bg-hover`, so a hovered segment no longer takes the text color of the selected one. `checkTheme()` checks translucent colors over what is under them, explicit tone values that refer to the palette, and the selection against the surface. The active formats of the rich text toolbar are visible again, and the links of the login page use the link color.
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
  - @panneau/data@5.0.0-alpha.29

## 5.0.0-alpha.28

### Patch Changes

- Updated dependencies [041732f]
  - @panneau/protocol@5.0.0-alpha.28
  - @panneau/core@5.0.0-alpha.28
  - @panneau/data@5.0.0-alpha.28
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
  - @panneau/data@5.0.0-alpha.27
  - @panneau/ui@5.0.0-alpha.27
  - @panneau/intl@5.0.0-alpha.27

## 5.0.0-alpha.26

### Patch Changes

- Updated dependencies [8461e06]
- Updated dependencies [e322361]
- Updated dependencies [d44397d]
  - @panneau/intl@5.0.0-alpha.26
  - @panneau/protocol@5.0.0-alpha.26
  - @panneau/ui@5.0.0-alpha.26
  - @panneau/fields@5.0.0-alpha.26
  - @panneau/core@5.0.0-alpha.26
  - @panneau/data@5.0.0-alpha.26

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
  - @panneau/data@5.0.0-alpha.25

## 5.0.0-alpha.24

### Patch Changes

- @panneau/core@5.0.0-alpha.24
  - @panneau/data@5.0.0-alpha.24
  - @panneau/fields@5.0.0-alpha.24
  - @panneau/intl@5.0.0-alpha.24
  - @panneau/protocol@5.0.0-alpha.24
  - @panneau/ui@5.0.0-alpha.24

## 5.0.0-alpha.23

### Patch Changes

- c310e38: The media picker no longer draws its checkboxes over the images (decision 0068): a selected card has an accent ring around its image and a checked box before its name, in its caption.
- Updated dependencies [c310e38]
- Updated dependencies [c310e38]
  - @panneau/fields@5.0.0-alpha.23
  - @panneau/intl@5.0.0-alpha.23
  - @panneau/ui@5.0.0-alpha.23
  - @panneau/core@5.0.0-alpha.23
  - @panneau/data@5.0.0-alpha.23
  - @panneau/protocol@5.0.0-alpha.23

## 5.0.0-alpha.22

### Patch Changes

- Updated dependencies [d8a77d0]
- Updated dependencies [d8a77d0]
  - @panneau/ui@5.0.0-alpha.22
  - @panneau/intl@5.0.0-alpha.22
  - @panneau/protocol@5.0.0-alpha.22
  - @panneau/fields@5.0.0-alpha.22
  - @panneau/core@5.0.0-alpha.22
  - @panneau/data@5.0.0-alpha.22

## 5.0.0-alpha.21

### Patch Changes

- Updated dependencies [2a87620]
  - @panneau/ui@5.0.0-alpha.21
  - @panneau/fields@5.0.0-alpha.21
  - @panneau/core@5.0.0-alpha.21
  - @panneau/data@5.0.0-alpha.21
  - @panneau/intl@5.0.0-alpha.21
  - @panneau/protocol@5.0.0-alpha.21

## 5.0.0-alpha.20

### Patch Changes

- @panneau/core@5.0.0-alpha.20
  - @panneau/data@5.0.0-alpha.20
  - @panneau/fields@5.0.0-alpha.20
  - @panneau/intl@5.0.0-alpha.20
  - @panneau/protocol@5.0.0-alpha.20
  - @panneau/ui@5.0.0-alpha.20

## 5.0.0-alpha.19

### Patch Changes

- Updated dependencies [b547a0a]
- Updated dependencies [f07ce4c]
  - @panneau/protocol@5.0.0-alpha.19
  - @panneau/core@5.0.0-alpha.19
  - @panneau/fields@5.0.0-alpha.19
  - @panneau/intl@5.0.0-alpha.19
  - @panneau/data@5.0.0-alpha.19
  - @panneau/ui@5.0.0-alpha.19

## 5.0.0-alpha.18

### Patch Changes

- Updated dependencies [b200640]
- Updated dependencies [93223bd]
- Updated dependencies [19d0892]
- Updated dependencies [11bcf36]
- Updated dependencies [aae4bf7]
- Updated dependencies [d46a16d]
  - @panneau/protocol@5.0.0-alpha.18
  - @panneau/ui@5.0.0-alpha.18
  - @panneau/data@5.0.0-alpha.18
  - @panneau/core@5.0.0-alpha.18
  - @panneau/intl@5.0.0-alpha.18
  - @panneau/fields@5.0.0-alpha.18

## 5.0.0-alpha.17

### Patch Changes

- Updated dependencies [2a1f32d]
  - @panneau/fields@5.0.0-alpha.17
  - @panneau/core@5.0.0-alpha.17
  - @panneau/data@5.0.0-alpha.17
  - @panneau/intl@5.0.0-alpha.17
  - @panneau/protocol@5.0.0-alpha.17
  - @panneau/ui@5.0.0-alpha.17

## 5.0.0-alpha.16

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
  - @panneau/data@5.0.0-alpha.16

## 5.0.0-alpha.15

### Patch Changes

- Updated dependencies [658b3d3]
- Updated dependencies [97456b6]
- Updated dependencies [d85d11a]
- Updated dependencies [b05ef33]
- Updated dependencies [acdc6e2]
  - @panneau/protocol@5.0.0-alpha.15
  - @panneau/data@5.0.0-alpha.15
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
  - @panneau/data@5.0.0-alpha.14
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
  - @panneau/data@5.0.0-alpha.13

## 5.0.0-alpha.12

### Patch Changes

- Updated dependencies [0a8447e]
  - @panneau/ui@5.0.0-alpha.12
  - @panneau/intl@5.0.0-alpha.12
  - @panneau/fields@5.0.0-alpha.12
  - @panneau/core@5.0.0-alpha.12
  - @panneau/data@5.0.0-alpha.12
  - @panneau/protocol@5.0.0-alpha.12

## 5.0.0-alpha.11

### Patch Changes

- Updated dependencies [84bab2b]
  - @panneau/ui@5.0.0-alpha.11
  - @panneau/fields@5.0.0-alpha.11
  - @panneau/core@5.0.0-alpha.11
  - @panneau/data@5.0.0-alpha.11
  - @panneau/intl@5.0.0-alpha.11
  - @panneau/protocol@5.0.0-alpha.11

## 5.0.0-alpha.10

### Patch Changes

- Updated dependencies [810fc90]
- Updated dependencies [2fcd438]
- Updated dependencies [68f5322]
  - @panneau/protocol@5.0.0-alpha.10
  - @panneau/core@5.0.0-alpha.10
  - @panneau/fields@5.0.0-alpha.10
  - @panneau/intl@5.0.0-alpha.10
  - @panneau/data@5.0.0-alpha.10
  - @panneau/ui@5.0.0-alpha.10

## 5.0.0-alpha.9

### Patch Changes

- 30f227f: Lists can be paged with cursors, for lists too large to count (decision 0039).
  
  - `@panneau/protocol`: a list's definition takes `"pagination": "cursor"`. Its pages take `cursor` in the query (`ListQuery.cursor`, `?cursor=…`), and answer `meta: { perPage, nextCursor, previousCursor?, total? }` (`CursorPagination`) instead of page numbers. `meta` of `ListResponse` is now either kind: code that read `meta.total` or `meta.lastPage` checks which with `isCursorPage()` of `@panneau/protocol/runtime`. The mock backend pages such lists with cursors, and the conformance kit accepts them.
  - `@panneau/core`: the list state of a list paged with cursors has no `page`. `nextPage(cursor)` and `previousPage(previousCursor?)` move through its pages, back through the cursors it followed when the backend gives no `previousCursor`. Another sort, filter, search or page size starts over.
  - `@panneau/lists`: `ListView` takes `cursors` (`{ next, previous? }`) and shows the previous and next pages without page numbers (`CursorPagination`). `getPagingProps(meta)` gives a `ListView` its `total` or its `cursors` from the `meta` of a page.
  - `@panneau/media` and `@panneau/app` follow the cursors of the lists and media libraries paged with them.
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
  - @panneau/data@5.0.0-alpha.9

## 5.0.0-alpha.8

### Patch Changes

- 83c82d4: The declaration files work in TypeScript projects on `"module": "NodeNext"`. Their relative specifiers now name their file (`./schemas/index.js`, `./rest.js`), so the types that an entry point re-exports, such as `Definition` of `@panneau/protocol`, are no longer missing under Node's resolution, and the CSS Modules that some declarations imported are declared in place. Nothing changes for projects on the `Bundler` resolution.
- Updated dependencies [6e76c06]
- Updated dependencies [83c82d4]
- Updated dependencies [477d974]
  - @panneau/ui@5.0.0-alpha.8
  - @panneau/core@5.0.0-alpha.8
  - @panneau/data@5.0.0-alpha.8
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
  - @panneau/data@5.0.0-alpha.7

## 5.0.0-alpha.6

### Minor Changes

- 48676ff: A media says why its processing failed (#84): the `media` block of a library item gets an optional `error`, `{ code, message }`, when its `status` is `failed`. The `media` and `image` fields show the message under "Processing failed", and the media picker gives it as the reason a media can't be picked (`statusFailedBecause`, in English and French).

### Patch Changes

- Updated dependencies [75a6496]
- Updated dependencies [48676ff]
- Updated dependencies [75a6496]
- Updated dependencies [4e453d2]
- Updated dependencies [75a6496]
  - @panneau/protocol@5.0.0-alpha.6
  - @panneau/data@5.0.0-alpha.6
  - @panneau/fields@5.0.0-alpha.6
  - @panneau/intl@5.0.0-alpha.6
  - @panneau/core@5.0.0-alpha.6
  - @panneau/ui@5.0.0-alpha.6

## 5.0.0-alpha.5

### Minor Changes

- eadfc08: `@panneau/media/editor`: the image editor (decision 0031). It edits a transform of an image, with the image as it will be rendered. `ImageEditor` fits in a page or a panel, and lays itself out for its own width. `ImageEditorDialog` opens it in a large dialog, and a full-screen sheet on phones.
  
  - **Tools:** crop (a frame with handles and thirds, ratios, and numbers), rotate (with flips) and focal point (with the automatic crops it gives), from `useImageEditorTools()`. A product adds its own, with a panel, an overlay and a `validate()`.
  - **The keyboard** moves and resizes the crop frame, and moves the focal point.
  - **The field's rules:** offered or enforced `ratios`, and a required crop, which the editor proposes around the focal point.
  - **The base of a transform for one use:** over the media's own transform by default, with `base` and `baseTransform`, or from the original file. When the media's transform changed, the crop is moved inside the new version, and the editor says so.
  
  The entry point loads neither `@panneau/data` nor `@panneau/core`. Its messages are in `@panneau/intl`, in English and French.
- f2c79b5: The `image` field (decision 0031). `ImageField` is a `media` field for images, with the image editor:
  
  - **Preview:** each image shows as it is rendered for this use, computed in the browser.
  - **Edit** opens the editor on its transform.
  - **Badges** say whether it is cropped, needs a crop, or was cropped over a version of the library that changed.
  - **Options:** `ratios` (offered or enforced), `cropRequired`, `rotate`, `focalPoint` and `transformBase`, shown next to the description.
  - **After a pick:** when a crop is required, the editor is the step right after the pick of one image.
  
  `mediaPlugin` now gives the `image` type too, and `MediaFieldEntry` reads its options and its `crop` rule (`getImageOptions()`). `MediaField` takes them as `image`. The image editor and the field share how an image is drawn. The mockups of the editor and the field are deleted.
- 8372b27: A `media` field can allow several libraries (decision 0027). Its `resource` takes a list of library ids, and without one it allows every library of the definition, instead of being an error when there are several. `MediaReference` gets `resource`, its library: ids are unique only within their library, so a field that allows several needs it in requests, and the mock backend refuses a media without it. `getMediaLibraries(definition, field)` (in `@panneau/protocol/runtime`) gives the libraries a field allows. `lintDefinition()` checks each listed id, and that a `relation` field names one resource. `getLibrary()` of `@panneau/media` takes a list too, and gives the first library: the field uploads to it, the references it makes carry their library, and it reads each media in its own library. The `relation` field ignores a list in `resource`.
- 199a687: The `media` field opens the media picker: "Choose media" ("Add media" with `multiple`) browses the libraries given as `sources`, and the media picked replaces the field's media, or is added to its list. `MediaFieldEntry` gives the sources of every library the field allows, through the adapter of `DataAdapterProvider`. With the picker, the upload button reads "Upload a file" ("Upload files"). A media is now removed by its library and id, so that two libraries can have media with the same id. New messages in `@panneau/intl`: `chooseMedia`, `addMedia`, `uploadFile` and `uploadFiles`.
- fb33783: New `@panneau/media/picker` entry point (decision 0027): `MediaPicker`, a dialog to browse media libraries, upload to them and pick one media, or several with `multiple`, on `MediaSource`s that Panneau or a product implements. It has search, a type filter, sorts, the filters of the sources and of the opener (the opener's `filter` is locked), infinite scroll that keeps its place (across openings with `stateKey`), a selection across libraries, `accept` and `maxSize` that grey out what doesn't match, details that edit the fields of a media with `update()` and ask before losing changes, an Upload tab whose files become media of the library shown and are selected (`confirmOnUpload` confirms a single one at once), and follows media being processed. It returns references with their library. The entry point loads neither `@panneau/data` nor `@panneau/core`. `createResourceMediaSource(adapter, library)`, in `@panneau/media`, gives the source of a library resource. `@panneau/intl` gets the picker's messages, in English and French.

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
  - @panneau/data@5.0.0-alpha.5
  - @panneau/fields@5.0.0-alpha.5
  - @panneau/ui@5.0.0-alpha.5

## 5.0.0-alpha.4

### Minor Changes

- 3974fb5: Add `@panneau/media`, with the media field: `MediaField` and `mediaPlugin` (the `media` type). A file becomes a media through the adapter of `@panneau/data`, uploaded first through the upload source of the fields context when there is one, and the field follows its ingest (`status`) until it is ready or failed.
- b9852a0: Media libraries are resources (decision 0026). A resource of kind `media` (`Resource.kind`) has a `file` field and gives each item a read-only `media` (`MediaInfo`: type, mime, size, URLs, renditions, dimensions, duration, status). Every media operation is a resource operation: `POST /resources/{library}` with `{ file: { upload } }` makes a media, and the `/media` endpoints are removed, with the `Media`, `MediaResponse` and `MediaListResponse` schemas and the media methods of `DataAdapter` (`listMedia`, `getMedia`, `uploadMedia`, `updateMedia`, `deleteMedia`). A `media` field references media of a library (its `resource`, optional with a single library): its value is a `MediaReference` (`{ id, label, media, transform }`), and requests send ids or `{ id, transform }`. `lintDefinition()` checks both. The mock backend serves libraries. `MediaField` takes a `resource` and makes media with `create()` and reads them with `get()`; `isMedia()` and `toMedia()` become `toMediaReference()` and `toMediaReferences()`, with `getLibrary()`.

### Patch Changes

- Updated dependencies [b9852a0]
- Updated dependencies [ecc77a6]
- Updated dependencies [db1f253]
- Updated dependencies [3974fb5]
- Updated dependencies [3974fb5]
- Updated dependencies [3974fb5]
  - @panneau/protocol@5.0.0-alpha.4
  - @panneau/data@5.0.0-alpha.4
  - @panneau/intl@5.0.0-alpha.4
  - @panneau/fields@5.0.0-alpha.4
  - @panneau/core@5.0.0-alpha.4
  - @panneau/ui@5.0.0-alpha.4
