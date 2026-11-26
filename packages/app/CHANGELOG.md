# @panneau/app

## 5.0.0-alpha.55

### Minor Changes

- d4d906c: The density picker of the user's menu and "Go to…" offers Compact, Comfortable and Large (the `touch` density) instead of "Default". Until the user chooses, the button that matches the definition's density is checked, and choosing it again goes back to the definition's. A value kept by the old "Default" reads as no choice (decision 0104).
- 62b636f: Lists take the keyboard, on the registry of shortcuts (decision 0112), listed in the "?" help: `j`/`k` and the arrows move between the rows of the table and the cards, Enter opens the focused item, `x` selects it, Shift with a move or a click on a checkbox extends the selection, Esc clears it, `/` goes to the search. On the page of a resource, `c` does what "New …" does.
- bcc61ea: The "Go to…" palette acts on the current page (decision 0116). A new "On this page" group, at the top, offers the actions of the item open in its form or panel, which run as their buttons do (same confirmation, runner and toasts), and the commands of plugins that apply. `CommandContext` gets the current `page` (`route`, `resource`, `item`, `selection`), a `Command` declares when it applies with `when(context)`, and `perform(context)` gets the context. Commands without `when` show in their group as before. `@panneau/core` adds `appliesTo()` and `hasSelection()`.

### Patch Changes

- Updated dependencies [d4d906c]
- Updated dependencies [62b636f]
- Updated dependencies [bcc61ea]
  - @panneau/intl@5.0.0-alpha.55
  - @panneau/lists@5.0.0-alpha.55
  - @panneau/core@5.0.0-alpha.55
  - @panneau/actions@5.0.0-alpha.55
  - @panneau/fields@5.0.0-alpha.55
  - @panneau/forms@5.0.0-alpha.55
  - @panneau/ui@5.0.0-alpha.55
  - @panneau/data@5.0.0-alpha.55
  - @panneau/protocol@5.0.0-alpha.55

## 5.0.0-alpha.54

### Minor Changes

- e65232f: The definition can have a `logo`, the URL of an image of the site's logo. The shell draws it in the square of the logo, in the sidebar, the top bar of the dock and the skeleton at boot, instead of the first letter of the site's name.

### Patch Changes

- 99e124e: From the `lg` width, the sticky footer of a resource form spans the panel of the shell from edge to edge, on the panel's background, instead of a band of the page's background that stops at the panel's padding (visible in dark mode). The shells' panels clip it (`overflow-x: clip`). Below `lg`, the fixed footer doesn't change.
- Updated dependencies [50f8638]
- Updated dependencies [e65232f]
- Updated dependencies [bf0bd9f]
  - @panneau/protocol@5.0.0-alpha.54
  - @panneau/lists@5.0.0-alpha.54
  - @panneau/actions@5.0.0-alpha.54
  - @panneau/core@5.0.0-alpha.54
  - @panneau/data@5.0.0-alpha.54
  - @panneau/fields@5.0.0-alpha.54
  - @panneau/forms@5.0.0-alpha.54
  - @panneau/ui@5.0.0-alpha.54
  - @panneau/intl@5.0.0-alpha.54

## 5.0.0-alpha.53

### Patch Changes

- Updated dependencies [efb2142]
  - @panneau/ui@5.0.0-alpha.53
  - @panneau/fields@5.0.0-alpha.53
  - @panneau/lists@5.0.0-alpha.53
  - @panneau/actions@5.0.0-alpha.53
  - @panneau/forms@5.0.0-alpha.53
  - @panneau/core@5.0.0-alpha.53
  - @panneau/data@5.0.0-alpha.53
  - @panneau/intl@5.0.0-alpha.53
  - @panneau/protocol@5.0.0-alpha.53

## 5.0.0-alpha.52

### Patch Changes

- 8f02df8: The details of a connection in the account page (#513) wrap instead of being cut with an ellipsis, so access, dates and expiry stay readable on a phone. In French, "créée le" and "utilisée le" become "création le" and "dernière utilisation le", which agree with a personal token as with an app.
- Updated dependencies [fae7983]
- Updated dependencies [8f02df8]
- Updated dependencies [fb3f8d8]
  - @panneau/fields@5.0.0-alpha.52
  - @panneau/intl@5.0.0-alpha.52
  - @panneau/ui@5.0.0-alpha.52
  - @panneau/lists@5.0.0-alpha.52
  - @panneau/forms@5.0.0-alpha.52
  - @panneau/actions@5.0.0-alpha.52
  - @panneau/core@5.0.0-alpha.52
  - @panneau/data@5.0.0-alpha.52
  - @panneau/protocol@5.0.0-alpha.52

## 5.0.0-alpha.51

### Patch Changes

- 441351f: The connections of the account (#507, decision 0113). The data adapter has `listConnections()`, `createConnectionToken()` and `revokeConnection()` (`GET /account/connections`, `POST /account/connections/tokens`, `DELETE /account/connections/{connection}`), and `queryKeys.connections()`. With `agents.mcp` in the definition, the account page has a "Connections" section: the address of the MCP server to copy, the personal tokens and the apps that let agents in as the user (read, or read and change; made, last used, expires), revoking one after a confirmation that names it, and, when `agents.mcp.tokens` is true, a dialog that makes a personal token, shown once with a button that copies it and forgotten when the dialog closes. Creating and revoking ask for the password when the backend needs a recent one (`423`), as passkeys do.
- 691f6ef: After the login, the app goes to a same-origin `next` (#508). In `panneau` auth mode, when the app is opened with `?next=` holding a path of its origin (such as the authorization page of the backend's OAuth server), a guest who logs in, with a password, a second factor, a passkey or a provider (whose callback brings the user back to the app with its `next`), goes there with a full page load, and a user who is already logged in goes there right away. A `next` that isn't a same-origin path is ignored. A target that sends a logged-in user straight back with the same `next` isn't followed again.
- Updated dependencies [441351f]
  - @panneau/data@5.0.0-alpha.51
  - @panneau/intl@5.0.0-alpha.51
  - @panneau/actions@5.0.0-alpha.51
  - @panneau/forms@5.0.0-alpha.51
  - @panneau/lists@5.0.0-alpha.51
  - @panneau/fields@5.0.0-alpha.51
  - @panneau/ui@5.0.0-alpha.51
  - @panneau/core@5.0.0-alpha.51
  - @panneau/protocol@5.0.0-alpha.51

## 5.0.0-alpha.50

### Patch Changes

- 85067b3: Forms on phones (#501). Below 56rem, the sidebar of a form comes before its fields, collapsed to one line that names its panels (`Publication · Files`), with the error badge of its fields; it opens on a revealed field or an error, and has no box of its own, so its fields are as wide as the form's (decision 0075, amended). `AsideLayout` takes `narrow="before"` and `onBeforeChange`, and `Aside` takes `summary`, `summaryEnd`, `isExpanded` and `onExpandedChange`. The switch of a localized field stays on the line of its label: the label wraps first, and "Copy from …" is only its icon in a narrow field. A narrow repeater puts the tools of an item in a menu ("Actions for item 1"), so that its title keeps the room of its header. On a phone, the save bar of the app's form page is fixed at the bottom of the screen, from edge to edge, on the background of the page's card.
- 489d353: Follow-ups of forms on phones (#503). Before a form on a narrow screen, a sidebar whose button names a single panel (`Publication`) no longer repeats the title of that panel, nor collapses it a second time. The legend of a repeater keeps one line: "Expand all" and "Collapse all" are at its end, only an icon in a narrow field (the class `panneau-repeater-field-bar` is gone). What floats in fields (the "+" between two items of a repeater, the toolbar of the rich text editor, the overlay of a file drop zone) stays under the top bar of the app as the page scrolls, and the toolbar of the rich text editor sticks under that bar. The footer of the form in the related item panel goes from edge to edge of the panel, down to its bottom, on its background.
- 687391c: Edit a related item in a panel, without leaving the form (#471, decision 0110): the card of a relation field has "Edit" on the items the user can update, which opens the item's form in the panel over the page that creates related items. Saving updates the item and its card at once, closes the panel and brings the focus back to the card; the form underneath keeps its values and its unsaved changes. In the app's forms, the link of a card opens the item's page in a new tab. `createRelationSource()` takes `editItem` and `linksInNewTab`; `RelationSource` has `edit()`, `canEdit()` and `edited()`; `useRelationReferences()` takes `resolveAll`. New messages: `panneau.fields.edit`, `panneau.fields.editRelation`, `panneau.fields.editRelationFailed`, `panneau.app.itemUpdateForbidden` and `panneau.app.itemGone`, in English and French.
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
  - @panneau/forms@5.0.0-alpha.50
  - @panneau/fields@5.0.0-alpha.50
  - @panneau/intl@5.0.0-alpha.50
  - @panneau/data@5.0.0-alpha.50
  - @panneau/lists@5.0.0-alpha.50
  - @panneau/actions@5.0.0-alpha.50
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
  - @panneau/lists@5.0.0-alpha.49
  - @panneau/forms@5.0.0-alpha.49
  - @panneau/fields@5.0.0-alpha.49
  - @panneau/intl@5.0.0-alpha.49
  - @panneau/actions@5.0.0-alpha.49
  - @panneau/core@5.0.0-alpha.49
  - @panneau/data@5.0.0-alpha.49

## 5.0.0-alpha.48

### Minor Changes

- 54fbe80: One registry of keyboard shortcuts, and a "?" help (decision 0112). `PanneauRoot` keeps the registry, with one listener on the document: `useShortcut()` of `@panneau/ui` registers a shortcut while a component is mounted, with its keys (`Mod+K`, ⌘ on Apple platforms and Ctrl elsewhere), a label, a group, a scope and `perform`. The element that holds the focus gets a key first, then the open dialog, then the page; a shortcut of the page never fires under a dialog. Single keys (`?`) never fire while the user types, and users can turn them off in the help, which the browser remembers (`panneau:single-key-shortcuts`). `?` opens the help, a dialog that lists the shortcuts registered now by group, also from the user's menu and "Go to…" (`useShortcutHelp()`); it loads when it first opens. `formatShortcut()`, `useFormatShortcut()` and `useShortcutLabel()` format keys for tooltips and `aria-keyshortcuts`, in the Save button, the sidebar, the dock and the editor's toolbar. ⌘K, ⌘\ and ⌘S / ⌘Enter move to the registry with the same behaviour, except that ⌘\ is ⌘\ only on Apple platforms and no longer works under a dialog; a form shown without a `PanneauRoot` no longer takes ⌘S. Plugins add `shortcuts`, as they add `commands`: an id, keys, a label, a group and `perform` (`Shortcut`, `getShortcuts()` of `@panneau/core`). `@panneau/intl`: `panneau.forms.saveShortcut` is gone (the tooltip of Save comes from the formatter); new messages for the help, `panneau.app.toggleSidebar` and `panneau.forms.shortcutsGroup`.

### Patch Changes

- 9298806: "Copy from …" for localized fields, and an optional language switch for a form. An empty language of a localized field can be copied from a filled one, which makes the form dirty like any edit. A form can ask for one language switch above its fields: `form.languageSwitch: true` on a resource in the definition, or `languageSwitch` on `FormView` and `Form`. It sets the language of every localized field at once, says which languages have errors or miss required values, is remembered by the browser for every form with the switch, and moves to the language of an error reached from the summary or after a failed save; a field can still switch on its own until the form's switch changes again. Without the setting, the default, each localized field keeps its own switch only, as before. `@panneau/fields` exports `ContentLocaleContext`, `useContentLocale()` and `useFieldLocale()` (decision 0108).
- 674aeec: Create a related item without leaving the form (decision 0110). In the app, a relation field offers "Create “text”" when the user can create in the related resource: it opens a panel over the page with the whole create form of that resource (its type first, when it has types), with the text as its title. Saving adds the new item to the field, closes the panel and brings the focus back to the field, and the form underneath keeps its unsaved values. Closing the panel with unsaved changes asks first, and ⌘ S saves the panel's form, not the page's. Inside the panel, relation fields don't offer to create, and their cards open in a new tab. `createRelationSource()` takes `createItem`, which creates the item somewhere else (such as that panel) and resolves with it; a source with `linksInNewTab` opens the links of its cards in a new tab; a resource whose types all forbid creation offers no "Create …".
- Updated dependencies [291ac00]
- Updated dependencies [9298806]
- Updated dependencies [54fbe80]
- Updated dependencies [f9ff33d]
- Updated dependencies [2451268]
- Updated dependencies [674aeec]
  - @panneau/lists@5.0.0-alpha.48
  - @panneau/intl@5.0.0-alpha.48
  - @panneau/protocol@5.0.0-alpha.48
  - @panneau/fields@5.0.0-alpha.48
  - @panneau/forms@5.0.0-alpha.48
  - @panneau/ui@5.0.0-alpha.48
  - @panneau/core@5.0.0-alpha.48
  - @panneau/actions@5.0.0-alpha.48
  - @panneau/data@5.0.0-alpha.48

## 5.0.0-alpha.47

### Patch Changes

- 2aab034: Save only what changed, from anywhere on the page. The Save button of an update without changes is disabled: it stays in the tab order, says "No changes to save" to assistive technologies, and submitting the form (Enter in a field, a shortcut) sends no request. A create form can always be saved. ⌘ S and ⌘ Enter (Ctrl S and Ctrl Enter elsewhere) save the form of the page wherever the focus is, and the form of an open dialog (the parameters of an action) rather than the page under it; ⌘ S never opens the browser's "Save page" while a form is shown. `FormView` and `Form` take `onDirtyChange`, and the app marks the title of the tab (`• `) while the form of an item has unsaved changes.
- 092348f: The profile form of the account page is now a form of `@panneau/forms`: it says when it has unsaved changes, asks before the page is left with them ("Leave without saving?"), saves with ⌘ Enter (Ctrl Enter elsewhere), and checks that the name and the email are filled in before sending them.
- 35b9955: Fields, columns, filters and pages without a `label` show their key made readable instead of the key as written: `published_at` reads "Published at", `author_id` reads "Author", `seo.title` reads "Seo title". The same fallback names fields, list columns, filters and their chips, sort options, the columns menu, the details of an item, the error summary and the conflict dialog of a form, inline editing, the filters of the media picker, and the pages in the navigation and the "Go to…" palette. A label given by the definition is shown as given, an empty one included. `@panneau/protocol/runtime` exports the fallback: `humanizeKey()`, `labelOrKey()` and `getFieldLabel()`.
- a55f51b: Confirmations and toasts of actions name the item or the resource (decision 0062). The confirmation of the built-in `delete` names what it deletes in its title: "Delete “Spring contest”?", "Delete 3 articles?"; the confirmation of another action says it in its message: "“Archive” will apply to 3 articles.". `ConfirmDialog` takes `itemLabel` (the title of the item) and `labels` (the resource's singular and plural), and `ListView` takes `resourceLabel` for its confirmations: the app passes them, by the `itemTitle` and `label` of the resource. An action that fails from the header of an item names it: "“Archive” failed for “Spring contest”.". The mock backend's delete writes the message we want backends to write: "“Spring contest” deleted.", "Page deleted.", "3 pages deleted.", in place of "1 deleted.". New messages in `@panneau/intl`, in English and French: `confirmDeleteTitle` and `confirmMessageFor` of `listsMessages`. `ConfirmDialog` loads its dialog with `import()` when a confirmation first opens, out of the JavaScript of the first page.
- ecf96f3: The calendar of a list says when a month has no items ("No items in November 2026"), in an empty state where its grid would be, with its buttons to the other months above it, rather than a grid of empty days; it doesn't say so while the items of the month load. Each item shows its state next to its title, as a dot in the tone of its option, the tone of its badge in the table and the cards, with the state's label for screen readers, and its whole title on hover. `ListView` takes `itemStatus`, the field that holds the state of items (`itemStatus` of the resource, decision 0103), which the app passes; layouts get `getItemStatus()`, and `ListCalendarProps` has `isLoading`. The built-in calendar layout loads with `import()` when a list shows it, with a skeleton of its grid meanwhile.
- d64edfc: The header of a page keeps its place from page to page, and its actions keep theirs whatever the length of the title. A `narrow` page (`PageLayout width="narrow"`: forms without a sidebar, the account page, the page that chooses a type) now narrows its content from the start of the column, and no longer its header: the title, the back link and the actions of an item are at the same place on a list, on a form with a sidebar and on a form without one. In the header, the title takes the space left by the actions and wraps, whole, and the actions stay at the end of the title's row; below 48rem of the root, they go under the title.
  
  For themes that target the classes of the header: `.panneau-pages-header` is a grid, `.panneau-pages-header-title` is now the `h1` itself, and the back link or the breadcrumbs are in a new `.panneau-pages-header-parents`.
- 09cca06: A token for the accent as text, for theme authors: `--panneau-color-accent-strong`. The outline, subtle and ghost appearances of the accent tone (the Edit action of each row), the icon of a context page, and links that fall back to the accent now write it instead of the accent itself, which stays the fill of the main action with `--panneau-color-accent-text` on it. A theme that sets `panneau-color-accent` gets a value derived from it: the accent, darkened or lightened until it reaches 4.5:1 on the theme's background, surface and accent subtle background, in each scheme. So a light accent, such as a yellow main action, keeps its accent-toned text readable with tokens only. A theme can set the token itself, and a project that overrides the accent with its own class sets it too. `checkTheme()` checks it on the background, the surface and the accent subtle background, and `bootstrapTheme` maps it to `--bs-primary-text-emphasis`. The default theme is unchanged.
- 092183f: Opening an item from its list no longer renders the list again. An item that opens in its panel because it can't be updated (with `open` left to `edit`) used to empty the page until it loaded, then render the list again with new rows, losing its scroll, hover and focus. The list now stays mounted, and only the panel mounts, with its skeleton, and unmounts when it closes. A link to an item shows the list and the panel's skeleton while it loads, then goes to the item's form when it opens there (decision 0101).
- 3279d78: Going back to a list from an item's form shows it as the user left it. The link above the title, the breadcrumbs and the page after a delete now open the list's last URL in the tab, with its filters, sort, page or cursor, search and layout, rather than the bare list with its remembered view. The menus and a create still open the bare list. The browser's Back and Forward restore the scroll of the page they go to; any other navigation still starts at the top and moves the focus to the title (decision 0102).
- 1c63342: Items open from the cache when their link in a list was hovered or focused: the form or the panel shows without its skeleton. Resting the pointer on the link of an item for 100 ms, or focusing it, prefetches the item, unless it is still fresh; a pointer crossing rows and the hover of touch fetch nothing. New: `usePrefetchItem()` in `@panneau/data/query`, and the `onItemIntent` prop of `ListView` and of list layouts in `@panneau/lists`, which lists without a data layer can leave out.
- 9e90547: The "Go to…" palette opens an item where its title opens in its list: its form, or its panel when its resource has `"open": "panel"` or the user can't update the item (decision 0082). Search results and recent items used to always open the form. Recent items now remember whether the user could update the item; those recorded before open the show route, which goes to the form once the item says it can be updated. The palette also highlights, in labels, the first match of each word of the query, ignoring case and accents. `CommandPalette` of `@panneau/ui` takes `highlightMatches` for this, with the `match-bg`, `match-color` and `match-font-weight` tokens; the marks are presentational, so screen readers read labels as before.
- 55eced0: Users choose the density. The user's menu has "Density" after "Appearance": Compact, Comfortable, and Default, the density of the definition's theme, checked until the user picks another. "Go to…" offers the same choices. The browser remembers the choice, like the color scheme (`panneau:density`). With the `auto` density, touch screens keep the touch density whatever the user chose, and have no choice. `theme.lockDensity: true` in a definition hides the choice and ignores one kept in the browser.
- f8c5d4f: Lists keep their header and their selection in view, open an item from anywhere on its row, and offer to create the first item (#443). `@panneau/lists`: the header of the table and the selection bar, with its actions, stick under the top of the window while the list scrolls, in every density; a table wider than the list scrolls in its own box, as high as the window, where its header sticks. A click on a row, a card or a tile outside its controls (checkbox, actions, cells edited in place, links) follows the link of its title, so ⌘-click, Ctrl-click and a middle click open it in a new tab; the title stays the only link and tab stop of the row, and text in a row can still be selected. In select mode, a click on a row selects its item. `ListView` takes `emptyAction`, a node or `{ label, href }`, shown in a list without items, filters or search. A selected row of the table reads darker than a hovered one, which still shows over it (#405). `@panneau/ui`: `--panneau-frame-top`, a semantic token (`0px`), the space the frame of the app takes at the top of the window, under which what sticks to the top stays. `@panneau/app`: the top bar of a small screen sets it, and an empty list of a resource the user can create in shows "New …", with the menu of its types.
- d256517: List filters say which are active, keep the secondary ones in "More filters", and fit a phone. A filter control with a value is marked, in the tones of what is selected (`--panneau-selected-*`), with a button that clears it. A filter of the definition shows first in the toolbar with `"primary": true`; the others are behind a "More filters" button, with the count of those that are active, and without any `primary`, the first 3 show first. A filter with a value keeps its chip under the toolbar. In a narrow list (a phone), every filter is behind one "Filters" button with the count of the active ones, which opens them in a sheet, next to the search. The page sizes of a list are a setting of the resource: `perPageOptions` of its list, 10, 20, 50 and 100 by default, which `resolveList()` of `@panneau/core` now gives (`DEFAULT_PER_PAGE_OPTIONS`) and the app offers. A page size the browser remembers for a list that it no longer offers falls back to the list's `perPage`.
- 1350d30: A form no longer drops what is being typed when its item gets a new version (a refetch on focus, after an action, or a save while typing). A form without unsaved changes takes the new version; a form with unsaved changes keeps them, says that a newer version was saved, and its "Compare" opens the conflict dialog. New: `form.refresh(item)`, `form.reviewNewer()` and `newer` in the form state in `@panneau/core`, and the `item` prop of `Form` in `@panneau/forms`.
- 9a26df5: Edits in place show at once (decision 0105). A cell of a list shows the value it saves right away and stays usable: a value picked while it saves is saved after it, with the version the first save got, and a failed save puts the value back and says why. `useUpdateItem(resource, { optimistic: true })` writes the values at once in the cached item and in every cached list that holds it, sends the edits of an item one after the other without a stale `If-Match`, and puts back only the edit that failed. The list of a resource in the app uses it; the form's save is unchanged.
- Updated dependencies [2aab034]
- Updated dependencies [79abfd4]
- Updated dependencies [06f3e83]
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
- Updated dependencies [52083a1]
- Updated dependencies [4686a26]
- Updated dependencies [1350d30]
- Updated dependencies [9a26df5]
  - @panneau/forms@5.0.0-alpha.47
  - @panneau/intl@5.0.0-alpha.47
  - @panneau/fields@5.0.0-alpha.47
  - @panneau/ui@5.0.0-alpha.47
  - @panneau/actions@5.0.0-alpha.47
  - @panneau/protocol@5.0.0-alpha.47
  - @panneau/core@5.0.0-alpha.47
  - @panneau/lists@5.0.0-alpha.47
  - @panneau/data@5.0.0-alpha.47

## 5.0.0-alpha.46

### Patch Changes

- 0e4d88a: Search the related resource in the `relation` filters of resource lists: the app now gives a relation source to the fields context of every page (lists and their filters, item panels, forms), not just to forms.
- b146a56: Opening an item no longer reflows its list: the item panel of list pages goes over the list, on its right, at every width, so a table stays a table and keeps its columns (#366, decision 0099). `AsideLayout` takes `placement="overlay"` for this; forms keep their aside beside them.
  
  The list page no longer takes the whole width while an item is open, and loses its `panneau-pages-with-panel` class.
- Updated dependencies [0e4d88a]
- Updated dependencies [f4f816c]
- Updated dependencies [b146a56]
  - @panneau/lists@5.0.0-alpha.46
  - @panneau/ui@5.0.0-alpha.46
  - @panneau/actions@5.0.0-alpha.46
  - @panneau/fields@5.0.0-alpha.46
  - @panneau/forms@5.0.0-alpha.46
  - @panneau/core@5.0.0-alpha.46
  - @panneau/data@5.0.0-alpha.46
  - @panneau/intl@5.0.0-alpha.46
  - @panneau/protocol@5.0.0-alpha.46

## 5.0.0-alpha.45

### Minor Changes

- 62d73ad: The boot config is validated after the first paint (decision 0096, #346): Zod and the schemas of the protocol load with `import()`, out of the JavaScript a page loads up front. A minimal app goes from 1514 KB to 1328 KB minified (486 KB to 427 KB gzip). `@panneau/app`: `createPanneauApp()` still throws when the page has no boot config, or when it isn't JSON; it shows the skeleton of the shell while it validates the boot config, and an error page when it is invalid, with the invalid paths in the console. **`PanneauApp.config` is now a promise** of the validated config, which rejects when it is invalid: `await app.config`. `readBootConfig()` doesn't change. `@panneau/data`: the REST adapter loads the schemas while it fetches the definition, and with the response of an action.
- b4d79ec: Breadcrumbs in the page header (decision 0093). `@panneau/protocol`: resources and pages take an optional `parent`, a page of `pages` (or for a page, a resource: `{ "resource": "jobs" }`), which `lintDefinition()` checks. `@panneau/ui`: a crumb of `Breadcrumbs` whose `label` is `undefined` is a skeleton, and the current page's label is cut before its parents'. `@panneau/app`: `PageHeader` takes `parents`, by default those of the route the app renders; one parent is the link above the title, two or more are breadcrumbs from 48rem of the root and a link to the nearest parent below it, with `crumbLabel` and `isLoading` (a skeleton for the title and its crumb). `back` is deprecated: use `parents={[back]}`. The title of an item's form is a skeleton while the item loads, the title of the tab names the parents, and a resource or a page that isn't in the menus keeps its nearest parent there current.
- 9dc08d7: Lists ask for the fields they show, and relation fields resolve their ids in one request. `@panneau/lists`: `useListFields()` gives the fields that a `ListView` shows of its items (its columns shown, the title and the image of items, the field of the calendar), and `getListFields()` computes them, for the `fields` of the list query; `undefined` with a column that has `render` or a layout that isn't built in. `@panneau/app`: the list of a resource sends them. `@panneau/fields`: `createRelationSource().resolve()` asks for the ids of every field of a form in one list query on `filter[ids]` (by groups of 100), instead of a `get()` per id, keeps the items in its new `items` option (the item queries of the query client, in the app), and has a new `peek()`, the reference of an item it already has; `useRelationReferences()` no longer keeps a cache of its own, and `RelationListAdapter` no longer has `get()`. `@panneau/data`: lists and items stay fresh for 30 seconds, until a mutation invalidates them. `@panneau/protocol`: `MAX_PER_PAGE` (100), the most items a page has: `perPage`, `perPageOptions` and `calendar.perPage` of a list are at most 100, the mock backend caps `perPage` there and gives the fields of `fields` only, and the conformance checks both (`list.per-page`, `list.fields`, where a backend can also give the values of `itemTitle` and `itemImage`).
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
- 323fdeb: Less JavaScript to load before the first page (#346): a minimal app goes from 2082 KB to 1600 KB minified (609 KB to 499 KB gzip). `@panneau/app`: the auth pages and the account page load on first use, with the skeleton of their shape until then, and the README's setup adds `@react-aria/optimize-locales-plugin` to the Vite config, to keep React Aria's strings to the app's languages. `@panneau/fields`: the entries of `builtInFields` with heavy code (`tel` and the metadata of phone numbers, `location`, `address`, `link`, `embed`, `file`, `country`, `region`, `color`, `json`, `daterange`, `duration`, `money`) load on first use, with the skeleton of the field until then; `lazyFieldEntry()` does the same for the types of plugins. `@panneau/lists`: the `tel` display loads with the first number shown, which shows as it is until then.

### Patch Changes

- 4581619: Each built-in widget of the dashboard (`stat`, `series`, `breakdown`, `metric`, `table`, `list`) has its own module, with the formats they share in another, and the registry of the built-in widgets (decision 0097) in `dashboard/widgets`. Nothing changes for users.
- 71606e5: The dashboards load on first use (#346): the dashboard pages, and the grid of widgets of the summaries above lists, with the cards of their widgets as a skeleton while their code loads. A minimal app goes from 1551 KB to 1511 KB minified (488 KB to 485 KB gzip).
- 62b099c: `ListView` and `List` group their props by what they are about, before the API freezes in 5.0:
  
  - `actions={{ available, onRun, preview, icons, primary }}` takes the place of `actions`, `onAction`, `previewAction`, `actionIcons` and `primaryAction`;
  - `inline={{ fields, onEdit, formatError }}` takes the place of `inlineEdit`, `onInlineEdit` and `formatError`;
  - `layouts={{ available, current, onChange, components }}` takes the place of `layouts`, `layout`, `onLayoutChange` and `layoutComponents`.
  
  To migrate, run `npx @panneau/codemods@alpha list-view-props resources/js` (`--dry` first). It rewrites the props of `ListView` and `List`, and reports the props spread on them: spreading what `resolveList()` gives (`{...resolved}`) no longer fits, since its `actions`, `layouts` and `inlineEdit` go in the objects. Give its `columns`, `filters`, `search`, `selectable`, `calendar` and `perPageOptions` as props, and the rest in the objects. The types of the objects are exported: `ListViewActions`, `ListViewInline` and `ListViewLayouts`, with `ListInlineEditHandler` and `ListInlineEditEvent`.
- 3117891: Panneau's messages load on first use, in the language the app shows (#346): a minimal app goes from 1600 KB to 1544 KB minified (499 KB to 485 KB gzip). `@panneau/intl`: `loadPanneauMessages(locale)` loads the messages of every package for a locale with an `import()` the first time, and `getLoadedPanneauMessages(locale)` returns them once loaded. `@panneau/ui`: `PanneauRoot` loads them, and renders in English until then, without the English catalog. `@panneau/app`: the app waits for them with the messages of the plugins. `@panneau/fields` and `@panneau/lists`: `locales.fr` of `fieldsPlugin` and `listsPlugin` is a loader. The thumbnails of the embed display, the embed field and the media field load when scrolled to (`loading="lazy"`).
- 9e17345: Primitives and tokens used everywhere (#353). `@panneau/ui`: `--panneau-focus-offset`, the gap between an element and its focus ring, which every ring reads; rings outside inputs are outlines, which stay visible in forced colors. `--panneau-frame-bottom` is a semantic token (`0px`), which the dock and the region of toasts set, in place of `--panneau-bottom-offset`: a project that set `--panneau-bottom-offset` sets `--panneau-frame-bottom`. `SegmentedControl` takes `hideLabels`, `Disclosure` takes `headerEnd`, and `prefersReducedMotion()` reads the system's preference. Chevrons that show and hide content point to the end and turn down once it is shown, also in the panels of `Aside`. `@panneau/media`: the empty states of the picker are `EmptyState`s, and the cards of the picker and the stage of the image editor have component tokens (`mediaPickerTokens`, `imageEditorTokens`). `@panneau/lists`: the switch of layouts is a `SegmentedControl`. `@panneau/app`: the runs of `ActionRunsButton` show a `Spinner` and a `Badge`, the summary above a list is a `Disclosure`, and the groups of the sidebar follow the chevrons of `Disclosure`. `@panneau/editor`: paragraphs of the rich text field have the gap of `Prose`.
- 44ba63b: One copy of the shared helpers. A protocol-relative link (`//example.com`) opens in a new tab from a row and from the header of an item, as it does from the editor: every package decides with `isExternalUrl()` of `@panneau/protocol/runtime`. `@panneau/lists`: `ActionButton` is public, and takes `inHeader` (the color of the action, outlined, with the icon of an external link), which the actions of an item in `@panneau/app` now use. `getActionHref()` is no longer public: use `fillActionUrl()` of `@panneau/core`. `@panneau/ui`: `cx()` is public, the one `cx` of every package. `@panneau/core`: `ruleMessages` holds the English messages of the rules by the keys of `@panneau/intl` (`panneau.forms.rule.<key>`), `crop` included, and `formatRuleFailure()` uses them: numbers are formatted (`1,200`) and lists take a serial comma (`YouTube, Vimeo, or Spotify`). `@panneau/media`: the picker's own `formatDuration` is now `formatPlaybackTime`, apart from `formatDuration()` of `@panneau/fields/duration`.
- Updated dependencies [0bbbeea]
- Updated dependencies [62d73ad]
- Updated dependencies [b4d79ec]
- Updated dependencies [ecfec65]
- Updated dependencies [1e60706]
- Updated dependencies [e0865af]
- Updated dependencies [62b099c]
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
  - @panneau/forms@5.0.0-alpha.45
  - @panneau/lists@5.0.0-alpha.45
  - @panneau/intl@5.0.0-alpha.45
  - @panneau/fields@5.0.0-alpha.45
  - @panneau/actions@5.0.0-alpha.45

## 5.0.0-alpha.44

### Minor Changes

- 333cb75: Empty states, avatars, tiles, button groups and breadcrumbs (decision 0092). `@panneau/ui` exports `EmptyState` (an icon, a title, a description and actions, in two sizes), `Avatar` and `AvatarGroup` (a picture, or initials on a tint of a chart color picked from the name, with a ring in a tone and a status in words for a state of the person), `Tile` and `TileGroup` (a media, a title, a description and actions, and the whole tile a link with `href`), `ButtonGroup` (attached buttons, and split buttons with a `MenuTrigger`) and `Breadcrumbs` (with the middle crumbs folded into a menu by `maxItems`), with their component tokens. `TextArea` takes a `header` and a `footer`, drawn inside its box. `@panneau/intl` has their messages, in English and French. Empty lists and lists without a match, and widgets of the dashboard without data, show an `EmptyState`; the user's menu shows the user's initials in the color of their name.
- 70ac183: Rows that show one thing are drawn with `Tile` and `TileGroup` (decision 0092): the chosen items of a relation field, the items of the dashboard's list widgets, the passkeys of the account page, and the chosen files of a media field. A row with a link is a link as a whole. Their own stable classes are removed: `.panneau-relation-field-card`, `-card-actions`, `-card-description`, `-card-label`, `-card-text`, `-cards`, `-link` and `-option-thumbnail`; `.panneau-dashboard-item`, `-item-description` and `-item-text`; `.panneau-pages-passkey`, `-passkey-name` and `-passkeys`; `.panneau-media-field-item` and `-thumbnail`. Restyle them with the tile's tokens and its `.panneau-tile` and `.panneau-tile-group` classes.

### Patch Changes

- Updated dependencies [333cb75]
- Updated dependencies [70ac183]
- Updated dependencies [07c2ed8]
  - @panneau/ui@5.0.0-alpha.44
  - @panneau/intl@5.0.0-alpha.44
  - @panneau/lists@5.0.0-alpha.44
  - @panneau/fields@5.0.0-alpha.44
  - @panneau/protocol@5.0.0-alpha.44
  - @panneau/data@5.0.0-alpha.44
  - @panneau/actions@5.0.0-alpha.44
  - @panneau/forms@5.0.0-alpha.44
  - @panneau/core@5.0.0-alpha.44

## 5.0.0-alpha.43

### Minor Changes

- 2136caf: Actions in their tones (decision 0091). An action can declare a `tone`, a tone of the theme, which colors its icon in rows and outlines its button in the header of an item (its form and its panel). Without one, the built-in actions keep their colors (`show` `info`, `edit` `accent`, `restore` `success`), a `link` whose URL leaves the admin, such as the page of an item on the site, is `info`, and the others stay `neutral`; an action that destroys is always `danger`. In the header of an item, an action with a tone is outlined in it, without a fill, and the neutral ones stay secondary buttons. `getActionTone()` is exported by `@panneau/lists`. The toolbar and the selection don't change.

### Patch Changes

- Updated dependencies [2136caf]
  - @panneau/protocol@5.0.0-alpha.43
  - @panneau/lists@5.0.0-alpha.43
  - @panneau/actions@5.0.0-alpha.43
  - @panneau/core@5.0.0-alpha.43
  - @panneau/data@5.0.0-alpha.43
  - @panneau/fields@5.0.0-alpha.43
  - @panneau/forms@5.0.0-alpha.43
  - @panneau/ui@5.0.0-alpha.43
  - @panneau/intl@5.0.0-alpha.43

## 5.0.0-alpha.42

### Patch Changes

- Updated dependencies [019247e]
- Updated dependencies [66a1a2a]
  - @panneau/ui@5.0.0-alpha.42
  - @panneau/fields@5.0.0-alpha.42
  - @panneau/intl@5.0.0-alpha.42
  - @panneau/actions@5.0.0-alpha.42
  - @panneau/forms@5.0.0-alpha.42
  - @panneau/lists@5.0.0-alpha.42
  - @panneau/core@5.0.0-alpha.42
  - @panneau/data@5.0.0-alpha.42
  - @panneau/protocol@5.0.0-alpha.42

## 5.0.0-alpha.41

### Patch Changes

- a6e6843: Actions that destroy come last, outlined (decision 0088, amended). In the header of an item, its edit form and its panel, "Delete" (and every action with `destructive: true`) is no longer in a "More actions" menu: it is a button again, after the links and the other actions, outlined in the danger color without a fill. It keeps its confirmation and "Undo". In rows, "Delete" is the last icon of the row again, as before 5.0.0-alpha.39, and goes to the row's menu only when the icons don't fit.
- Updated dependencies [a6e6843]
  - @panneau/lists@5.0.0-alpha.41
  - @panneau/actions@5.0.0-alpha.41
  - @panneau/core@5.0.0-alpha.41
  - @panneau/data@5.0.0-alpha.41
  - @panneau/fields@5.0.0-alpha.41
  - @panneau/forms@5.0.0-alpha.41
  - @panneau/intl@5.0.0-alpha.41
  - @panneau/protocol@5.0.0-alpha.41
  - @panneau/ui@5.0.0-alpha.41

## 5.0.0-alpha.40

### Minor Changes

- 0511341: Combined widgets (decision 0089), so that one card answers several questions instead of repeating the same total in three.
  
  - A `metric` widget: its number, its change from the previous period ("↑ 12% from the previous 30 days"), its trend as a small line, and its 5 largest parts as bars. On a resource, with `settings.points` and `settings.by`, the client reads the value, the trend, the parts, and the value over the previous range when the widget follows a period.
  - A `series` with several lines: `series` in its data, drawn as one chart with a legend of their totals and help, or stacked with `settings.stacked`. On resources, `settings.split` draws a line per value of a field, and `settings.sources` a line per source, with an `alert` ("4 failed").
  - A `table` widget: rows of numbers, one per subject, with a trend column. On resources, `settings.rows` gives each row its value, its change, its alert and its trend.
  - `settings.format` (options of `Intl.NumberFormat`, also in the data) for every built-in type, so money and sizes read as money and sizes; `settings.goodWhen` colors a change as good or bad news; `settings.hideEmpty` hides a widget with nothing to show.
  - `@panneau/protocol`: `MetricWidgetData`, `TableWidgetData`, `SeriesWidgetSeries`, `WidgetNumberFormat` and the settings in the schemas and the OpenAPI document; `readWidgetFormat()`, `isWidgetDataEmpty()`, `getWidgetChange()`, `getChangeTone()`, `getPreviousRange()`, `getWidgetSources()`, `getWidgetAggregates()`, `isCombinedWidget()`, `readsResources()` and the caps in `@panneau/protocol/runtime`; lint of the new settings, the mock backend, and conformance of these widgets.
  - `@panneau/ui`: `Sparkline`, `ChartLegend`, `LineChart` with `series` and `stacked`, and the `change` of `Stat`.
  - `@panneau/data`: `useResourceAggregates()`, several aggregates in parallel.
  - `@panneau/intl`: the messages of the change, the alert, the columns of a table and the trend, in English and French.

### Patch Changes

- Updated dependencies [0511341]
  - @panneau/protocol@5.0.0-alpha.40
  - @panneau/ui@5.0.0-alpha.40
  - @panneau/data@5.0.0-alpha.40
  - @panneau/intl@5.0.0-alpha.40
  - @panneau/actions@5.0.0-alpha.40
  - @panneau/core@5.0.0-alpha.40
  - @panneau/fields@5.0.0-alpha.40
  - @panneau/forms@5.0.0-alpha.40
  - @panneau/lists@5.0.0-alpha.40

## 5.0.0-alpha.39

### Minor Changes

- ab10f01: Destructive actions in a menu (decision 0088). In the header of an item, its edit form and its panel, actions that destroy (`destructive: true`, as the built-in `delete`) are no longer solid danger buttons before the others: they are in a "More actions" menu (`…`), after the other actions, which are all secondary buttons. In rows, they are always in the row's menu, at every width, even alone in it; a row that doesn't have them keeps the place of the menu. In both menus, they keep their icon and the danger color, their confirmation and "Undo". The bulk actions of a selection don't change.

### Patch Changes

- Updated dependencies [ab10f01]
  - @panneau/lists@5.0.0-alpha.39
  - @panneau/actions@5.0.0-alpha.39
  - @panneau/core@5.0.0-alpha.39
  - @panneau/data@5.0.0-alpha.39
  - @panneau/fields@5.0.0-alpha.39
  - @panneau/forms@5.0.0-alpha.39
  - @panneau/intl@5.0.0-alpha.39
  - @panneau/protocol@5.0.0-alpha.39
  - @panneau/ui@5.0.0-alpha.39

## 5.0.0-alpha.38

### Patch Changes

- Updated dependencies [6c3dd8d]
  - @panneau/protocol@5.0.0-alpha.38
  - @panneau/actions@5.0.0-alpha.38
  - @panneau/core@5.0.0-alpha.38
  - @panneau/data@5.0.0-alpha.38
  - @panneau/fields@5.0.0-alpha.38
  - @panneau/forms@5.0.0-alpha.38
  - @panneau/lists@5.0.0-alpha.38
  - @panneau/ui@5.0.0-alpha.38
  - @panneau/intl@5.0.0-alpha.38

## 5.0.0-alpha.37

### Minor Changes

- 0d49d7d: Dashboards as pages (decision 0084). A page whose component is the built-in `dashboard` carries its own `widgets`, and the app draws them under the page's label, or says it has none. The home page is the dashboard of `pages.home`: its widgets are `pages.home.widgets`, or `dashboard.widgets`, which stays as the shorthand, so existing definitions don't change.
  
  - `@panneau/protocol`: `widgets` on a `Page`, `getDashboardWidgets(definition, page)`, `getDashboardPages(definition)`, `HOME_PAGE` and `DASHBOARD_COMPONENT` in `@panneau/protocol/runtime`. `validateDefinition()` checks the widgets of every dashboard page, and refuses `widgets` on another page. `GET /dashboard/widgets/{widget}` takes `page` (`home` without it) in the OpenAPI document, the mock backend answers the widgets of every dashboard page (its widget functions get the `page`), and conformance checks each dashboard page, and that a widget is a `404` on a page it isn't on.
  - `@panneau/data`: `getWidgetData(widget, { page })`, `widgetDataQueryOptions(adapter, widget, { page })` and `useWidgetData(widget, { page })`. The key of a widget, `queryKeys.widget(widget, { page })`, now ends with its page, still under `['panneau', 'dashboard']`.
  - `@panneau/app`: the built-in `dashboard` page draws the widgets of its own page, and a menu links to it as to any page. `@panneau/intl`: the message of a dashboard page without widgets.
- 757b4fb: One user's menu at the bottom of the sidebar (decision 0086). The footer only shows the user's avatar, name and email, as one button that opens a menu: who is logged in with their whole email, "Profile", "Appearance" and "Language" as choices with a check on the current one, then "Log out". In the rail, the avatar alone opens it. The dock's user's menu is the same menu. The buttons of the appearance and of the language and the "Log out" button leave the footer, and `@panneau/intl` gains `panneau.app.userMenu` ("Your account ({name})"), the label of the button.
  
  The classes `.panneau-sidebar-user-link` and `.panneau-dock-user-menu` are gone: the user's button is `.panneau-sidebar-user` (with `[data-current]` on the profile), and the menu's popover `.panneau-user-menu-popover`.
- ddb93fe: One period for a dashboard page or a summary (decision 0084). A dashboard page (`pages.<id>.period`, or `dashboard.period` for the home page) or a summary (`summary.period`) declares `period: { options, default }`, among `7d`, `30d`, `90d`, `month` and `year`. A segmented control in its header chooses it, and the URL keeps it (`?period=90d`). Widgets on a resource get its days in the `date-range` filter that `settings.period` names, widgets with data of their own get `period[option]`, `period[from]` and `period[to]` unless `settings.period` is `false`, and on a summary the period is the list's own `date-range` filter, so it filters the rows too.
  
  - `@panneau/protocol`: `OverviewPeriod` and `SummaryPeriod`, on `Page`, `dashboard` and `ResourceSummary`, and `settings.period` of widgets, checked by `validateDefinition()`. The `period` parameter of `GET /dashboard/widgets/{widget}` in OpenAPI. `OVERVIEW_PERIODS`, `getPeriodRange()`, `getDefaultPeriod()`, `readPeriodOption()`, `findPeriodOption()`, `localDay()`, `isDay()`, `getDashboardPeriod()`, `getSummaryPeriodFilter()` and `followsPeriod()` in `@panneau/protocol/runtime`; `toWidgetDataParams()` and `readWidgetDataQuery()` write and read the period. The mock backend gives widget functions the `period`, and refuses a wrong one with a `422`; conformance checks the widgets that follow a period.
  - `@panneau/data`: `getWidgetData()`, `widgetDataQueryOptions()` and `useWidgetData()` take a `period`, which keys the data.
  - `@panneau/app`: the period control of dashboard pages and summaries. `@panneau/intl`: the names of the periods.
- 7d7408d: Widgets can count and sum a resource (decision 0084). A list declares its `aggregates` (`sum`, `groupBy`, `dates`), and `GET /resources/{resource}/aggregate` answers their count or sum, by period or by field, in the shape of a widget, with its schemas, checks, OpenAPI path, mock backend and conformance checks. `breakdown` is a new built-in widget type, drawn by the new `BarChart` of `@panneau/ui`, and a `stat` can have a `target`, drawn by the new `Meter`. On the dashboard, a `series`, a `breakdown` and a `stat` that sums read the aggregates of a resource, through `getResourceAggregate()` and `useResourceAggregate()` of `@panneau/data`.
- a339007: A summary above the list of a resource (decision 0084). A resource declares `summary: { widgets, list? }`: widgets drawn between the header of its list page and the list, in the grid of a dashboard, which the user can hide (the browser remembers it per resource). The widgets on the resource and those with data of their own follow the list's current filters and search, unless `settings.followsList` is `false`. With `list: "collapsed"`, the resource opens on its summary, its list folded under it behind "Show the N items".
  
  - `@panneau/protocol`: `Resource.summary` (`ResourceSummary`) and `settings.followsList`, checked by `validateDefinition()` at `resources.<i>.summary.widgets.<j>`. `GET /dashboard/widgets/{widget}` takes `resource`, with the list's `filter[…]` and `q`, for the widgets of a summary; `page` and `resource` together are a `422`. `getSummaryWidgets()`, `getSummaryResources()`, `followsList()`, `toWidgetDataParams()` and `readWidgetDataQuery()` in `@panneau/protocol/runtime`. The mock backend answers the widgets of summaries, whose functions get the `resource` and the `query` of the list (their `page` is `null` there), and conformance checks them.
  - `@panneau/data`: `getWidgetData()`, `widgetDataQueryOptions()` and `useWidgetData()` take `resource` and `query`, keyed apart from the widgets of pages. Changes to the items of a resource refetch the widgets of its summary.
  - `@panneau/app`: the summary on the list page. `@panneau/intl`: "Summary", "Show the list" and "Show the N items".

### Patch Changes

- 94074cc: `LineChart` reads without a pointer: a monotone curve with an area that fades out, a scale of round graduations with lines across the plot, dates at regular steps under it, and the last value at the end of the line. New props: `axisLabel`, `showMax`, `showLast`, `showAxis`, `domain`, `formatTick`, `curve`, and `isInteractive`, which shows the value of the point under the pointer or chosen with the arrow keys. A point can have a `shortLabel` for under the plot. The line draws itself when the chart appears. New tokens `grid-color` and `reveal-duration`; `dot-size` is now 8px and `area-opacity` 0.2. The `series` widget gives full dates to the table and short ones to the axis, is interactive past 31 points, and writes the amounts of a sum of money on its scale too.
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
  - @panneau/actions@5.0.0-alpha.37
  - @panneau/core@5.0.0-alpha.37
  - @panneau/fields@5.0.0-alpha.37
  - @panneau/forms@5.0.0-alpha.37
  - @panneau/lists@5.0.0-alpha.37

## 5.0.0-alpha.36

### Minor Changes

- c2b7df7: Add a language switcher to the shell (decision 0083). The definition can list the languages of the interface in `interfaceLocales`, each with its label and the URL that switches to it. With two or more, the sidebar has a language button beside the appearance's, the dock's user menu a "Language" section, and "Go to…" a command for each other language. Choosing one goes to its URL with `next`, the page to come back to. The protocol documents `GET /locale/{locale}` as an optional endpoint for that URL.
- 6441b21: **Items open in their form by default (decision 0082).** `edit` is now the default of a resource's `open`: the title of an item opens its edit form, its show route redirects there, and rows show "Edit" without "View". The panel of an item's details is now a choice of the resource, `"open": "panel"`, for items read more than edited or shown with their preview. An item the user can't update still opens in the panel. `getOpenMode()` returns `edit` unless the resource says `panel`, and clients treat an `open` they don't know as `edit`.
  
  **Breaking:** a definition without `open` used to open items in the panel. To keep it, set `"open": "panel"` on the resource.
  
  Also fixes the show route of an item that opens in its form when its fetch fails (`403`, `404`): the page showed nothing, as the panel's refetch made it wait again. It now shows the panel with the error.

### Patch Changes

- Updated dependencies [c2b7df7]
- Updated dependencies [6441b21]
  - @panneau/protocol@5.0.0-alpha.36
  - @panneau/intl@5.0.0-alpha.36
  - @panneau/core@5.0.0-alpha.36
  - @panneau/actions@5.0.0-alpha.36
  - @panneau/data@5.0.0-alpha.36
  - @panneau/fields@5.0.0-alpha.36
  - @panneau/forms@5.0.0-alpha.36
  - @panneau/lists@5.0.0-alpha.36
  - @panneau/ui@5.0.0-alpha.36

## 5.0.0-alpha.35

### Patch Changes

- 1ecdaa8: Add the motion tokens `--panneau-duration-slow`, `--panneau-ease-out` and `--panneau-ease-in`, used by every component in place of easings written by hand. An item that leaves a list (deleted, or out of its filters) now fades out at its place before it goes, in the table, the cards and the gallery (`isLeaving` in the props of a layout).
- Updated dependencies [60b8651]
- Updated dependencies [1ecdaa8]
  - @panneau/forms@5.0.0-alpha.35
  - @panneau/ui@5.0.0-alpha.35
  - @panneau/lists@5.0.0-alpha.35
  - @panneau/actions@5.0.0-alpha.35
  - @panneau/fields@5.0.0-alpha.35
  - @panneau/core@5.0.0-alpha.35
  - @panneau/data@5.0.0-alpha.35
  - @panneau/intl@5.0.0-alpha.35
  - @panneau/protocol@5.0.0-alpha.35

## 5.0.0-alpha.34

### Patch Changes

- @panneau/actions@5.0.0-alpha.34
  - @panneau/core@5.0.0-alpha.34
  - @panneau/data@5.0.0-alpha.34
  - @panneau/fields@5.0.0-alpha.34
  - @panneau/forms@5.0.0-alpha.34
  - @panneau/intl@5.0.0-alpha.34
  - @panneau/lists@5.0.0-alpha.34
  - @panneau/protocol@5.0.0-alpha.34
  - @panneau/ui@5.0.0-alpha.34

## 5.0.0-alpha.33

### Patch Changes

- 16fd93b: Menus can have collapsible groups and emphasized entries (decision 0079). A `group` with a label and `"collapsible": true` has a button for its title in the sidebar, which shows or hides its links; the browser remembers the user's choice. `"collapsed": true` starts it closed, unless it holds the current page. `"emphasis": true` on a `resource`, `page` or `link` shows its label in bold, in the sidebar and the dock. New sidebar tokens: `link-emphasis-color` and `link-emphasis-weight`.
- Updated dependencies [16fd93b]
  - @panneau/protocol@5.0.0-alpha.33
  - @panneau/actions@5.0.0-alpha.33
  - @panneau/core@5.0.0-alpha.33
  - @panneau/data@5.0.0-alpha.33
  - @panneau/fields@5.0.0-alpha.33
  - @panneau/forms@5.0.0-alpha.33
  - @panneau/lists@5.0.0-alpha.33
  - @panneau/ui@5.0.0-alpha.33
  - @panneau/intl@5.0.0-alpha.33

## 5.0.0-alpha.32

### Patch Changes

- 5de54d2: `user.resource` can be `null`: the user has no item they can edit in a resource of users, such as a user outside the resource's scope who reaches the admin by another rule. The app then shows no link to the user's profile in the sidebar and the dock, where it opened a page that wasn't found (folkloreinc/laravel-panneau#202). Without `user.resource`, the app still looks for a resource `users`.
- Updated dependencies [5de54d2]
  - @panneau/protocol@5.0.0-alpha.32
  - @panneau/actions@5.0.0-alpha.32
  - @panneau/core@5.0.0-alpha.32
  - @panneau/data@5.0.0-alpha.32
  - @panneau/fields@5.0.0-alpha.32
  - @panneau/forms@5.0.0-alpha.32
  - @panneau/lists@5.0.0-alpha.32
  - @panneau/ui@5.0.0-alpha.32
  - @panneau/intl@5.0.0-alpha.32

## 5.0.0-alpha.31

### Patch Changes

- Updated dependencies [3044946]
  - @panneau/ui@5.0.0-alpha.31
  - @panneau/actions@5.0.0-alpha.31
  - @panneau/fields@5.0.0-alpha.31
  - @panneau/forms@5.0.0-alpha.31
  - @panneau/lists@5.0.0-alpha.31
  - @panneau/core@5.0.0-alpha.31
  - @panneau/data@5.0.0-alpha.31
  - @panneau/intl@5.0.0-alpha.31
  - @panneau/protocol@5.0.0-alpha.31

## 5.0.0-alpha.30

### Patch Changes

- 8d18be8: The app owns its page (decision 0078): while `<Panneau>` is mounted, `body` has no margin, and `html` and `body` take the background and the color scheme of the app's root. The browser's default margin no longer frames the app in white, and a dark scheme no longer shows white under a short page or when the page bounces. The page's own inline styles come back when the app unmounts. `PanneauRoot` takes a `ref` to its element.
- Updated dependencies [8d18be8]
  - @panneau/ui@5.0.0-alpha.30
  - @panneau/actions@5.0.0-alpha.30
  - @panneau/fields@5.0.0-alpha.30
  - @panneau/forms@5.0.0-alpha.30
  - @panneau/lists@5.0.0-alpha.30
  - @panneau/core@5.0.0-alpha.30
  - @panneau/data@5.0.0-alpha.30
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
- ef36326: Resource types (decision 0077). A resource's `types` are now `ResourceType`s, with a `description`, an `icon` and `abilities`: `abilities.create: false` keeps a type out of the choices when creating (a singleton such as the home page). Items of a resource with types have a `type`, which a create sends and updates ignore, and their fields are those of the resource, then those of their type. `lintDefinition()` lets `form.layout` name the fields of the types, checks their references, and reports duplicate type ids, type fields named as a field of the resource or `type`, and a field `type` that isn't `notInForm`. `@panneau/protocol/runtime` has `getResourceType()`, `getItemType()`, `getCreatableTypes()`, `getTypeFields()`, `hasResourceTypes()` and `ITEM_TYPE_KEY`, and the mock backend checks and saves the type of items.
  
  `resolveResource()` of `@panneau/core` allows creating in a resource with types only when one of its types can be created.
  
  In the app, the create button of a list with several types to create is a menu of them, and the "Go to…" palette has a create entry per type. The create route takes the type, `/resources/{resource}/create/{type}`; without one, it shows a card per type, or the form of the only type that can be created. Forms and the item panel show the fields of the item's type, and a new item is saved with its type.
- 179efeb: Themes can set selections apart from the accent, and style focus rings and filled buttons (decision 0073). New component tokens: `--panneau-selected-bg`, `--panneau-selected-text` and `--panneau-selected-subtle`, read by checkboxes, radios, switches, the slider, tabs, calendars, selected rows, cards and media, and the rich text toolbar (they default to the accent, so nothing changes without them); `--panneau-input-border-color-focus`, `--panneau-input-focus-ring` and `--panneau-input-focus-ring-invalid`; `--panneau-button-solid-border-color` and `--panneau-button-pressed-scale`; `--panneau-field-required-color`; `--panneau-switch-track-border-color`; `--panneau-segmented-control-segment-color-hover` and `-segment-bg-hover`, so a hovered segment no longer takes the text color of the selected one. `checkTheme()` checks translucent colors over what is under them, explicit tone values that refer to the palette, and the selection against the surface. The active formats of the rich text toolbar are visible again, and the links of the login page use the link color.
- d6800eb: The app now takes the density of the definition's theme (`theme.density`: `compact`, `comfortable`, `touch` or `auto`), as decision 0024 says: set it to `touch` for larger controls everywhere. The tags input is as tall as other inputs in each density: it was 8px taller.
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
  - @panneau/forms@5.0.0-alpha.29
  - @panneau/protocol@5.0.0-alpha.29
  - @panneau/core@5.0.0-alpha.29
  - @panneau/lists@5.0.0-alpha.29
  - @panneau/fields@5.0.0-alpha.29
  - @panneau/actions@5.0.0-alpha.29
  - @panneau/data@5.0.0-alpha.29

## 5.0.0-alpha.28

### Patch Changes

- Updated dependencies [041732f]
  - @panneau/protocol@5.0.0-alpha.28
  - @panneau/core@5.0.0-alpha.28
  - @panneau/lists@5.0.0-alpha.28
  - @panneau/actions@5.0.0-alpha.28
  - @panneau/data@5.0.0-alpha.28
  - @panneau/fields@5.0.0-alpha.28
  - @panneau/forms@5.0.0-alpha.28
  - @panneau/ui@5.0.0-alpha.28
  - @panneau/intl@5.0.0-alpha.28

## 5.0.0-alpha.27

### Patch Changes

- Updated dependencies [cac1376]
  - @panneau/fields@5.0.0-alpha.27
  - @panneau/lists@5.0.0-alpha.27
  - @panneau/protocol@5.0.0-alpha.27
  - @panneau/forms@5.0.0-alpha.27
  - @panneau/actions@5.0.0-alpha.27
  - @panneau/core@5.0.0-alpha.27
  - @panneau/data@5.0.0-alpha.27
  - @panneau/ui@5.0.0-alpha.27
  - @panneau/intl@5.0.0-alpha.27

## 5.0.0-alpha.26

### Patch Changes

- e322361: "Show" in the toast of a run opens the list of the items it changed (decision 0069). Every list has a filter on the ids of its items, `filter[ids][]=12`, at most 100 (`IDS_FILTER`, `IDS_FILTER_LIMIT`), which the mock and local lists apply. Lists show it as a chip, "2 items", that removes it. A list's definition can no longer declare a filter with the id `ids`. The conformance kit checks that a backend reads it (`list.filter-ids`). `ActionRunnerProvider` takes `onShowItems(resource, ids)`, which the app gives, and offers "Show" for the items of a selection by ids that the run changed, when the toast has no "Undo", "Details" or "Download".
- Updated dependencies [8461e06]
- Updated dependencies [e322361]
- Updated dependencies [d44397d]
  - @panneau/intl@5.0.0-alpha.26
  - @panneau/lists@5.0.0-alpha.26
  - @panneau/protocol@5.0.0-alpha.26
  - @panneau/actions@5.0.0-alpha.26
  - @panneau/ui@5.0.0-alpha.26
  - @panneau/fields@5.0.0-alpha.26
  - @panneau/forms@5.0.0-alpha.26
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
  - @panneau/actions@5.0.0-alpha.25
  - @panneau/forms@5.0.0-alpha.25
  - @panneau/lists@5.0.0-alpha.25
  - @panneau/core@5.0.0-alpha.25
  - @panneau/data@5.0.0-alpha.25

## 5.0.0-alpha.24

### Patch Changes

- c805476: The forms of the app check their fields with `check`, such as slugs, with the backend (`POST /resources/{resource}/fields/{field}/check`): a slug now shows its URL prefix, the link to its page, and whether it is taken. The create and edit pages didn't give their form a check source, so only forms rendered outside the app checked their fields.
- @panneau/actions@5.0.0-alpha.24
  - @panneau/core@5.0.0-alpha.24
  - @panneau/data@5.0.0-alpha.24
  - @panneau/fields@5.0.0-alpha.24
  - @panneau/forms@5.0.0-alpha.24
  - @panneau/intl@5.0.0-alpha.24
  - @panneau/lists@5.0.0-alpha.24
  - @panneau/protocol@5.0.0-alpha.24
  - @panneau/ui@5.0.0-alpha.24

## 5.0.0-alpha.23

### Patch Changes

- Updated dependencies [c310e38]
- Updated dependencies [c310e38]
- Updated dependencies [c310e38]
  - @panneau/fields@5.0.0-alpha.23
  - @panneau/intl@5.0.0-alpha.23
  - @panneau/lists@5.0.0-alpha.23
  - @panneau/forms@5.0.0-alpha.23
  - @panneau/actions@5.0.0-alpha.23
  - @panneau/ui@5.0.0-alpha.23
  - @panneau/core@5.0.0-alpha.23
  - @panneau/data@5.0.0-alpha.23
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
  - @panneau/lists@5.0.0-alpha.22
  - @panneau/ui@5.0.0-alpha.22
  - @panneau/intl@5.0.0-alpha.22
  - @panneau/protocol@5.0.0-alpha.22
  - @panneau/fields@5.0.0-alpha.22
  - @panneau/actions@5.0.0-alpha.22
  - @panneau/forms@5.0.0-alpha.22
  - @panneau/core@5.0.0-alpha.22
  - @panneau/data@5.0.0-alpha.22

## 5.0.0-alpha.21

### Patch Changes

- Updated dependencies [2a87620]
  - @panneau/ui@5.0.0-alpha.21
  - @panneau/actions@5.0.0-alpha.21
  - @panneau/fields@5.0.0-alpha.21
  - @panneau/forms@5.0.0-alpha.21
  - @panneau/lists@5.0.0-alpha.21
  - @panneau/core@5.0.0-alpha.21
  - @panneau/data@5.0.0-alpha.21
  - @panneau/intl@5.0.0-alpha.21
  - @panneau/protocol@5.0.0-alpha.21

## 5.0.0-alpha.20

### Patch Changes

- da7d159: The default main menu leaves out `pages.home`: the shell already links to the home page, which the dashboard of decision 0064 adds, and the menu showed it again under its id.
- @panneau/actions@5.0.0-alpha.20
  - @panneau/core@5.0.0-alpha.20
  - @panneau/data@5.0.0-alpha.20
  - @panneau/fields@5.0.0-alpha.20
  - @panneau/forms@5.0.0-alpha.20
  - @panneau/intl@5.0.0-alpha.20
  - @panneau/lists@5.0.0-alpha.20
  - @panneau/protocol@5.0.0-alpha.20
  - @panneau/ui@5.0.0-alpha.20

## 5.0.0-alpha.19

### Patch Changes

- Updated dependencies [b547a0a]
- Updated dependencies [f07ce4c]
  - @panneau/protocol@5.0.0-alpha.19
  - @panneau/core@5.0.0-alpha.19
  - @panneau/fields@5.0.0-alpha.19
  - @panneau/forms@5.0.0-alpha.19
  - @panneau/lists@5.0.0-alpha.19
  - @panneau/intl@5.0.0-alpha.19
  - @panneau/actions@5.0.0-alpha.19
  - @panneau/data@5.0.0-alpha.19
  - @panneau/ui@5.0.0-alpha.19

## 5.0.0-alpha.18

### Minor Changes

- b200640: The widgets of the dashboard (decision 0064):
  
  - `@panneau/protocol`: the built-in widget types are `stat`, `series` and `list`, and `StatWidgetData`, `SeriesWidgetData` and `ListWidgetData` are the shapes of their data at `GET /dashboard/widgets/{widget}`, in the schemas and the OpenAPI document (with a `500` for data in the wrong shape). A `stat` or a `list` with `settings.resource` and `settings.query` reads the list of a resource instead. `validateDefinition()` checks the widgets: unique ids, a resource that exists, filters of its list, no `stat` on a list paged with cursors. `checkWidgetData()`, `getWidgetResource()` and the widget constants are in `@panneau/protocol/runtime`. The mock backend answers the widgets with its `widgets` option, and the conformance kit checks the endpoint (`dashboard.widgets`, `dashboard.widgets.resource`, `dashboard.widgets.unknown`).
  - `@panneau/ui`: `Stat`, a number in large type with its label, its help, a tone and a link, and `LineChart`, a line on the chart colors of the theme with its values in a table for assistive technologies. Both draw a skeleton while they load.
  - `@panneau/data`: `useWidgetData()`, `widgetDataQueryOptions()` and `queryKeys.widget()`.
  - `@panneau/core`: `WidgetProps`, the props of the widgets of plugins.
  - `@panneau/intl`: the messages of the widgets, in English and French.
  - `@panneau/app`: the built-in `dashboard` page draws the widgets of `definition.dashboard` in a grid of 12 columns, one column on a phone. Each widget draws a skeleton of its type while it loads, its error with "Try again" when it fails, and nothing on a `403` or on a resource the user can't list, without touching the others. Without widgets, the home page still shows the cards of the resources.
- 19d0892: The image of items in the table, and in media libraries (decision 0061):
  
  - `@panneau/protocol`: the `itemImage` of a resource of kind `media` defaults to the `media` of its items. `getItemImageField(resource)` gives it, or the resource's `itemImage`.
  - `@panneau/lists`: with `itemImage`, the table starts each title with a square thumbnail of the image of its item, loaded lazily, or a placeholder for an item without one, and its skeleton draws their placeholders. `getImageUrl()` gives the URL of a media only when it is an image or has a thumbnail, and the URL of a file only when it is an image that browsers show: a PDF or a HEIC original has no image. `file` values have a display (`FileDisplay`: the name of each file linked to its URL, after the thumbnail of an image or an icon), `image` values are shown as `media` ones, and `MediaDisplay` reads media references (the thumbnail of their `media`, their `label`).
  - `@panneau/app`: a media library offers its gallery and shows its thumbnails without declaring `itemImage`, and so do its items in "Go to…". The panel of a media shows its image over its details.
- 11bcf36: Toasts (decision 0062):
  
  - `@panneau/ui`: toasts show at the bottom, centered, above what sticks to the bottom of the page (`useToastOffset(ref)`), and take the whole width on a phone. `PanneauRoot` takes a `toastPlacement` (`bottom`, `bottom-end`, `top-end`). `show()` takes a `key`: a toast with the key of one already shown replaces it. At most three show at once, the older ones folded behind the newest until the region is hovered or focused. Timeouts follow what a toast holds (`getToastTimeout()`): about 5 seconds, longer for a longer text, about 10 seconds with an action (instead of never), none for an error. A success keeps the neutral look; only warnings and errors color the edge. They appear from below, without motion when the system asks for less.
  - `@panneau/forms`: a form says "Saved" in its footer, next to its button, until its values change, instead of in a toast, and a failed save says so there too, without a toast. `saved` keeps "Saved" when the form starts over from the item it just saved. `showSavedToast` only applies to a form without a footer. The footer raises the toasts above it.
  - `@panneau/actions`: toasts name what an action was done to (the item by its title, or the count of items), one per action and target. No toast when a queued run starts: the runs button shows it, and the toast comes when it ends (not at all when the open list of runs shows it and the result says nothing more).
  - `@panneau/app`: creating an item says what was created in a toast, since the page changes; saving it again says "Saved" in the footer of its form.
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
  - @panneau/data@5.0.0-alpha.18
  - @panneau/core@5.0.0-alpha.18
  - @panneau/intl@5.0.0-alpha.18
  - @panneau/forms@5.0.0-alpha.18
  - @panneau/lists@5.0.0-alpha.18
  - @panneau/actions@5.0.0-alpha.18
  - @panneau/fields@5.0.0-alpha.18

## 5.0.0-alpha.17

### Minor Changes

- 0cf20b0: Row actions are icons in their colors, as in Panneau 4, the same in every list (decision 0060): `show` blue (`info`), `edit` in the main color, `delete` red, with their labels as names and tooltips. The main action, the one the title opens, keeps its label while the row has room (`primaryAction` of `ListView`; the app sets it from `open`). `duplicate`, `delete` and the actions placed in `menu` are icons too: the `•••` menu only takes the last actions when the icons don't fit (many actions, a narrow list, a phone), and never a single one. The list measures the room it has, chooses the same layout for every row, and keeps the place of the actions a row doesn't have, so they line up. `delete` keeps its confirmation.

### Patch Changes

- Updated dependencies [2a1f32d]
- Updated dependencies [0cf20b0]
  - @panneau/fields@5.0.0-alpha.17
  - @panneau/lists@5.0.0-alpha.17
  - @panneau/forms@5.0.0-alpha.17
  - @panneau/actions@5.0.0-alpha.17
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
  - @panneau/lists@5.0.0-alpha.16
  - @panneau/forms@5.0.0-alpha.16
  - @panneau/intl@5.0.0-alpha.16
  - @panneau/core@5.0.0-alpha.16
  - @panneau/ui@5.0.0-alpha.16
  - @panneau/actions@5.0.0-alpha.16
  - @panneau/data@5.0.0-alpha.16

## 5.0.0-alpha.15

### Patch Changes

- 658b3d3: The account page (decision 0050).
  
  - `@panneau/protocol`: `auth.account`, `PATCH /account` with the name and the email, `PUT /account/password` with the current password; the account of the mock backend (a new email is verified again with `auth.emailVerification`), and the `account` conformance check.
  - `@panneau/data`: optional `getAccount()`, `updateAccount()` and `updatePassword()`, and the `account` and `twoFactor` query keys.
  - `@panneau/app`: with `auth.account`, the user's name in the sidebar links to `{basePath}/account`, a page with their name and email, their password, and their two-factor authentication (set up, new recovery codes, turned off unless it is required).
  - `@panneau/intl`: its messages, in English and French.
- 97456b6: OAuth providers on the login page (decision 0052).
  
  - `@panneau/protocol`: `AUTH_ERROR_PARAM` and `AUTH_ERROR_CODES`, the `next` of `GET /auth/providers/{provider}/redirect`, the providers of the mock backend (`providerUsers`: a provider logs in at once), and the `auth.providers` conformance check, which doesn't follow the redirection.
  - `@panneau/app`: the link of a provider adds `next`, the page to come back to; the login page says why a login with a provider failed (`authError`), and the address loses it.
  - `@panneau/intl`: their messages, in English and French.
- d85d11a: Passkeys (decision 0051).
  
  - `@panneau/protocol`: the login options and the login (`/auth/passkeys/options`, `/auth/passkeys/login`), the passkeys of the account (`/account/passkeys`, its options, adding and removing one), the `WebAuthnOptions` and `Passkey` schemas, and `auth.passkeys`. The mock backend registers and logs in with the browser's passkeys, without checking signatures. The `auth.passkeys` and `account.passkeys` conformance checks change nothing.
  - `@panneau/data`: optional `passkeyLoginOptions()`, `passkeyLogin()`, `listPasskeys()`, `passkeyRegistrationOptions()`, `addPasskey()` and `deletePasskey()`, and the `passkeys` query key.
  - `@panneau/app`: a "Log in with a passkey" button on the login page, and the passkeys on the account page. The WebAuthn ceremonies use the browser's JSON conversions, with a fallback of their own.
  - `@panneau/intl`: their messages, in English and French.
- b05ef33: Password reset and email verification in the `panneau` auth mode (decision 0048).
  
  - `@panneau/protocol`: `POST /auth/email/verification` and `POST /auth/email/verify` in `openapi.json`, `429` answers of the password reset, the `EMAIL_UNVERIFIED_PROBLEM_TYPE` and `AUTH_PAGE_PATHS` constants, the `auth` option of the mock backend (users, a session and the emails it "sends"), and conformance checks of the reset and of the verification when the definition enables them.
  - `@panneau/data`: the optional `forgotPassword()`, `resetPassword()`, `sendEmailVerification()` and `verifyEmail()` of `DataAdapter`, implemented by `createRestAdapter()`.
  - `@panneau/app`: with `auth.passwordReset`, a "Forgot your password?" link on the login page and the page that the reset link opens (`{basePath}/auth/reset-password`); with `auth.emailVerification`, a page that sends a new link when the API refuses an unverified address, and the page that the link opens (`{basePath}/auth/verify-email`).
  - `@panneau/intl`: their messages, in English and French.
- acdc6e2: Two-factor authentication in the `panneau` auth mode (decision 0049).
  
  - `@panneau/protocol`: `POST /auth/two-factor/challenge` with a code or a recovery code, `POST /auth/password/confirm`, the `/account/two-factor` endpoints (status, setup, confirmation, recovery codes, off), the `TwoFactorChallenge`, `TwoFactorStatus`, `TwoFactorSetup` and `RecoveryCodes` schemas, `423` answers, `TWO_FACTOR_REQUIRED_PROBLEM_TYPE` and `PASSWORD_CONFIRMATION_PROBLEM_TYPE`; two-factor users, a fixed code and required two-factor in the mock backend; conformance checks of the status and of a challenge without a pending login.
  - `@panneau/data`: `login()` resolves with `{ twoFactor: true }` when the login waits for a second factor (`LoginResult`: a breaking change of the type for custom adapters); optional `twoFactorChallenge()`, `confirmPassword()`, `getTwoFactor()`, `enableTwoFactor()`, `confirmTwoFactor()`, `disableTwoFactor()` and `regenerateRecoveryCodes()`; `PasswordConfirmationError` for `423`.
  - `@panneau/app`: the login page asks for the second factor; a user who must have two-factor authentication gets a page that sets it up (QR code, key, confirmation, recovery codes); operations that need the password ask for it in a dialog.
  - `@panneau/intl`: their messages, in English and French.
- Updated dependencies [658b3d3]
- Updated dependencies [97456b6]
- Updated dependencies [d85d11a]
- Updated dependencies [b05ef33]
- Updated dependencies [acdc6e2]
  - @panneau/protocol@5.0.0-alpha.15
  - @panneau/data@5.0.0-alpha.15
  - @panneau/intl@5.0.0-alpha.15
  - @panneau/actions@5.0.0-alpha.15
  - @panneau/core@5.0.0-alpha.15
  - @panneau/fields@5.0.0-alpha.15
  - @panneau/forms@5.0.0-alpha.15
  - @panneau/lists@5.0.0-alpha.15
  - @panneau/ui@5.0.0-alpha.15

## 5.0.0-alpha.14

### Patch Changes

- Updated dependencies [4f141f9]
- Updated dependencies [4f141f9]
  - @panneau/ui@5.0.0-alpha.14
  - @panneau/actions@5.0.0-alpha.14
  - @panneau/fields@5.0.0-alpha.14
  - @panneau/forms@5.0.0-alpha.14
  - @panneau/lists@5.0.0-alpha.14
  - @panneau/core@5.0.0-alpha.14
  - @panneau/data@5.0.0-alpha.14
  - @panneau/intl@5.0.0-alpha.14
  - @panneau/protocol@5.0.0-alpha.14

## 5.0.0-alpha.13

### Patch Changes

- f3036ed: The rest of the UI follows the abilities of the current user (decision 0046): pages and fields have abilities, menus leave out what the user can't reach, and a route reached without the ability shows a forbidden state.
  
  - `@panneau/protocol`: `abilities` on a page (`{ "view": false }`) and on a field (`{ "view": false }`, `{ "update": false }`), where only `false` restricts. The JSON Schema and the OpenAPI document follow. The mock backend reads the abilities of resources (`403` on lists without `viewAny`, on creates without `create`), of items (`403` without `view`, `update` or `delete`), and of fields (items leave out the values of hidden fields, writes ignore those of fields the user can't see or update); an item of `items` can give its own `abilities`. The conformance kit checks that resources without `viewAny` answer `403` on their list, that items leave out hidden fields, that a dry run of `delete` skips an item without `delete` and, with `writes`, that an empty create of a resource without `create` and an empty update of an item without `update` answer `403`.
  - `@panneau/core`: `canViewField()`, `canUpdateField()`, `getVisibleFields()` and `canViewPage()`. `resolveFields()` and `resolveForm()` leave out the fields the user can't see, and make those they can't edit read-only. `resolveList()` leaves the fields the user can't see out of columns and sorts, and those they can't edit out of `inlineEdit`.
  - `@panneau/fields`: a field with `abilities.update: false` is read-only.
  - `@panneau/intl`: the message of an item the user can't view (`itemForbidden`).
  - `@panneau/app`: the forbidden error page (`ErrorPage` with `kind="forbidden"`) also shows on the create route of a resource without `create`, and on a page with `view: false`. The item panel says when the user can't view the item, without "Retry". The edit route of an item without `update: true` goes to its panel. `pages.home` with `view: false` shows the built-in home. Menus leave out the pages the user can't open, and the separators left at their start, at their end or next to another one. Lists, panels and forms leave out the fields the user can't see.
- 7a5a38e: A current context, picked in the app and sent with every request (#182, [decision 0045](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0045-current-context.md)).
  
  - `@panneau/protocol`: the definition's `context.params` (`ContextParam`, `ContextOption`, `DefinitionContext`): a name, a label, `required`, `fixed` (a value the backend sets from the request, such as the client of its domain), `allLabel`, inline `options`, and the `value` and `valueLabel` it was built for. The `Panneau-Context` header (`CONTEXT_HEADER`, `formatContextHeader()`, `parseContextHeader()`, `contextBefore()`), the `403` problem of type `urn:panneau:problem:context` with its `param` (`CONTEXT_PROBLEM_TYPE`), `GET /context/{param}/options` (`ContextOptionsResponse`) and `RESERVED_ROUTE_SEGMENTS`, in the schemas and the OpenAPI document, where every operation takes the header and can answer the `403`. The mock backend takes `context` (the choices of each param, and the items of each resource in the context), and the conformance kit checks a backend with a context, with `context` to send values with every request.
  - `@panneau/data`: `DataAdapter.withContext(values)`, an adapter that sends `Panneau-Context`, and `getContextOptions(name, { q })`, both optional. The REST and Laravel adapters have them.
  - `@panneau/app`: the values of the context are a prefix of the routes (`{basePath}/client/4/contest/12/…`) and every request sends them. The sidebar has a field per param (a button with a popover in the rail of icons), with its choices inline or searched; picking other values loads the app for them. While a required param has no value, every route asks for it. A fixed param shows its value without a field, and stays out of the path and of the header. Values the backend chose go to the path, and a value the user can't use takes the app to the path without it. New classes: `panneau-context-picker-*` and `panneau-context-page-*`.
  - `@panneau/intl`: the messages of the picker and of the page that asks for a value, in English and in French.
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
- 5002faa: The shell has a notification area for queued action runs (#180).
  
  - `@panneau/app`: while the action runner follows runs, the sidebar has an "Actions" button, with the count of the runs in progress (an icon with a badge in the rail of icons and in the top bar of small screens). It opens a popover with their status and progress (`ActionRuns`), on every page, so runs stay in sight after the user leaves the list that started them. The list of runs at the top of the page is gone. New classes: `panneau-action-runs-button-*`. `panneau-app-layout-top-bar-search` is replaced by `panneau-app-layout-top-bar-end`, around the buttons at the end of the top bar.
  - `@panneau/intl`: `appMessages.actionRuns` and `appMessages.actionRunsLabel`, in English and in French.
- bdd0a17: The shell has error pages for forbidden content, server errors and an unreachable server (#181).
  
  - `@panneau/data`: a request that gets no answer (offline, or the server can't be reached) rejects with a `NetworkError`, whose `cause` is the error of `fetch`. An aborted request still rejects with its `AbortError`.
  - `@panneau/app`: `ErrorPage` (exported, with `getErrorPageKind()` and the `ErrorPageKind` type) shows, in the look of the not found page, what went wrong and what to do: `not-found`, `forbidden`, `server-error`, `offline` (offline, or the server unreachable: it tries again once the browser is back online) and `error`. The shell uses it:
      - a resource the user can't list shows "Access denied" instead of "Page not found";
      - an item or a list that fails to load shows the page of its error (`403`, `404`, `5xx`, no answer) with a retry, in place of an alert;
      - a page that throws while it renders shows an error page with the sidebar still there, and renders again with "Try again" or on another path;
      - at boot, a definition that fails to load shows the error page on a panel in the frame of the shell: "Access denied" when the user isn't allowed in.
  
      New classes: `panneau-error-page-*`, and `panneau-panneau-frame` and `panneau-panneau-panel` for the frame at boot.
  - `@panneau/intl`: the messages of these pages, in English and in French.
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
  - @panneau/lists@5.0.0-alpha.13
  - @panneau/ui@5.0.0-alpha.13
  - @panneau/data@5.0.0-alpha.13
  - @panneau/actions@5.0.0-alpha.13
  - @panneau/forms@5.0.0-alpha.13

## 5.0.0-alpha.12

### Patch Changes

- b600b94: The panel of an item shows the values of its groups ([decision 0041](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0041-groups-in-item-details.md)).
  
  - `@panneau/lists`: `ItemDetails` takes groups: a column with `columns` (`ItemDetailsColumn`, exported) lists the values of its fields under its label, indented, read in the value of the column. While the item loads, each of them has its skeleton. New classes: `panneau-item-details-group` and `panneau-item-details-nested`.
  - `@panneau/app`: the panel of an item shows its `group` fields, with their nested fields, instead of leaving them out. Repeaters stay in the form only.
- 0a8447e: Localized fields show one locale at a time, as in Panneau 4, and forms use the width they have.
  
  - `@panneau/fields`: a localized field shows the input of one locale under its label, with a switch of the locales (`FR`, `EN`) at the end of the label's line. The switch marks a locale in error with a red dot, and an empty locale with an amber dot when the field is required, or with `+` when it isn't: a translation to add. The first locale shows first; every input stays mounted. `LocalizedField` takes `locale` and `onLocaleChange` to control the locale shown, and `invalidLocales`. The input of a locale has no visible label: `label` of `LocalizedInputProps` is meant for its `aria-label`. Field entries take `hideLabel` (also on `NestedField`), which `getFieldProps()` turns into an `aria-label`, and `invalidPaths`, the paths in error inside the field, which a binding gives to fields that show their nested fields. The fields of a group flow in columns of at least 14rem: short fields share a row, and wide ones take a row of their own. `isWideField()` tells them apart: text areas, groups, repeaters, localized fields, several values, radios and checkboxes, and the types of plugins are wide. `RevealContext`, `createRevealRegistry()` and `useRevealer()` let fields that hide some of their own show the path a form reveals.
  - `@panneau/forms`: the fields that a layout doesn't place, which is every field of a form without a layout, flow in columns of at least 16rem after the layout, and in the form's skeleton too. `Form` gives `FormView` its layout as given. When it focuses the field of an error, a form first shows its locale, as it opens its tab or section. The errors of a localized field are listed, and the first one focused, in the order of the form's locales, not alphabetically. Its reveal registry is the one of `@panneau/fields`.
  - `@panneau/ui`: `Fieldset` takes `legendEnd`, controls at the end of the legend's line. The group is then named by the legend through `aria-labelledby`.
  - `@panneau/app`: the form of an item takes the width of a list (80rem) when its layout has a sidebar.
  - `@panneau/intl`: messages of the locale switch, in English and French.
  
  The `panneau-localized-field-locales` class is removed: the locales of a localized field are in a `panneau-fieldset`.
- Updated dependencies [b600b94]
- Updated dependencies [0a8447e]
  - @panneau/lists@5.0.0-alpha.12
  - @panneau/ui@5.0.0-alpha.12
  - @panneau/intl@5.0.0-alpha.12
  - @panneau/fields@5.0.0-alpha.12
  - @panneau/forms@5.0.0-alpha.12
  - @panneau/actions@5.0.0-alpha.12
  - @panneau/core@5.0.0-alpha.12
  - @panneau/data@5.0.0-alpha.12
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
  - @panneau/lists@5.0.0-alpha.11
  - @panneau/actions@5.0.0-alpha.11
  - @panneau/fields@5.0.0-alpha.11
  - @panneau/forms@5.0.0-alpha.11
  - @panneau/core@5.0.0-alpha.11
  - @panneau/data@5.0.0-alpha.11
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
  - @panneau/forms@5.0.0-alpha.10
  - @panneau/intl@5.0.0-alpha.10
  - @panneau/lists@5.0.0-alpha.10
  - @panneau/data@5.0.0-alpha.10
  - @panneau/actions@5.0.0-alpha.10
  - @panneau/ui@5.0.0-alpha.10

## 5.0.0-alpha.9

### Minor Changes

- d172551: Plugin pages can look like the pages of resources, and the edit page shows the actions of its item.
  
  - `@panneau/app` exports the building blocks of its pages: `PageLayout` (the column of a page, `default` or `narrow`), `PageHeader` (the title, a link to the parent page, the actions) and `LinkButton`.
  - The edit page of an item shows, in its header, the actions of its resource placed in `form`, which is where actions of the `item` scope go by default, for the item's abilities. They run through the action runner, after a confirmation when they ask for one; a `link` action with a URL is a link. Until now, an action placed in `form` was never shown. An action that removes the item, such as `delete`, goes back to the list, in place of the item's page in the history, unless its result has a `redirect`.
- a49284e: Panneau runs under a Content Security Policy without `'unsafe-inline'` for styles. `PanneauRoot`, `<Panneau>` and `createPanneauApp()` take a `nonce`, which the `<style>` and `<link>` elements of themes and fonts get. Without it, they read the nonce where React Aria does: `<meta property="csp-nonce">`, then `__webpack_nonce__`. The README of `@panneau/ui` explains what a strict policy needs.
- 2a6cf2a: Pages of the definition can take params (decision 0038). A page with `"params": ["id"]` is at `{basePath}/pages/{page}/{id}`, and its component gets `params` (`{ id: "4f2a" }`), next to its `props` and the definition. Route references can name a page (`{ "route": "job", "params": { "id": … } }`) when `routes` has no route of that name, so a `link` action with `"route": "job"` opens the page of its item. Menus leave pages with params out.

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
  - @panneau/lists@5.0.0-alpha.9
  - @panneau/fields@5.0.0-alpha.9
  - @panneau/intl@5.0.0-alpha.9
  - @panneau/actions@5.0.0-alpha.9
  - @panneau/forms@5.0.0-alpha.9
  - @panneau/data@5.0.0-alpha.9

## 5.0.0-alpha.8

### Minor Changes

- 82f3c8a: Apps that render `<Panneau>` with their own `iconLoader` no longer bundle every Lucide icon (about 1,900 chunks). `<Panneau>` has no default `iconLoader` anymore: without one, named icons render an empty space, as with `PanneauRoot`. Pass `lucideIconLoader` of `@panneau/ui/named-icons` for every Lucide icon, as before. `createPanneauApp()` keeps it as its default, so entries written by `panneau:install` don't change (decision 0036).
- 477d974: The app has a login page in `panneau` auth mode, a login with a token, and a logout (decision 0037).
  
  - `@panneau/app`: in `panneau` mode, the app shows its login page when the API answers `401`, at the URL the user was on, then that page once logged in. It offers an email and a password, a token when the auth settings have `token`, and a link for each OAuth provider. The sidebar has a "Log out" button: in `panneau` mode it calls `adapter.logout()`, forgets what it loaded for the user and shows the login page; in `external` mode it goes to `auth.logoutUrl`, and isn't there without it.
  - `@panneau/protocol`: `auth.token` (`{ label?, help? }`), a login with a single secret sent as `{ "token" }` to `POST /auth/login`, whose body in `openapi.json` is now one of the two shapes. `auth.logoutUrl`, the site's logout in `external` mode. The boot config takes `auth`, for the login page before the definition is loaded.
  - `@panneau/data`: `LoginCredentials` is `PasswordCredentials | TokenCredentials`. Adapters that implement `login()` take either one: an adapter that read `credentials.email` checks which it got first.
  - `@panneau/intl`: the messages of the login page and of the logout, in English and French.

### Patch Changes

- 6e76c06: The app loads the messages of its plugins, and its home route follows the definition.
  
  - `<Panneau>` and `createPanneauApp()` load the messages that plugins provide (`locales`) in the locale of the definition, over Panneau's, before they render the shell. A plugin's pages no longer need an `IntlProvider` of their own. Messages that fail to load are left out, with an error in the console.
  - The home route renders `pages.home` of the definition when it has one, as decision 0019 says: the page of a plugin, with its `props`, or the built-in `dashboard` (the cards of the resources until the dashboard has widgets). Without it, the home is the cards of the resources, as before.
  - `PanneauRoot` takes `messages`, added to Panneau's in the `IntlProvider` it provides when there is none above it.
- 83c82d4: The declaration files work in TypeScript projects on `"module": "NodeNext"`. Their relative specifiers now name their file (`./schemas/index.js`, `./rest.js`), so the types that an entry point re-exports, such as `Definition` of `@panneau/protocol`, are no longer missing under Node's resolution, and the CSS Modules that some declarations imported are declared in place. Nothing changes for projects on the `Bundler` resolution.
- Updated dependencies [6e76c06]
- Updated dependencies [83c82d4]
- Updated dependencies [477d974]
  - @panneau/ui@5.0.0-alpha.8
  - @panneau/actions@5.0.0-alpha.8
  - @panneau/core@5.0.0-alpha.8
  - @panneau/data@5.0.0-alpha.8
  - @panneau/fields@5.0.0-alpha.8
  - @panneau/forms@5.0.0-alpha.8
  - @panneau/intl@5.0.0-alpha.8
  - @panneau/lists@5.0.0-alpha.8
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
  - @panneau/forms@5.0.0-alpha.7
  - @panneau/lists@5.0.0-alpha.7
  - @panneau/ui@5.0.0-alpha.7
  - @panneau/protocol@5.0.0-alpha.7
  - @panneau/intl@5.0.0-alpha.7
  - @panneau/actions@5.0.0-alpha.7
  - @panneau/core@5.0.0-alpha.7
  - @panneau/data@5.0.0-alpha.7

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

### Patch Changes

- Updated dependencies [75a6496]
- Updated dependencies [48676ff]
- Updated dependencies [75a6496]
- Updated dependencies [4e453d2]
- Updated dependencies [75a6496]
  - @panneau/protocol@5.0.0-alpha.6
  - @panneau/data@5.0.0-alpha.6
  - @panneau/fields@5.0.0-alpha.6
  - @panneau/lists@5.0.0-alpha.6
  - @panneau/intl@5.0.0-alpha.6
  - @panneau/core@5.0.0-alpha.6
  - @panneau/ui@5.0.0-alpha.6
  - @panneau/actions@5.0.0-alpha.6
  - @panneau/forms@5.0.0-alpha.6

## 5.0.0-alpha.5

### Minor Changes

- 3830b4f: Navigating the app shell no longer loses unsaved changes, and announces each page:
  
  - **`@panneau/core`:** `createLeaveGuards()`, `LeaveGuardsProvider` and `useLeaveGuard()` let a router ask the forms below it before leaving a page.
  - **`@panneau/forms`:** under a `LeaveGuardsProvider`, a form with unsaved changes (`guardUnsavedChanges`, on by default) asks in a dialog before the router leaves its page, not only before the page closes or reloads.
  - **`@panneau/app`:**
      - links, "Go to…" and actions ask before leaving a form with unsaved changes, and so do the browser's back and forward buttons;
      - the tab is named after the page (`Ten walks for the fall · Articles · Northwind Journal`);
      - when the route changes, focus moves to the title of the new page and the page scrolls to the top. Opening the panel of an item focuses the panel, and closing it gives focus back to the item's link.
- bdb1173: A first app shell replaces the placeholder of `@panneau/app`, to try the Phase 2 shell on the v5 components:
  
  - **Layout:** a sidebar on the window's background and the page on a raised panel, like the vertical tabs of recent browsers. The sidebar collapses to a rail of icons (its button, or Ctrl+\ / ⌘+\), and the browser remembers it. Below the `lg` width of the root, a bar opens it as a drawer.
  - **Navigation:** the `main` menu of the definition (`resources`, `resource`, `page`, `link`, `separator`, `group`), or every resource and page without one, with the Lucide icons the definition names. Resources the user can't list are left out.
  - **Pages:** a home page with a card per resource, resource lists (`ListView`, with the query in the URL and actions run by `@panneau/actions`), create and edit forms (`Form`, with server errors, version conflicts and the unsaved changes guard), plugin pages, and a not found page.
  - **Theming:** the frame reads the `--panneau-shell-*` and `--panneau-sidebar-*` component tokens (exported as `shellTokens`, `sidebarTokens` and `appComponentTokens`), which `defineTheme()` accepts once `@panneau/app` is imported: the inset panel of the default, or a flat frame with the sidebar on a surface.
  - **Theme:** the app renders in `PanneauRoot`, with the theme of the definition and its plugins, and a light, dark or system color scheme the user picks in the sidebar.
  - `Panneau` and `createPanneauApp()` take an `iconLoader`, every Lucide icon by default.
  - `@panneau/intl` has the messages of the app (`appMessages`), in English and French.
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
- 6d1f1d8: The show route of an item opens its details in a panel next to its list ([decision 0028](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0028-item-panel.md)), instead of the edit form:
  
  - `@panneau/app`: titles in a list link to the show route, with the list's query. The panel shows the item's values, a link to edit it, and the `link` actions of the resource that apply to it, such as its page on the site. Its button or Escape closes it, back to the list with its query. It sits beside the list from the `xl` width of the root, and over it below. Its tokens are `--panneau-item-panel-*` (`itemPanelTokens`).
  - `@panneau/lists`: `ItemDetails` shows the values of one item with the displays of the lists. `ListView` takes `currentItemId`, which marks the row of the item shown and makes the link of its title the current page. Layouts get `isCurrent`. A table keeps its title column readable in a narrow list, and scrolls instead.
  - `@panneau/intl`: the messages of the panel, in English and French.
- 6d1f1d8: Previews of items, in the panel of the show route ([decisions 0009 and 0028](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0028-item-panel.md)):
  
  - `@panneau/core`: plugins register preview components by name in `previews`, for resources whose `features.preview` is `{ "mode": "component", "component": "<name>" }`. They get `PreviewProps`: the item, its resource and the locale, to render the page as the site shows it, blocks, partials or charts.
  - `@panneau/data`: `previewItem()`, optional on adapters and implemented by the REST adapter, posts values to `POST /resources/{resource}/{id}/preview` and returns the short-lived URL of the item's page. `useItemPreview()`, `itemPreviewQueryOptions()` and `queryKeys.itemPreview()` fetch it.
  - `@panneau/protocol`: the mock backend answers the preview route, with a `data:` page of the item's values, or the URL of its `previewUrl` option.
  - `@panneau/app`: the panel of an item opens on a Preview tab, before its Details, when its resource has a preview, and remembers the tab. A button widens the panel, for previews (`--panneau-item-panel-width-wide`, half of the page by default).
  - `@panneau/intl`: the messages of previews, in English and French.
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

### Patch Changes

- Updated dependencies [282e968]
- Updated dependencies [3830b4f]
- Updated dependencies [bdb1173]
- Updated dependencies [88a3d09]
- Updated dependencies [b86f35e]
- Updated dependencies [eadfc08]
- Updated dependencies [f2c79b5]
- Updated dependencies [81ec6b2]
- Updated dependencies [6d1f1d8]
- Updated dependencies [6d1f1d8]
- Updated dependencies [bdb1173]
- Updated dependencies [8372b27]
- Updated dependencies [199a687]
- Updated dependencies [fb33783]
- Updated dependencies [5779047]
- Updated dependencies [5b9aa44]
- Updated dependencies [5b2f3ce]
  - @panneau/actions@5.0.0-alpha.5
  - @panneau/core@5.0.0-alpha.5
  - @panneau/forms@5.0.0-alpha.5
  - @panneau/intl@5.0.0-alpha.5
  - @panneau/protocol@5.0.0-alpha.5
  - @panneau/data@5.0.0-alpha.5
  - @panneau/fields@5.0.0-alpha.5
  - @panneau/ui@5.0.0-alpha.5
  - @panneau/lists@5.0.0-alpha.5

## 5.0.0-alpha.4

### Patch Changes

- Updated dependencies [b9852a0]
- Updated dependencies [ecc77a6]
- Updated dependencies [db1f253]
- Updated dependencies [3974fb5]
  - @panneau/protocol@5.0.0-alpha.4
  - @panneau/data@5.0.0-alpha.4
  - @panneau/core@5.0.0-alpha.4

## 5.0.0-alpha.3

### Patch Changes

- Updated dependencies [3af252d]
- Updated dependencies [5a2ae0c]
- Updated dependencies [3c68628]
  - @panneau/protocol@5.0.0-alpha.3
  - @panneau/data@5.0.0-alpha.3
  - @panneau/core@5.0.0-alpha.3

## 5.0.0-alpha.2

### Patch Changes

- Updated dependencies [5af1673]
- Updated dependencies [d5cd252]
- Updated dependencies [27a1e08]
  - @panneau/protocol@5.0.0-alpha.2
  - @panneau/core@5.0.0-alpha.2
  - @panneau/data@5.0.0-alpha.2

## 5.0.0-alpha.1

### Major Changes

- 345e06c: Add `@panneau/app` with the app entry: `createPanneauApp({ element, plugins, adapter, config })` reads the boot config of the page, creates the Laravel adapter by default, uses the inlined definition or fetches it, and renders a placeholder shell that follows the client routes under `basePath` in history mode. When the API answers `401` (or `419` from Laravel), it sends the browser to the login URL, or calls `onUnauthorized`. Also exports `<Panneau>` and `readBootConfig()`.

### Patch Changes

- Updated dependencies [b1d02aa]
- Updated dependencies [de03e3d]
- Updated dependencies [3e4f251]
- Updated dependencies [dfb0b1f]
- Updated dependencies [345e06c]
- Updated dependencies [632b700]
- Updated dependencies [83999da]
- Updated dependencies [2401025]
- Updated dependencies [2565d67]
- Updated dependencies [61da236]
- Updated dependencies [b3c9d6c]
- Updated dependencies [aa02ea8]
  - @panneau/core@5.0.0-alpha.1
  - @panneau/data@5.0.0-alpha.1
  - @panneau/protocol@5.0.0-alpha.1
