---
'@panneau/core': minor
'@panneau/forms': patch
---

A required field inside a hidden tab or section no longer blocks the save (decision 0098). `resolveFields()` and `resolveForm()` of `@panneau/core`, which are public, now give each field the `visibleWhen` of the layout nodes that hold it, combined with its own (`all` of them, `any` of the places of a field placed twice): forms neither show nor validate a field whose tab or section is hidden. The definition sent by the backend doesn't change, but the fields these functions give may have a `visibleWhen` that the definition's don't. The protocol now says that a field in a hidden node is hidden: backends don't validate it nor save its value (laravel-panneau follows in its own release).
