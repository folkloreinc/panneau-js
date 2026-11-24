---
'@panneau/forms': patch
'@panneau/app': patch
'@panneau/intl': patch
---

Save only what changed, from anywhere on the page. The Save button of an update without changes is disabled: it stays in the tab order, says "No changes to save" to assistive technologies, and submitting the form (Enter in a field, a shortcut) sends no request. A create form can always be saved. ⌘ S and ⌘ Enter (Ctrl S and Ctrl Enter elsewhere) save the form of the page wherever the focus is, and the form of an open dialog (the parameters of an action) rather than the page under it; ⌘ S never opens the browser's "Save page" while a form is shown. `FormView` and `Form` take `onDirtyChange`, and the app marks the title of the tab (`• `) while the form of an item has unsaved changes.
