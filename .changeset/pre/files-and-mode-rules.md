---
'@panneau/protocol': minor
'@panneau/core': minor
'@panneau/fields': patch
'@panneau/forms': patch
---

A chosen file counts as filled, and rules can be limited to the create or update mode of a form.

- `@panneau/protocol`: `isFilled()` counts a file chosen in the browser (`File`, `Blob`) as filled, and other collections by their `length` or `size` (an empty `FileList`, `Map` or `Set` isn't filled), so a required `file` field saves without direct uploads, its file sent in `multipart/form-data` (#163). `accept` and `maxSize` read the type and size of such a file. A portable rule takes `"mode": "create"` or `"mode": "update"`, to apply in that mode only: a password required to create a user, optional to edit one (#164). `checkValues()` applies it in the mode of its options, and `checkRules()` takes the mode as a fourth argument; without a mode, such a rule is skipped. The conformance kit checks that a backend doesn't apply a `required` limited to `create` to updates.
- `@panneau/core`: `resolveFields()` and `resolveForm()` with a mode keep the rules of that mode, without their `mode`, in nested fields too, and drop those of the other. A form has a `mode` (`form.mode`): its `mode` option, or `update` with a version and `create` without. Two different files are no longer equal for `isEqual()`, so choosing another file is a change.
- `@panneau/fields`: the required mark and the other rules read by fields (`findRule()`, `isRequired()`) ignore a rule limited to a mode until the form resolves it.
- `@panneau/forms`: `Form` infers its mode as `useForm()` does when it has no `mode` prop, and `FormView` resolves its fields in the mode of its form, so the required mark matches the rules checked on save. In `create` mode, both leave out `updateOnly` fields, as the checks already did.
