---
'@panneau/media': patch
---

The preview of an `image` field draws a thin line around the image itself, inside the margins of its box, so an image with white edges, like a poster, no longer blends into the grey card. It has no background, so transparent images stay as they are. `TransformedImage` takes a `frameClassName` for that line.
