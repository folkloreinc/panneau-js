---
'@panneau/fields': patch
---

The location field's map no longer throws when it goes away just after a zoom with the wheel (#503). Leaflet waits 40ms for the wheel to stop before it zooms, and `remove()` left that zoom pending: it then read the panes of the removed map. The map now cancels it before it is removed.
