# 0110: One registry of keyboard shortcuts, and a "?" help

- Status: accepted
- Date: 2026-11-23
- Issue: [#470](https://github.com/folkloreinc/panneau-js/issues/470)
- Changes: how `useCommandShortcut()` of [0029](0029-go-to-palette.md) listens, and the save shortcuts of forms (#428), which move to the registry with the same behaviour
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), 5.x (the interface)

## Context

Shortcuts were handled in three places, each with its own listener and its own rules, and nothing listed them:

- ⌘K for the "Go to…" palette, in `useCommandShortcut()` of `@panneau/ui`, on the window;
- ⌘\ for the sidebar, in the `AppLayout` of `@panneau/app`, on the window, ignored while typing;
- ⌘S and ⌘Enter for forms, through a small registry of forms in `@panneau/forms` (#428), on the document. Its rule of scopes (the form that holds the focus, then the last form of the dialog of the focus, then of the page) is the one every shortcut needs, and its comment said a registry of the app's shortcuts would replace it.

Lists and the editor will add more: `j`/`k`, `/`, `x` in lists are single keys, which WCAG 2.1.4 asks to be off while the user types, and possible to turn off. Tooltips formatted their keys by hand (`⌘` or `Ctrl`), in the Save button, the sidebar, the dock and the editor's toolbar.

## Decision

### One registry, in `@panneau/ui`

- **`PanneauRoot` keeps the registry**, with one `keydown` listener on the document. Fields, forms and lists work without the app, so it can't live in `@panneau/app`. A root inside another one uses the outer registry.
- **`useShortcut()` registers a shortcut while its component is mounted**: its keys, a label and a group for the help, a scope, an `enabled` flag, whether it fires in text inputs, and what it does (`perform`). Without a root, it does nothing, and components still work.
- **Keys are written once for every platform**, as `aria-keyshortcuts` writes them, with `Mod` for ⌘ on Apple platforms and Ctrl elsewhere: `Mod+K`, `['Mod+S', 'Mod+Enter']`, `?`. Keys that differ by platform take `{ apple, other }`.
- **A key that something already handled is left alone** (its default prevented): the editor's ⌘K for links (#452) wins inside the editor. A key that repeats only prevents the browser's default.

### Scopes decide who gets a key

From the focus outwards:

1. **the innermost element scope that holds the focus** (a form);
2. otherwise **the open dialog**: the last shortcut registered in the dialog of the focus, element scopes of that dialog included (the form of an action's parameters, from anywhere in its dialog);
3. otherwise, outside of every dialog, **the page**: the last shortcut of the page, element scopes of the page included.

A shortcut of the page never fires while a dialog holds the focus, nor from what a modal dialog hides. While a shortcut that uses a key with a modifier is registered, the browser never does its own thing with that key (its "Save page"), even when the shortcut belongs to another layer.

### Single keys

- **A shortcut without ⌘, Ctrl or Alt is a single key** (`?`, `j`, `Shift+J`). Single keys never fire while the focus is in a text input, a textarea, a select, a `contenteditable` (the editor) or a `textbox`.
- **Users can turn them off** (WCAG 2.1.4), in the help. The browser remembers it, as the other preferences of `usePreference()`: `panneau:single-key-shortcuts`.
- A shortcut with a modifier fires in text inputs, unless it says otherwise (`inInputs: false`: ⌘\, a key of some editors).

### The help

- **`?` opens a dialog that lists the shortcuts registered now**, by group ("General" first), with the keys of the platform: what a page shows is what it lists (a list page lists the shortcuts of lists once they exist). Shortcuts with the same id (the Save of two forms) are listed once. The switch of single keys is at its end.
- **It is also in the user's menu and in "Go to…"** ("Keyboard shortcuts"), through `useShortcutHelp()`.
- It is loaded with `import()` when it first opens: the initial bundle only has the registry.

### Formatting keys

`formatShortcut()` formats keys for people (`⌘S`, `⇧⌘Z`, `⌘↩` on Apple platforms; `Ctrl+S`, `Ctrl+Shift+Z`, `Ctrl+Enter` elsewhere) and for `aria-keyshortcuts` (`Meta+S`, `Control+S`). `useFormatShortcut()` adds the names of keys in the language of the interface, and `useShortcutLabel()` joins several combinations as alternatives ("⌘S or ⌘↩"). Tooltips use them, in place of their own formatting.

### The shortcuts moved

| Keys       | Label                            | Scope                                                        | Registered by                            |
| ---------- | -------------------------------- | ------------------------------------------------------------ | ---------------------------------------- |
| ⌘K         | "Go to…"                         | the page; the palette's dialog while it is open, to close it | `useCommandShortcut()`, `CommandPalette` |
| ⌘\         | "Collapse or expand the sidebar" | the page, not in text inputs                                 | `AppLayout`                              |
| ⌘S, ⌘Enter | "Save", in "Forms"               | the form                                                     | `FormView`                               |
| ?          | "Show keyboard shortcuts"        | the page                                                     | `PanneauRoot`                            |

`useCommandShortcut()` keeps listening on its own above a root, as before, for products that render the palette's trigger outside of one.

### Plugins

**`shortcuts` of `PanneauPlugin`**, resolved as its `commands` ([0097](0097-one-way-to-resolve-plugin-entries.md)): a list, or a function of the definition, of shortcuts with an id, keys, a label, a group and `perform`. The app registers them as shortcuts of the page while the shell is shown, in plugin order, and lists them in the help.

## Consequences

- `@panneau/ui`: `useShortcut()`, `useRegisteredShortcuts()`, `useShortcutHelp()`, `useFormatShortcut()`, `useShortcutLabel()`, `formatShortcut()`, `matchesKeys()`, `isSingleKey()`, `isTextInput()`, and their types. `isApplePlatform()` moves next to them, with the same export.
- `@panneau/core`: `Shortcut`, `ShortcutSource`, `getShortcuts()`, and `shortcuts` in `PanneauPlugin` and `PluginRegistry`.
- `@panneau/forms`: `shortcuts.ts` is gone. A form shown without a `PanneauRoot` no longer takes ⌘S.
- `@panneau/editor`: its toolbar formats its keys with `@panneau/ui`; its own formatter is gone.
- `@panneau/intl`: messages of the help in `@panneau/ui`, `panneau.app.toggleSidebar`, `panneau.forms.shortcutsGroup`; `panneau.forms.saveShortcut` is gone, the Save button's tooltip comes from the formatter.
- On Apple platforms, ⌘\ alone collapses the sidebar, no longer Ctrl+\ too. ⌘\ no longer toggles it while a dialog is open.
- Shortcuts of lists (`j`/`k`, Enter, `x`, `/`, `c`) come in a follow-up, on this registry.
