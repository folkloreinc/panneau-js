---
'@panneau/ui': patch
'@panneau/app': patch
---

Opening an item no longer reflows its list: the item panel of list pages goes over the list, on its right, at every width, so a table stays a table and keeps its columns (#366, decision 0099). `AsideLayout` takes `placement="overlay"` for this; forms keep their aside beside them.

The list page no longer takes the whole width while an item is open, and loses its `panneau-pages-with-panel` class.
