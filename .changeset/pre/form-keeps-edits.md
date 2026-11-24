---
'@panneau/core': patch
'@panneau/forms': patch
'@panneau/intl': patch
'@panneau/app': patch
---

A form no longer drops what is being typed when its item gets a new version (a refetch on focus, after an action, or a save while typing). A form without unsaved changes takes the new version; a form with unsaved changes keeps them, says that a newer version was saved, and its "Compare" opens the conflict dialog. New: `form.refresh(item)`, `form.reviewNewer()` and `newer` in the form state in `@panneau/core`, and the `item` prop of `Form` in `@panneau/forms`.
