# @panneau/editor

## 5.0.0-alpha.51

### Patch Changes

- Updated dependencies [441351f]
  - @panneau/intl@5.0.0-alpha.51
  - @panneau/fields@5.0.0-alpha.51
  - @panneau/ui@5.0.0-alpha.51
  - @panneau/protocol@5.0.0-alpha.51

## 5.0.0-alpha.50

### Patch Changes

- 489d353: Follow-ups of forms on phones (#503). Before a form on a narrow screen, a sidebar whose button names a single panel (`Publication`) no longer repeats the title of that panel, nor collapses it a second time. The legend of a repeater keeps one line: "Expand all" and "Collapse all" are at its end, only an icon in a narrow field (the class `panneau-repeater-field-bar` is gone). What floats in fields (the "+" between two items of a repeater, the toolbar of the rich text editor, the overlay of a file drop zone) stays under the top bar of the app as the page scrolls, and the toolbar of the rich text editor sticks under that bar. The footer of the form in the related item panel goes from edge to edge of the panel, down to its bottom, on its background.
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

## 5.0.0-alpha.49

### Patch Changes

- Updated dependencies [da59be7]
- Updated dependencies [8c35edc]
- Updated dependencies [f2c5e9f]
  - @panneau/protocol@5.0.0-alpha.49
  - @panneau/ui@5.0.0-alpha.49
  - @panneau/fields@5.0.0-alpha.49
  - @panneau/intl@5.0.0-alpha.49

## 5.0.0-alpha.48

### Patch Changes

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

## 5.0.0-alpha.47

### Patch Changes

- 8ad5274: Rich text: ⌘K (Ctrl+K elsewhere) opens the link dialog on the selection, rather than the app's "Go to…" palette, which still opens outside the editor. The tooltips of the toolbar name the shortcut of their button (⌘B, Ctrl+Shift+8), and buttons have `aria-keyshortcuts`; `RichTextButton` takes a `shortcut`. With a `resource`, a `richtext` field links to items of the site: its link dialog searches them with the relation source, as `page` links of `link` fields do, and still takes a URL (decision 0107). Such a link is `<a href="…" data-page-id="12" data-page-resource="pages">`, and the backend writes the item's URL in `href`. `@panneau/fields/link` exports `PagePicker`. HTML kept as it was written now says what it is ("Embedded video", "Embedded post", "Table", "Image") with its provider and URL, a video of a known provider shows a player drawn in its place, and its element (`figure.media`) is in a tooltip; `HtmlNodeOptions` takes `labels` by `KeptHtmlKind`.
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

## 5.0.0-alpha.46

### Patch Changes

- Updated dependencies [f4f816c]
- Updated dependencies [b146a56]
  - @panneau/ui@5.0.0-alpha.46
  - @panneau/fields@5.0.0-alpha.46
  - @panneau/intl@5.0.0-alpha.46
  - @panneau/protocol@5.0.0-alpha.46

## 5.0.0-alpha.45

### Minor Changes

- db712f6: One way to resolve plugin entries (decision 0097).
  
  **Breaking: the ids of the built-in plugins.** `panneau-fields`, `panneau-lists`, `panneau-media` and `panneau-editor` are now `panneau.fields`, `panneau.lists`, `panneau.media` and `panneau.editor`, without aliases. A plugin id is `{vendor}.{name}`. Nothing reads an id but the check that ids are unique, so this only breaks a project that relies on those strings.
  
  **Breaking for types: the props of the definition are unchecked.** The components and panels of form layouts, and pages, get the `props` of the definition as `WithDefinitionProps<…>`. A component that required one of them (`({ label }: { label: string })`) no longer type-checks: declare them optional, beside the props of its kind (`LayoutComponentProps & { label?: string }`).
  
  `@panneau/core`: `PluginKinds` types the entries of each kind, and packages add theirs by declaration merging. `PanneauPlugin` and `PluginRegistry` derive from it, and `definePlugin()` keeps the type of the plugin. `resolveEntry()`, `getEntries()`, `useEntry()` and `useEntries()` read every kind in one order: built-ins, plugins, then the overrides of the component that renders them, with a warning in development when nothing gives an entry (`warnMissingEntry()`). `PageProps` (the id of a page, the definition, the base path and the params) joins `WidgetProps`, which gets the `currency` and the `period` of built-in widgets. `PluginComponent` and `PluginComponentKind` are deprecated.
  
  `@panneau/forms` declares `fields`, `components` and `panels`; `@panneau/lists` `fields`, `displays`, `listLayouts` and the new `filters`, the filter controls of plugins by filter type; `@panneau/actions` `actions`. `@panneau/app`: a plugin can replace a built-in widget type (`stat`), whose data is still checked against the protocol, and the built-in `dashboard` page. `docs/extending.md` describes every kind.

### Patch Changes

- 9e17345: Primitives and tokens used everywhere (#353). `@panneau/ui`: `--panneau-focus-offset`, the gap between an element and its focus ring, which every ring reads; rings outside inputs are outlines, which stay visible in forced colors. `--panneau-frame-bottom` is a semantic token (`0px`), which the dock and the region of toasts set, in place of `--panneau-bottom-offset`: a project that set `--panneau-bottom-offset` sets `--panneau-frame-bottom`. `SegmentedControl` takes `hideLabels`, `Disclosure` takes `headerEnd`, and `prefersReducedMotion()` reads the system's preference. Chevrons that show and hide content point to the end and turn down once it is shown, also in the panels of `Aside`. `@panneau/media`: the empty states of the picker are `EmptyState`s, and the cards of the picker and the stage of the image editor have component tokens (`mediaPickerTokens`, `imageEditorTokens`). `@panneau/lists`: the switch of layouts is a `SegmentedControl`. `@panneau/app`: the runs of `ActionRunsButton` show a `Spinner` and a `Badge`, the summary above a list is a `Disclosure`, and the groups of the sidebar follow the chevrons of `Disclosure`. `@panneau/editor`: paragraphs of the rich text field have the gap of `Prose`.
- 44ba63b: One copy of the shared helpers. A protocol-relative link (`//example.com`) opens in a new tab from a row and from the header of an item, as it does from the editor: every package decides with `isExternalUrl()` of `@panneau/protocol/runtime`. `@panneau/lists`: `ActionButton` is public, and takes `inHeader` (the color of the action, outlined, with the icon of an external link), which the actions of an item in `@panneau/app` now use. `getActionHref()` is no longer public: use `fillActionUrl()` of `@panneau/core`. `@panneau/ui`: `cx()` is public, the one `cx` of every package. `@panneau/core`: `ruleMessages` holds the English messages of the rules by the keys of `@panneau/intl` (`panneau.forms.rule.<key>`), `crop` included, and `formatRuleFailure()` uses them: numbers are formatted (`1,200`) and lists take a serial comma (`YouTube, Vimeo, or Spotify`). `@panneau/media`: the picker's own `formatDuration` is now `formatPlaybackTime`, apart from `formatDuration()` of `@panneau/fields/duration`.
- Updated dependencies [0bbbeea]
- Updated dependencies [b4d79ec]
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

## 5.0.0-alpha.43

### Patch Changes

- Updated dependencies [2136caf]
  - @panneau/protocol@5.0.0-alpha.43
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
  - @panneau/protocol@5.0.0-alpha.42

## 5.0.0-alpha.41

### Patch Changes

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
  - @panneau/fields@5.0.0-alpha.40

## 5.0.0-alpha.39

### Patch Changes

- @panneau/fields@5.0.0-alpha.39
  - @panneau/intl@5.0.0-alpha.39
  - @panneau/protocol@5.0.0-alpha.39
  - @panneau/ui@5.0.0-alpha.39

## 5.0.0-alpha.38

### Patch Changes

- Updated dependencies [6c3dd8d]
  - @panneau/protocol@5.0.0-alpha.38
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
  - @panneau/fields@5.0.0-alpha.37

## 5.0.0-alpha.36

### Patch Changes

- Updated dependencies [c2b7df7]
- Updated dependencies [6441b21]
  - @panneau/protocol@5.0.0-alpha.36
  - @panneau/intl@5.0.0-alpha.36
  - @panneau/fields@5.0.0-alpha.36
  - @panneau/ui@5.0.0-alpha.36

## 5.0.0-alpha.35

### Patch Changes

- Updated dependencies [60b8651]
- Updated dependencies [1ecdaa8]
  - @panneau/ui@5.0.0-alpha.35
  - @panneau/fields@5.0.0-alpha.35
  - @panneau/intl@5.0.0-alpha.35
  - @panneau/protocol@5.0.0-alpha.35

## 5.0.0-alpha.34

### Patch Changes

- @panneau/fields@5.0.0-alpha.34
  - @panneau/intl@5.0.0-alpha.34
  - @panneau/protocol@5.0.0-alpha.34
  - @panneau/ui@5.0.0-alpha.34

## 5.0.0-alpha.33

### Patch Changes

- Updated dependencies [16fd93b]
  - @panneau/protocol@5.0.0-alpha.33
  - @panneau/fields@5.0.0-alpha.33
  - @panneau/ui@5.0.0-alpha.33
  - @panneau/intl@5.0.0-alpha.33

## 5.0.0-alpha.32

### Patch Changes

- Updated dependencies [5de54d2]
  - @panneau/protocol@5.0.0-alpha.32
  - @panneau/fields@5.0.0-alpha.32
  - @panneau/ui@5.0.0-alpha.32
  - @panneau/intl@5.0.0-alpha.32

## 5.0.0-alpha.31

### Patch Changes

- Updated dependencies [3044946]
  - @panneau/ui@5.0.0-alpha.31
  - @panneau/fields@5.0.0-alpha.31
  - @panneau/intl@5.0.0-alpha.31
  - @panneau/protocol@5.0.0-alpha.31

## 5.0.0-alpha.30

### Patch Changes

- Updated dependencies [8d18be8]
  - @panneau/ui@5.0.0-alpha.30
  - @panneau/fields@5.0.0-alpha.30
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
  - @panneau/fields@5.0.0-alpha.29

## 5.0.0-alpha.28

### Patch Changes

- Updated dependencies [041732f]
  - @panneau/protocol@5.0.0-alpha.28
  - @panneau/fields@5.0.0-alpha.28
  - @panneau/ui@5.0.0-alpha.28
  - @panneau/intl@5.0.0-alpha.28

## 5.0.0-alpha.27

### Patch Changes

- Updated dependencies [cac1376]
  - @panneau/fields@5.0.0-alpha.27
  - @panneau/protocol@5.0.0-alpha.27
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

## 5.0.0-alpha.24

### Patch Changes

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
  - @panneau/protocol@5.0.0-alpha.23

## 5.0.0-alpha.22

### Patch Changes

- Updated dependencies [d8a77d0]
- Updated dependencies [d8a77d0]
  - @panneau/ui@5.0.0-alpha.22
  - @panneau/intl@5.0.0-alpha.22
  - @panneau/protocol@5.0.0-alpha.22
  - @panneau/fields@5.0.0-alpha.22

## 5.0.0-alpha.21

### Patch Changes

- Updated dependencies [2a87620]
  - @panneau/ui@5.0.0-alpha.21
  - @panneau/fields@5.0.0-alpha.21
  - @panneau/intl@5.0.0-alpha.21
  - @panneau/protocol@5.0.0-alpha.21

## 5.0.0-alpha.20

### Patch Changes

- @panneau/fields@5.0.0-alpha.20
  - @panneau/intl@5.0.0-alpha.20
  - @panneau/protocol@5.0.0-alpha.20
  - @panneau/ui@5.0.0-alpha.20

## 5.0.0-alpha.19

### Patch Changes

- Updated dependencies [b547a0a]
- Updated dependencies [f07ce4c]
  - @panneau/protocol@5.0.0-alpha.19
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

### Patch Changes

- Updated dependencies [b200640]
- Updated dependencies [93223bd]
- Updated dependencies [19d0892]
- Updated dependencies [11bcf36]
- Updated dependencies [aae4bf7]
- Updated dependencies [d46a16d]
  - @panneau/protocol@5.0.0-alpha.18
  - @panneau/ui@5.0.0-alpha.18
  - @panneau/intl@5.0.0-alpha.18
  - @panneau/fields@5.0.0-alpha.18

## 5.0.0-alpha.17

### Patch Changes

- Updated dependencies [2a1f32d]
  - @panneau/fields@5.0.0-alpha.17
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
  - @panneau/fields@5.0.0-alpha.15
  - @panneau/ui@5.0.0-alpha.15

## 5.0.0-alpha.14

### Patch Changes

- 4f141f9: The text style select of the rich text field works in a paragraph. It was disabled there, because it asked whether `setParagraph()` could run, which is false in a paragraph: it now asks whether the selection can take any of its styles.
- Updated dependencies [4f141f9]
- Updated dependencies [4f141f9]
  - @panneau/ui@5.0.0-alpha.14
  - @panneau/fields@5.0.0-alpha.14
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
  - @panneau/fields@5.0.0-alpha.13
  - @panneau/intl@5.0.0-alpha.13
  - @panneau/ui@5.0.0-alpha.13

## 5.0.0-alpha.12

### Patch Changes

- Updated dependencies [0a8447e]
  - @panneau/ui@5.0.0-alpha.12
  - @panneau/intl@5.0.0-alpha.12
  - @panneau/fields@5.0.0-alpha.12
  - @panneau/protocol@5.0.0-alpha.12

## 5.0.0-alpha.11

### Patch Changes

- Updated dependencies [84bab2b]
  - @panneau/ui@5.0.0-alpha.11
  - @panneau/fields@5.0.0-alpha.11
  - @panneau/intl@5.0.0-alpha.11
  - @panneau/protocol@5.0.0-alpha.11

## 5.0.0-alpha.10

### Patch Changes

- Updated dependencies [810fc90]
- Updated dependencies [2fcd438]
- Updated dependencies [68f5322]
  - @panneau/protocol@5.0.0-alpha.10
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
  - @panneau/fields@5.0.0-alpha.9
  - @panneau/intl@5.0.0-alpha.9

## 5.0.0-alpha.8

### Patch Changes

- 83c82d4: The declaration files work in TypeScript projects on `"module": "NodeNext"`. Their relative specifiers now name their file (`./schemas/index.js`, `./rest.js`), so the types that an entry point re-exports, such as `Definition` of `@panneau/protocol`, are no longer missing under Node's resolution, and the CSS Modules that some declarations imported are declared in place. Nothing changes for projects on the `Bundler` resolution.
- Updated dependencies [6e76c06]
- Updated dependencies [83c82d4]
- Updated dependencies [477d974]
  - @panneau/ui@5.0.0-alpha.8
  - @panneau/fields@5.0.0-alpha.8
  - @panneau/intl@5.0.0-alpha.8
  - @panneau/protocol@5.0.0-alpha.8

## 5.0.0-alpha.7

### Minor Changes

- 060e0de: Add `@panneau/editor` (#128, decision 0007): the `richtext` field, on TipTap 3, which stores HTML. `editorPlugin` provides the field type; `createEditorPlugin({ extensions, buttons })` adds the TipTap extensions of a project (an inline logo) and the toolbar buttons that insert them.
  
  - The definition sets the toolbar, the heading levels, block styles (a named class on an element: `<p class="big">`) and which links open in a new tab, in `settings`. `@panneau/protocol` describes them with `RichTextSettings` and `RichTextStyle`, and `validateDefinition()` checks them.
  - HTML written by CKEditor 4 and 5 loads as it was written, and the field gives nothing back until the text is edited. Once edited, it renders the same: the field keeps every heading level, the attributes and classes of blocks and marks, `<b>` and `<i>`, bare list items, and the HTML it doesn't edit (media embeds, iframes, tables, social posts), shown in the editor without rendering it.
  - Nothing that would run a script reaches the admin (decision 0035): HTML the field doesn't edit is shown inert, and the elements it renders lose their event handlers and `javascript:` URLs.
  - Pasted content brings its text, structure, links and marks, not the styles and wrappers of its page (Google Docs, web pages); only content copied from a rich text field of the same page pastes in full.
  - `normalizeRichText()` gives the HTML the field would save for existing content, to check it before a migration.
  - `@panneau/intl` has the messages of the editor, in English and French (`editorMessages`).

### Patch Changes

- Updated dependencies [9c6c087]
- Updated dependencies [060e0de]
- Updated dependencies [fb534de]
- Updated dependencies [fb534de]
  - @panneau/fields@5.0.0-alpha.7
  - @panneau/ui@5.0.0-alpha.7
  - @panneau/protocol@5.0.0-alpha.7
  - @panneau/intl@5.0.0-alpha.7
