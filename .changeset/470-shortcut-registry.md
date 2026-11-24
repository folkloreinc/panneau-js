---
'@panneau/ui': minor
'@panneau/core': minor
'@panneau/forms': patch
'@panneau/app': minor
'@panneau/editor': patch
'@panneau/intl': minor
---

One registry of keyboard shortcuts, and a "?" help (decision 0110). `PanneauRoot` keeps the registry, with one listener on the document: `useShortcut()` of `@panneau/ui` registers a shortcut while a component is mounted, with its keys (`Mod+K`, ⌘ on Apple platforms and Ctrl elsewhere), a label, a group, a scope and `perform`. The element that holds the focus gets a key first, then the open dialog, then the page; a shortcut of the page never fires under a dialog. Single keys (`?`) never fire while the user types, and users can turn them off in the help, which the browser remembers (`panneau:single-key-shortcuts`). `?` opens the help, a dialog that lists the shortcuts registered now by group, also from the user's menu and "Go to…" (`useShortcutHelp()`); it loads when it first opens. `formatShortcut()`, `useFormatShortcut()` and `useShortcutLabel()` format keys for tooltips and `aria-keyshortcuts`, in the Save button, the sidebar, the dock and the editor's toolbar. ⌘K, ⌘\ and ⌘S / ⌘Enter move to the registry with the same behaviour, except that ⌘\ is ⌘\ only on Apple platforms and no longer works under a dialog; a form shown without a `PanneauRoot` no longer takes ⌘S. Plugins add `shortcuts`, as they add `commands`: an id, keys, a label, a group and `perform` (`Shortcut`, `getShortcuts()` of `@panneau/core`). `@panneau/intl`: `panneau.forms.saveShortcut` is gone (the tooltip of Save comes from the formatter); new messages for the help, `panneau.app.toggleSidebar` and `panneau.forms.shortcutsGroup`.
