# 0039: Lists paged with cursors

- Status: accepted
- Date: 2026-10-30
- Issue: [#150](https://github.com/folkloreinc/panneau-js/issues/150)
- Changes: the pagination of lists in the protocol: `meta` of a list response, the query, and the list's definition

## Context

The protocol pages lists by number: `page` and `perPage` in the query, `page`, `perPage`, `total` and `lastPage` in `meta`. Some lists don't fit:

- they are too large to count on every page (the jobs of a media server, thousands a day), or change too fast for page numbers to mean the same thing twice;
- the backend pages them with a cursor, newest first, as most stores and APIs do for such data.

A backend could only map page numbers to cursors and make up a total: the list then said "1–50 of 51" for thousands of items, and offered page 2 only.

## Decision

- **A list declares its pagination**: `"list": { "pagination": "cursor" }`, or `pages`, the default. Clients know it from the definition, before any data.
- **The query** gets `cursor`: the `nextCursor` (or `previousCursor`) of a page. The first page has none. A list paged with cursors sends no `page`.
- **`meta`** is either the numbered pagination, as before, or `{ perPage, nextCursor, previousCursor?, total? }` (`CursorPagination`):
    - `nextCursor` is `null` on the last page;
    - `previousCursor` is `null` when the previous page is the first, which has no cursor. A backend that can't go back (Eclair's) leaves it out: clients go back through the cursors they followed;
    - `total` is optional, `null` or left out when the backend doesn't count.
    - `isCursorPage()` of `@panneau/protocol/runtime` tells the two apart.
- **Cursors are opaque** and belong to their query: a change of sort, filters, search or page size starts over from the first page. A cursor the backend can't read is a `422`, with `errors.cursor`.
- **Clients:**
    - the list state of `@panneau/core` keeps the cursor in the URL (`?cursor=…`), with `nextPage(cursor)` and `previousPage(previousCursor?)`, and the trail of cursors it followed;
    - `ListView` of `@panneau/lists` takes `cursors` instead of `total`, and shows the previous and next pages without page numbers (`CursorPagination`). `getPagingProps(meta)` gives either;
    - without a total, a list can't offer to select every matching item;
    - the media picker follows the cursors of a library paged with cursors.

## Consequences

- Additive in protocol version 1: numbered pages stay the default, and backends that don't declare `cursor` change nothing. `laravel-panneau` can offer it later, with `cursorPaginate()` of Eloquent, for resources that ask for it.
- Code that read `meta.total` or `meta.lastPage` of any list reads them from the numbered meta only: the type of `meta` is now a union.
- The conformance kit accepts both kinds of `meta`, and only checks totals when there is one.
