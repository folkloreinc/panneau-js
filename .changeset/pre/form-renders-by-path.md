---
'@panneau/core': minor
'@panneau/forms': patch
---

A keystroke in a form no longer renders every field. `@panneau/forms`: each field subscribes to its own value, errors and visibility, the form to its status, and the layout to what it shows, so a change renders the field that changed and the fields of the same object (its block, or the top of the form: they get it as `parentValue`), not the fields of other blocks. Before, every field rendered on every keystroke. `@panneau/core`: `useFormSelector(form, select)` subscribes a component to a slice of a form's state, and `useFormField()` uses it. `state.errors` keeps the same object, and the same array for each path, while the errors stay the same, and `selectErrors()` returns the same array for the same errors (an empty one is always the same): its return type and that of `form.getErrors()` are now `readonly string[]`.
