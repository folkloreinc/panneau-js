---
'@panneau/forms': minor
'@panneau/editor': minor
'@panneau/ui': minor
'@panneau/intl': minor
---

Quicker long forms ([#227](https://github.com/folkloreinc/panneau-js/issues/227)):

- `@panneau/forms`: ⌘ Enter on Apple platforms, Ctrl Enter elsewhere, saves a `FormView` (and a `Form`) from any of its fields, a text area and the rich text editor included. Keys pressed in a dialog or a popover that a field opens are left to it. The submit button gives the shortcut in its tooltip and in `aria-keyshortcuts`. After a failed save, every collapsed section that holds an error opens, not only the one of the first error; tabs keep their error counts, and the tab of the first error shows.
- `@panneau/editor`: Mod-Enter no longer adds a line break, so that it saves the form. Shift Enter still does.
- `@panneau/ui`: `Button` (and `IconButton`) render `aria-keyshortcuts`, which React Aria left out: the "Go to…" button of the sidebar now gives its shortcut too.
- `@panneau/intl`: the `panneau.forms.saveShortcut` message, in English and French.
