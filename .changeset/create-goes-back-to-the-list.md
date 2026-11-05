---
'@panneau/app': minor
'@panneau/lists': minor
'@panneau/ui': patch
'@panneau/intl': patch
'@panneau/protocol': patch
---

After a create, the list (decision 0066):

- `@panneau/app`: creating an item goes back to the list of its resource, in place of the create page, instead of opening its edit page with a toast. The list highlights the new item and scrolls it into view. Only a list that doesn't show it (its filters, its sort or its page) says it was created, in a toast with "Open".
- `@panneau/lists`: `ListView` takes `highlightedItemId`: the item gets a subtle background that fades after about 3 seconds (without the fade when the system asks for less motion), is scrolled into view, and is marked `data-highlighted`. Layouts get `isHighlighted(item)`.
- `@panneau/ui`: toasts rise above a footer that sticks to the bottom (`useToastOffset()`) only while it covers the bottom of the viewport. The footer of a short form, after its last field, no longer sends them up the screen.
- `@panneau/intl`: "Open", for the toast of a created item, in English and French.
- `@panneau/protocol`: the mock backend gives a created or duplicated item an id that none of the items it started with has.
