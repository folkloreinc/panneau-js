---
'@panneau/app': patch
---

From the `lg` width, the sticky footer of a resource form spans the panel of the shell from edge to edge, on the panel's background, instead of a band of the page's background that stops at the panel's padding (visible in dark mode). The shells' panels clip it (`overflow-x: clip`). Below `lg`, the fixed footer doesn't change.
