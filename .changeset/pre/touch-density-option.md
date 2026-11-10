---
'@panneau/app': patch
'@panneau/ui': patch
---

The app now takes the density of the definition's theme (`theme.density`: `compact`, `comfortable`, `touch` or `auto`), as decision 0024 says: set it to `touch` for larger controls everywhere. The tags input is as tall as other inputs in each density: it was 8px taller.
