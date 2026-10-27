---
'@panneau/ui': minor
---

`Skeleton` and `LoadingRegion` (#121, decision 0034): content that loads shows a skeleton of its shape instead of a spinner. `Skeleton` is a line of text (`lines` for several, the last one shorter), a `rect` sized by `width`, `height` or `aspectRatio`, or a `circle`. It is `aria-hidden`, has the `panneau-skeleton` class, reads the `skeleton` component tokens (`color`, `radius`, `duration`) and pulses unless the user prefers reduced motion. `LoadingRegion` goes around it, with `aria-busy="true"` and a status message that says once that the content loads.
