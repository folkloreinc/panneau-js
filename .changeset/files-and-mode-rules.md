---
'@panneau/protocol': patch
'@panneau/core': patch
'@panneau/fields': patch
---

A chosen file counts as filled, and rules can be limited to the create or update mode of a form.

- `@panneau/protocol`: `isFilled()` counts a file chosen in the browser (`File`, `Blob`) as filled, so a required `file` field saves without direct uploads, its file sent in `multipart/form-data` (#163). `accept` and `maxSize` read the type and size of such a file. A portable rule takes `"mode": "create"` or `"mode": "update"`, to apply in that mode only: a password required to create a user, optional to edit one (#164). `checkValues()` applies it in the mode of its options, and `checkRules()` takes the mode as a fourth argument; without a mode, such a rule is skipped. The conformance kit checks that a backend doesn't apply a `required` limited to `create` to updates.
- `@panneau/core`: `resolveFields()` and `resolveForm()` with a mode keep the rules of that mode, without their `mode`, in nested fields too, and drop those of the other. Two different files are no longer equal for `isEqual()`, so choosing another file is a change.
- `@panneau/fields`: the required mark and the other rules read by fields (`findRule()`, `isRequired()`) ignore a rule limited to a mode until the form resolves it.
