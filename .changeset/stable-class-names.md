---
'@panneau/ui': minor
'@panneau/fields': minor
'@panneau/forms': minor
'@panneau/lists': minor
'@panneau/actions': minor
---

Class names are now stable and readable, without a hash, so that projects can target them like Bootstrap's: `.panneau-card`, `.panneau-card-header`, `.panneau-button-sm` (decision 0024). Each package lists its classes in `api/<package>.classes.md`. They are public API.
