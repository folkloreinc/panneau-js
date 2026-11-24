---
'@panneau/forms': patch
'@panneau/intl': patch
---

The publication badge says what is saved. The `publication` component and panel show the state of the item as it was last saved (the form's initial values, which follow each saved version), and say apart, in the `warning` tone, when the publication fields have unsaved changes ("Published · Unsaved changes"). A Publish or Unpublish whose save doesn't succeed (invalid values, a `422`, a conflict, an error) puts the publication values back as they were before the press, and keeps the other edits. A scheduled item becomes Published when its date passes while the form is open, with a timer set for the date. Publish and Unpublish also save an item that has no other changes: a form's submit reads whether it has changes when it happens, not from its last render.
