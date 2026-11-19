---
'@panneau/protocol': minor
'@panneau/lists': minor
'@panneau/fields': minor
'@panneau/data': minor
'@panneau/app': minor
---

Lists ask for the fields they show, and relation fields resolve their ids in one request. `@panneau/lists`: `useListFields()` gives the fields that a `ListView` shows of its items (its columns shown, the title and the image of items, the field of the calendar), and `getListFields()` computes them, for the `fields` of the list query; `undefined` with a column that has `render` or a layout that isn't built in. `@panneau/app`: the list of a resource sends them. `@panneau/fields`: `createRelationSource().resolve()` asks for the ids of every field of a form in one list query on `filter[ids]` (by groups of 100), instead of a `get()` per id, keeps the items in its new `items` option (the item queries of the query client, in the app), and has a new `peek()`, the reference of an item it already has; `useRelationReferences()` no longer keeps a cache of its own, and `RelationListAdapter` no longer has `get()`. `@panneau/data`: lists and items stay fresh for 30 seconds, until a mutation invalidates them. `@panneau/protocol`: `MAX_PER_PAGE` (100), the most items a page has: `perPage`, `perPageOptions` and `calendar.perPage` of a list are at most 100, the mock backend caps `perPage` there and gives the fields of `fields` only, and the conformance checks both (`list.per-page`, `list.fields`).
