---
'@panneau/media': patch
---

The preview of an `image` field draws the media's `thumbnailUrl`, stretched to the size of the original so that its crop is the same, instead of loading the original. The original is only loaded when the image editor opens, or when the thumbnail doesn't load or doesn't have the proportions of the original.
