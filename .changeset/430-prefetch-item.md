---
'@panneau/data': patch
'@panneau/lists': patch
'@panneau/app': patch
---

Items open from the cache when their link in a list was hovered or focused: the form or the panel shows without its skeleton. Resting the pointer on the link of an item for 100 ms, or focusing it, prefetches the item, unless it is still fresh; a pointer crossing rows and the hover of touch fetch nothing. New: `usePrefetchItem()` in `@panneau/data/query`, and the `onItemIntent` prop of `ListView` and of list layouts in `@panneau/lists`, which lists without a data layer can leave out.
