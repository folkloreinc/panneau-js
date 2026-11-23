---
'@panneau/lists': patch
'@panneau/app': patch
'@panneau/intl': patch
---

The calendar of a list says when a month has no items ("No items in November 2026"), in an empty state where its grid would be, with its buttons to the other months above it, rather than a grid of empty days; it doesn't say so while the items of the month load. Each item shows its state next to its title, as a dot in the tone of its option, the tone of its badge in the table and the cards, with the state's label for screen readers, and its whole title on hover. `ListView` takes `itemStatus`, the field that holds the state of items (`itemStatus` of the resource, decision 0103), which the app passes; layouts get `getItemStatus()`, and `ListCalendarProps` has `isLoading`. The built-in calendar layout loads with `import()` when a list shows it, with a skeleton of its grid meanwhile.
