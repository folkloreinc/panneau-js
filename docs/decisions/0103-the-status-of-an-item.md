# 0103: The status of an item, in relation pickers and cards

- Status: accepted
- Date: 2026-11-23
- Issue: [#436](https://github.com/folkloreinc/panneau-js/issues/436)
- Extends: [0067](0067-relation-cards.md), and the `itemTitle`, `itemSubtitle` and `itemImage` of resources

## Context

A relation field shows each item with its image and a line under its title ([0067](0067-relation-cards.md)), but not where the item stands. Picking the parent of a page or the article a newsletter links to, an editor can't tell a draft or an archived item from a published one without opening it, and links to an item that isn't live.

Lists already show states: a `select` field whose options have [tones](../protocol.md#tones) shows as a badge in its tone. But a relation source doesn't know which field of a resource is its state: a resource can have several `select` fields (a category, a language), and the protocol has no setting that names one. The `list` widget takes "the first `select` column", which works for a widget a project writes, but would guess wrong in a picker that every resource has.

The picker also showed only the first 20 results, with no way to reach the others but typing, and nothing said how many there were.

## Decision

- **`itemStatus` on a resource** names the field that holds the state of its items, next to `itemTitle`, `itemSubtitle` and `itemImage`. It is usually a `select` with tones. It is optional, and clients that don't know it ignore it: no backend has to change.
- **Pickers and cards show it as a badge**, after the title, in the tone of its option, with the `subtle` appearance of states. A value that isn't one of its options shows as text in `neutral`; a `select` with `multiple` shows its first value. The field can be one of the resource's `types` ([0077](0077-resource-types.md)).
- **What the field shows comes from the source**, as images and descriptions do. `RelationReference` has an optional `status` (`{ label, tone }`), which `createRelationSource()` reads from `itemStatus`. `describe()` says whether the items of a resource have one: a card whose reference comes without it (`{ id, label }`, from an item) gets it from `resolve()`. A screen reader reads the state with the option's description.
- **A source can give its results by pages.** `RelationSource` has an optional `searchPage(resource, query, { signal, next })`, which gives `{ items, total, next }`. The picker shows the first page, says how many results there are when the source counts them ("20 of 45 results"), and loads the `next` page as its list scrolls to the end. `createRelationSource()` reads the `meta` of the list: page numbers, or cursors for a list paged with them, which has a total only when the backend counts. A source without `searchPage()` works as before, with what `search()` gives and no count.

## Consequences

- `@panneau/protocol`: `Resource` has `itemStatus`, in the definition schema.
- `@panneau/fields`: `RelationField` shows the status, the count and the next pages. `createRelationSource()` gives `searchPage()` and the status of items; its adapter's `list()` can give the `meta` of its lists, as `@panneau/data`'s does.
- `@panneau/ui`: `ComboBox` takes a `badge` on its items, `onLoadMore` and `isLoadingMore` for a list that loads more as it scrolls, and a `footer` under its items.
- `laravel-panneau` can give resources an `itemStatus()` builder. Until then, nothing changes for its admins.
