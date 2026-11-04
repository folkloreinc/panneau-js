---
'@panneau/protocol': minor
'@panneau/lists': minor
'@panneau/app': minor
---

The image of items in the table, and in media libraries (decision 0061):

- `@panneau/protocol`: the `itemImage` of a resource of kind `media` defaults to the `media` of its items. `getItemImageField(resource)` gives it, or the resource's `itemImage`.
- `@panneau/lists`: with `itemImage`, the table starts each title with a square thumbnail of the image of its item, loaded lazily, or a placeholder for an item without one, and its skeleton draws their placeholders. `getImageUrl()` gives the URL of a media only when it is an image or has a thumbnail, and the URL of a file only when it is an image that browsers show: a PDF or a HEIC original has no image. `file` values have a display (`FileDisplay`: the name of each file linked to its URL, after the thumbnail of an image or an icon), `image` values are shown as `media` ones, and `MediaDisplay` reads media references (the thumbnail of their `media`, their `label`).
- `@panneau/app`: a media library offers its gallery and shows its thumbnails without declaring `itemImage`, and so do its items in "Go to…". The panel of a media shows its image over its details.
