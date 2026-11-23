---
'@panneau/fields': minor
'@panneau/ui': minor
'@panneau/protocol': minor
'@panneau/intl': patch
---

Relation fields reach every result, say how many there are, and show where each item stands (#436, decision 0103). The picker loads the next results as its list scrolls to the end, and says "20 of 45 results" when the source counts them: a `RelationSource` can give `searchPage(resource, query, { signal, next })`, which `createRelationSource()` does from the `meta` of the list (page numbers or cursors). A resource can name the field that holds the state of its items with `itemStatus`, a new optional setting of the protocol, usually a `select` with tones: results and cards show its label as a badge in its tone (`RelationReference.status`). The empty single field now takes the width of its column, as its card does, and its list is as wide (#410). `ComboBox` takes a `badge` on its items, `onLoadMore` and `isLoadingMore`, and a `footer`.
