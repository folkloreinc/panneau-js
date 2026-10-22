# 0030: The parameters of the global search, its errors, and a scope per resource

- Status: accepted
- Date: 2026-10-22
- Issue: [#97](https://github.com/folkloreinc/panneau-js/issues/97)
- Specifies: [0029](0029-go-to-palette.md), the "Go to…" palette

## Context

[0029](0029-go-to-palette.md) shipped the palette with `GET /search?q=` alone, and left for later the parameters of the search, its errors, conformance checks, and a way to search a single resource. Backends need these rules to implement the endpoint: `laravel-panneau` is next ([folkloreinc/laravel-panneau#96](https://github.com/folkloreinc/laravel-panneau/issues/96)).

Searching one resource only needs the endpoint to accept which resources to search, and how many items of each.

## Decision

### The endpoint

- **`limit`**: items per resource, an integer from 1 to 20, 5 by default.
- **`resources`**: comma-separated ids of the searchable resources to search, every one by default.
- **`q`**: from 2 to 255 characters once trimmed.
- **At most 20 items in all**, whatever the limit, in the order of the definition.
- **`total`** of a resource, when the backend counts it, is how many of its items match.
- **Errors:**
    - an invalid parameter is a `422` problem with `errors` keyed by parameter (`q`, `limit`, `resources`). A resource that isn't searchable, or that the user can't list, is invalid: the endpoint says nothing of resources the user doesn't have;
    - a backend may limit how often a user searches, with a `429` and `Retry-After`.
- **Reference:** `readSearchQuery()` reads and validates the parameters, the mock backend uses it, and `toSearchQueryParams()` writes them. Both are in `@panneau/protocol/runtime`, with the limits as constants.
- **Conformance:** `runConformance()` checks that a word of the title of an item finds it, that `limit` and `resources` are read, and that invalid parameters are a `422`.

### The scope

- **"Search in"**, the last group of the palette, lists the searchable resources. Choosing one keeps the palette open, empty, and narrowed to that resource, shown as a chip before the field.
- **Narrowed**, the palette only shows the results of that resource, 20 of them (`limit=20&resources={id}`), and says to type 2 characters before it searches.
- **Backspace in the empty field**, or the chip's button, removes the scope. Closing the palette removes it too.
- **"See all N results"** ends the results of a resource whose `total` is higher than its items, and opens its list, searched with the same query.
- `CommandPalette` has the generic parts: `scope` and `onScopeRemove`, and items that keep it open (`keepsOpen`). Its list shows its `status` when it has no results.

### Rate limits

`@panneau/data` reads `Retry-After`: a `429` is a `RateLimitedError`, with `retryAfter` in seconds. The palette says that there were too many searches, and keeps its local groups.

## Consequences

- Products can search one resource, or a few, with `useSearch(q, { limit, resources })`.
- A backend that ignores `limit` or `resources`, or that answers invalid parameters with a `200`, fails the conformance kit.
- Recent items kept on the server stay for later.
