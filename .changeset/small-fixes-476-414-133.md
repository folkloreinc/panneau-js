---
'@panneau/ui': patch
'@panneau/media': patch
---

The selection as text has its own token (#476, amends decision 0073): `--panneau-selected-strong`, for text and icons of a selection on the page's backgrounds and on `--panneau-selected-subtle`. It defaults to the accent as text (`--panneau-color-accent-strong`), and `checkTheme()` checks it at 4.5:1 on the surface and on `selected-subtle`. The selected ratio of `ImageEditor` reads it instead of the fill `--panneau-selected-bg`, so a light accent or a light selection keeps its label readable.
