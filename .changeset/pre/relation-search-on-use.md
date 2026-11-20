---
'@panneau/fields': patch
---

Relation fields search their source only once their picker is about to be used: when the field gets the focus, when the pointer comes over it, or when the picker opens. A form with many relation fields no longer sends a search for each one as it opens. `useRelationSearch()` searches the empty query at once, debounces typed ones, and isn't loading while it isn't enabled.
