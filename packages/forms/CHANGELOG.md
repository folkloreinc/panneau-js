# @panneau/forms

## 5.0.0-alpha.55

### Patch Changes

- Updated dependencies [d4d906c]
- Updated dependencies [62b636f]
- Updated dependencies [bcc61ea]
  - @panneau/intl@5.0.0-alpha.55
  - @panneau/core@5.0.0-alpha.55
  - @panneau/fields@5.0.0-alpha.55
  - @panneau/ui@5.0.0-alpha.55
  - @panneau/protocol@5.0.0-alpha.55

## 5.0.0-alpha.54

### Patch Changes

- Updated dependencies [50f8638]
- Updated dependencies [e65232f]
  - @panneau/protocol@5.0.0-alpha.54
  - @panneau/core@5.0.0-alpha.54
  - @panneau/fields@5.0.0-alpha.54
  - @panneau/ui@5.0.0-alpha.54
  - @panneau/intl@5.0.0-alpha.54

## 5.0.0-alpha.53

### Patch Changes

- Updated dependencies [efb2142]
  - @panneau/ui@5.0.0-alpha.53
  - @panneau/fields@5.0.0-alpha.53
  - @panneau/core@5.0.0-alpha.53
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
  - @panneau/protocol@5.0.0-alpha.52

## 5.0.0-alpha.51

### Patch Changes

- Updated dependencies [441351f]
  - @panneau/intl@5.0.0-alpha.51
  - @panneau/fields@5.0.0-alpha.51
  - @panneau/ui@5.0.0-alpha.51
  - @panneau/core@5.0.0-alpha.51
  - @panneau/protocol@5.0.0-alpha.51

## 5.0.0-alpha.50

### Patch Changes

- 85067b3: Forms on phones (#501). Below 56rem, the sidebar of a form comes before its fields, collapsed to one line that names its panels (`Publication · Files`), with the error badge of its fields; it opens on a revealed field or an error, and has no box of its own, so its fields are as wide as the form's (decision 0075, amended). `AsideLayout` takes `narrow="before"` and `onBeforeChange`, and `Aside` takes `summary`, `summaryEnd`, `isExpanded` and `onExpandedChange`. The switch of a localized field stays on the line of its label: the label wraps first, and "Copy from …" is only its icon in a narrow field. A narrow repeater puts the tools of an item in a menu ("Actions for item 1"), so that its title keeps the room of its header. On a phone, the save bar of the app's form page is fixed at the bottom of the screen, from edge to edge, on the background of the page's card.
- Updated dependencies [24c9683]
- Updated dependencies [955586a]
- Updated dependencies [85067b3]
- Updated dependencies [489d353]
- Updated dependencies [627a778]
- Updated dependencies [687391c]
- Updated dependencies [febe9ba]
- Updated dependencies [e310777]
  - @panneau/protocol@5.0.0-alpha.50
  - @panneau/ui@5.0.0-alpha.50
  - @panneau/fields@5.0.0-alpha.50
  - @panneau/intl@5.0.0-alpha.50
  - @panneau/core@5.0.0-alpha.50

## 5.0.0-alpha.49

### Patch Changes

- f2c5e9f: Polish of the interface (#487):
  
  - `SegmentedControl`: the highlight slides from one segment to the next (`--panneau-duration-slow`, none when the user prefers reduced motion), keeps its padding in every size and density, and the selected segment is readable in the dark scheme.
  - `Pagination` of lists: buttons for the first and the last pages, and the current page opens "Go to page", a number field (Enter goes there, within the pages; Escape closes it). Messages in English and French.
  - `DatePicker` with a time, and the slug field: in a narrow box, such as the form's sidebar, the date and the time go on two lines, the time zone under them starts on the same edge, and the slug's prefix is cut rather than its input.
  - Hints of keyboard shortcuts (decision 0112): `Tooltip`, `IconButton`, `MenuItem` and the items of `CommandPalette` take a `shortcut`, whose keys show at their end. "Go to…" of the sidebar and the dock no longer shows ⌘K on the button, but in its tooltip; the sidebar's toggle shows ⌘\, "Keyboard shortcuts" shows ?, and the Save button's tooltip names it before its keys.
  - The user's menu, top to bottom: who is logged in, a link to their profile; "Preferences", a section closed at first, one row each with a small label: the appearance and the density as rows of icons named by their tooltips, the language as a select; then "Keyboard shortcuts", and "Log out" alone at the end (decisions 0086 and 0104 amended). `Menu` takes `isInline`, to sit in a popover with other controls, and a `SelectOption` takes the `lang` of its label.
  - Lists: the "Select" button keeps only its icon, with its name in a tooltip. A select filter with a value has its clear button in place of its arrow (`Select` takes `onClear` and `clearLabel`, and `FilterControlProps` gives them to a control that clears itself), and a list sorted by a column tints its sort button as a filter with a value.
  - Forms: the floating save bar keeps clear of the home indicator and the rounded corners of phones (`env(safe-area-inset-*)`), and an empty status no longer pushes its button.
- Updated dependencies [da59be7]
- Updated dependencies [8c35edc]
- Updated dependencies [f2c5e9f]
  - @panneau/protocol@5.0.0-alpha.49
  - @panneau/ui@5.0.0-alpha.49
  - @panneau/fields@5.0.0-alpha.49
  - @panneau/intl@5.0.0-alpha.49
  - @panneau/core@5.0.0-alpha.49

## 5.0.0-alpha.48

### Patch Changes

- 9298806: "Copy from …" for localized fields, and an optional language switch for a form. An empty language of a localized field can be copied from a filled one, which makes the form dirty like any edit. A form can ask for one language switch above its fields: `form.languageSwitch: true` on a resource in the definition, or `languageSwitch` on `FormView` and `Form`. It sets the language of every localized field at once, says which languages have errors or miss required values, is remembered by the browser for every form with the switch, and moves to the language of an error reached from the summary or after a failed save; a field can still switch on its own until the form's switch changes again. Without the setting, the default, each localized field keeps its own switch only, as before. `@panneau/fields` exports `ContentLocaleContext`, `useContentLocale()` and `useFieldLocale()` (decision 0108).
- 54fbe80: One registry of keyboard shortcuts, and a "?" help (decision 0112). `PanneauRoot` keeps the registry, with one listener on the document: `useShortcut()` of `@panneau/ui` registers a shortcut while a component is mounted, with its keys (`Mod+K`, ⌘ on Apple platforms and Ctrl elsewhere), a label, a group, a scope and `perform`. The element that holds the focus gets a key first, then the open dialog, then the page; a shortcut of the page never fires under a dialog. Single keys (`?`) never fire while the user types, and users can turn them off in the help, which the browser remembers (`panneau:single-key-shortcuts`). `?` opens the help, a dialog that lists the shortcuts registered now by group, also from the user's menu and "Go to…" (`useShortcutHelp()`); it loads when it first opens. `formatShortcut()`, `useFormatShortcut()` and `useShortcutLabel()` format keys for tooltips and `aria-keyshortcuts`, in the Save button, the sidebar, the dock and the editor's toolbar. ⌘K, ⌘\ and ⌘S / ⌘Enter move to the registry with the same behaviour, except that ⌘\ is ⌘\ only on Apple platforms and no longer works under a dialog; a form shown without a `PanneauRoot` no longer takes ⌘S. Plugins add `shortcuts`, as they add `commands`: an id, keys, a label, a group and `perform` (`Shortcut`, `getShortcuts()` of `@panneau/core`). `@panneau/intl`: `panneau.forms.saveShortcut` is gone (the tooltip of Save comes from the formatter); new messages for the help, `panneau.app.toggleSidebar` and `panneau.forms.shortcutsGroup`.
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

## 5.0.0-alpha.47

### Patch Changes

- 2aab034: Save only what changed, from anywhere on the page. The Save button of an update without changes is disabled: it stays in the tab order, says "No changes to save" to assistive technologies, and submitting the form (Enter in a field, a shortcut) sends no request. A create form can always be saved. ⌘ S and ⌘ Enter (Ctrl S and Ctrl Enter elsewhere) save the form of the page wherever the focus is, and the form of an open dialog (the parameters of an action) rather than the page under it; ⌘ S never opens the browser's "Save page" while a form is shown. `FormView` and `Form` take `onDirtyChange`, and the app marks the title of the tab (`• `) while the form of an item has unsaved changes.
- ff56beb: The publication badge says what is saved. The `publication` component and panel show the state of the item as it was last saved (the form's initial values, which follow each saved version), and say apart, in the `warning` tone, when the publication fields have unsaved changes ("Published · Unsaved changes"). A Publish or Unpublish whose save doesn't succeed (invalid values, a `422`, a conflict, an error) puts the publication values back as they were before the press, and keeps the other edits. A scheduled item becomes Published when its date passes while the form is open, with a timer set for the date. Publish and Unpublish also save an item that has no other changes: a form's submit reads whether it has changes when it happens, not from its last render.
- 35b9955: Fields, columns, filters and pages without a `label` show their key made readable instead of the key as written: `published_at` reads "Published at", `author_id` reads "Author", `seo.title` reads "Seo title". The same fallback names fields, list columns, filters and their chips, sort options, the columns menu, the details of an item, the error summary and the conflict dialog of a form, inline editing, the filters of the media picker, and the pages in the navigation and the "Go to…" palette. A label given by the definition is shown as given, an empty one included. `@panneau/protocol/runtime` exports the fallback: `humanizeKey()`, `labelOrKey()` and `getFieldLabel()`.
- 1350d30: A form no longer drops what is being typed when its item gets a new version (a refetch on focus, after an action, or a save while typing). A form without unsaved changes takes the new version; a form with unsaved changes keeps them, says that a newer version was saved, and its "Compare" opens the conflict dialog. New: `form.refresh(item)`, `form.reviewNewer()` and `newer` in the form state in `@panneau/core`, and the `item` prop of `Form` in `@panneau/forms`.
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

- Updated dependencies [f4f816c]
- Updated dependencies [b146a56]
  - @panneau/ui@5.0.0-alpha.46
  - @panneau/fields@5.0.0-alpha.46
  - @panneau/core@5.0.0-alpha.46
  - @panneau/intl@5.0.0-alpha.46
  - @panneau/protocol@5.0.0-alpha.46

## 5.0.0-alpha.45

### Minor Changes

- db712f6: One way to resolve plugin entries (decision 0097).
  
  **Breaking: the ids of the built-in plugins.** `panneau-fields`, `panneau-lists`, `panneau-media` and `panneau-editor` are now `panneau.fields`, `panneau.lists`, `panneau.media` and `panneau.editor`, without aliases. A plugin id is `{vendor}.{name}`. Nothing reads an id but the check that ids are unique, so this only breaks a project that relies on those strings.
  
  **Breaking for types: the props of the definition are unchecked.** The components and panels of form layouts, and pages, get the `props` of the definition as `WithDefinitionProps<…>`. A component that required one of them (`({ label }: { label: string })`) no longer type-checks: declare them optional, beside the props of its kind (`LayoutComponentProps & { label?: string }`).
  
  `@panneau/core`: `PluginKinds` types the entries of each kind, and packages add theirs by declaration merging. `PanneauPlugin` and `PluginRegistry` derive from it, and `definePlugin()` keeps the type of the plugin. `resolveEntry()`, `getEntries()`, `useEntry()` and `useEntries()` read every kind in one order: built-ins, plugins, then the overrides of the component that renders them, with a warning in development when nothing gives an entry (`warnMissingEntry()`). `PageProps` (the id of a page, the definition, the base path and the params) joins `WidgetProps`, which gets the `currency` and the `period` of built-in widgets. `PluginComponent` and `PluginComponentKind` are deprecated.
  
  `@panneau/forms` declares `fields`, `components` and `panels`; `@panneau/lists` `fields`, `displays`, `listLayouts` and the new `filters`, the filter controls of plugins by filter type; `@panneau/actions` `actions`. `@panneau/app`: a plugin can replace a built-in widget type (`stat`), whose data is still checked against the protocol, and the built-in `dashboard` page. `docs/extending.md` describes every kind.
- f8ae53c: The deprecated APIs are removed before the first beta, so that 5.0.0 ships without them. To migrate a project that started on an alpha:
  
  - **Buttons:** `variant="primary"`, `secondary`, `ghost` and `danger` of `Button`, `LinkButton` and `IconButton` are gone, with the `ButtonVariant` type. Run `npx @panneau/codemods@alpha button-variants resources/js` (`--dry` first): it gives each button the `tone` and the `appearance` the alias stood for (`primary` is `tone="accent"`, `ghost` is `appearance="ghost"`, `danger` is `tone="danger"`, `secondary` is the default), and reports what it can't read, such as a `variant` in an object of props. `variant` now only names a variant of the theme.
  - **Tones:** `AlertTone`, `BadgeTone` and `ToastTone` of `@panneau/ui` are gone: use `Tone`.
  - **Messages:** `@panneau/fields/locales`, `@panneau/forms/locales` and `@panneau/ui/locales` are gone: use `en`, `fr` or `withPanneauMessages()` of `@panneau/intl`, which hold the messages of every package.
  - **Pages:** `LinkButton` of `@panneau/app` is gone: use `LinkButton` of `@panneau/ui`, with `tone="accent"` and an icon component (`icon={Plus}`). `back` of `PageHeader` is gone: use `parents={[back]}`.
  
  `@panneau/codemods` has the `button-variants` codemod (`panneau-codemods button-variants <paths>`, or `runCodemods({ codemod: 'button-variants' })`). Inside the packages, every button takes a `tone` and an `appearance`, and a lint rule forbids the aliases.

### Patch Changes

- ecfec65: A keystroke in a form no longer renders every field. `@panneau/forms`: each field subscribes to its own value, errors and visibility, the form to its status, and the layout to what it shows, so a change renders the field that changed and the fields of the same object (its block, or the top of the form: they get it as `parentValue`), not the fields of other blocks. Before, every field rendered on every keystroke. `@panneau/core`: `useFormSelector(form, select)` subscribes a component to a slice of a form's state, and `useFormField()` uses it. `state.errors` keeps the same object, and the same array for each path, while the errors stay the same, and `selectErrors()` returns the same array for the same errors (an empty one is always the same): its return type and that of `form.getErrors()` are now `readonly string[]`.
- 1e60706: A required field inside a hidden tab or section no longer blocks the save (decision 0098). `resolveFields()` and `resolveForm()` of `@panneau/core`, which are public, now give each field the `visibleWhen` of the layout nodes that hold it, combined with its own (`all` of them, `any` of the places of a field placed twice): forms neither show nor validate a field whose tab or section is hidden. The definition sent by the backend doesn't change, but the fields these functions give may have a `visibleWhen` that the definition's don't. The protocol now says that a field in a hidden node is hidden: backends don't validate it nor save its value (laravel-panneau follows in its own release).
- 9e17345: Primitives and tokens used everywhere (#353). `@panneau/ui`: `--panneau-focus-offset`, the gap between an element and its focus ring, which every ring reads; rings outside inputs are outlines, which stay visible in forced colors. `--panneau-frame-bottom` is a semantic token (`0px`), which the dock and the region of toasts set, in place of `--panneau-bottom-offset`: a project that set `--panneau-bottom-offset` sets `--panneau-frame-bottom`. `SegmentedControl` takes `hideLabels`, `Disclosure` takes `headerEnd`, and `prefersReducedMotion()` reads the system's preference. Chevrons that show and hide content point to the end and turn down once it is shown, also in the panels of `Aside`. `@panneau/media`: the empty states of the picker are `EmptyState`s, and the cards of the picker and the stage of the image editor have component tokens (`mediaPickerTokens`, `imageEditorTokens`). `@panneau/lists`: the switch of layouts is a `SegmentedControl`. `@panneau/app`: the runs of `ActionRunsButton` show a `Spinner` and a `Badge`, the summary above a list is a `Disclosure`, and the groups of the sidebar follow the chevrons of `Disclosure`. `@panneau/editor`: paragraphs of the rich text field have the gap of `Prose`.
- 44ba63b: One copy of the shared helpers. A protocol-relative link (`//example.com`) opens in a new tab from a row and from the header of an item, as it does from the editor: every package decides with `isExternalUrl()` of `@panneau/protocol/runtime`. `@panneau/lists`: `ActionButton` is public, and takes `inHeader` (the color of the action, outlined, with the icon of an external link), which the actions of an item in `@panneau/app` now use. `getActionHref()` is no longer public: use `fillActionUrl()` of `@panneau/core`. `@panneau/ui`: `cx()` is public, the one `cx` of every package. `@panneau/core`: `ruleMessages` holds the English messages of the rules by the keys of `@panneau/intl` (`panneau.forms.rule.<key>`), `crop` included, and `formatRuleFailure()` uses them: numbers are formatted (`1,200`) and lists take a serial comma (`YouTube, Vimeo, or Spotify`). `@panneau/media`: the picker's own `formatDuration` is now `formatPlaybackTime`, apart from `formatDuration()` of `@panneau/fields/duration`.
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

### Patch Changes

- 60b8651: The status of a form's footer fades in when it changes, and a toast that closes fades out while the others move into its place, in a view transition where the browser has them.
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

- b9c9189: One aside next to lists and forms (decision 0074). `@panneau/ui` has `Aside`, the column next to the main content of a page or a form, made of `AsidePanel`s, and `AsideLayout`, which places it: beside the content from 56rem of the layout, where it stays in view as the page scrolls, and below the content or over it on narrower layouts. A button widens it, panels with a title collapse, and the browser remembers both under a key (`usePreference`, which moves from the app to `@panneau/ui`). Its look comes from the new `aside` component tokens.
  
  The item panel of lists is an `Aside`: it goes beside the list from 56rem of the list's column, and its close button is labelled "Close". The `--panneau-item-panel-*` tokens and `itemPanelTokens` of `@panneau/app` are gone: set `--panneau-aside-*` instead. The classes of the panel's header, toolbar and body are now those of `.panneau-aside`, and `.panneau-form-layout`, `.panneau-form-sidebar` and `.panneau-form-with-sidebar` give way to `.panneau-aside-layout` and `.panneau-aside`.
  
  The `sidebar` nodes of form layouts are panels of an `Aside`: a card that stays in view as the form scrolls. A `sidebar` with a `label` has a title, which the user can collapse unless `collapsible: false`, and `collapsed: true` starts it collapsed. It opens to show an error. `Form` takes `sidebarStorageKey`, under which the browser remembers its collapsed panels; the app sets it per resource.
- d417492: A dock, in place of the sidebar (decision 0076). With `theme.navigation: "dock"` in the definition, the app shows the `main` menu in a dock at the bottom of the window instead of the sidebar: a raised pill from the `lg` width, where groups open their links in a menu, then "Go to…", the queued action runs and the user's menu (profile, color scheme, log out). On phones, it is a bar of tabs with the first entries and "More" for the others. A bar at the top keeps the site and the current context. `@panneau/protocol` adds `navigation` (`sidebar`, the default, or `dock`) to the definition's theme, and `@panneau/app` exports `dockTokens` (`--panneau-dock-*`). The footer of forms, asides beside the content and toasts stay above the dock (`--panneau-frame-bottom`). Menu items that are links are no longer underlined.
- 51599d6: The panels of a form's sidebar, defined by the resource (decision 0075). A `sidebar` node of a form layout with a `panel` is a block of the app or of a plugin, which gets the node, the form, its fields and its children rendered (`FormPanelProps`), with the node's `props`. A panel that no component provides renders its children.
  
  - Plugins register panels under `panels`, a new kind of `@panneau/core`, and `Form` takes `panels`. In the app, `useFormPage()` gives a panel the resource and the item of its form.
  - Built-in panels: `save` (the state of the form and its Save button) and `errors` (the errors after a failed save) in `@panneau/forms`, which show beside the form only, where the form then has no footer nor summary at the top; `publication` in `@panneau/forms/publication`, with Publish and Unpublish buttons that set the publication and save; `actions` in `@panneau/app`, which takes the actions of the item out of the page header.
  - `AsidePanel` takes `isBesideOnly`, and an aside hides its empty panels.
  - The `pages` of the protocol's example have a sidebar with these panels.
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

- Updated dependencies [041732f]
  - @panneau/protocol@5.0.0-alpha.28
  - @panneau/core@5.0.0-alpha.28
  - @panneau/fields@5.0.0-alpha.28
  - @panneau/ui@5.0.0-alpha.28
  - @panneau/intl@5.0.0-alpha.28

## 5.0.0-alpha.27

### Patch Changes

- Updated dependencies [cac1376]
  - @panneau/fields@5.0.0-alpha.27
  - @panneau/protocol@5.0.0-alpha.27
  - @panneau/core@5.0.0-alpha.27
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

- Updated dependencies [c310e38]
- Updated dependencies [c310e38]
  - @panneau/fields@5.0.0-alpha.23
  - @panneau/intl@5.0.0-alpha.23
  - @panneau/ui@5.0.0-alpha.23
  - @panneau/core@5.0.0-alpha.23
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
