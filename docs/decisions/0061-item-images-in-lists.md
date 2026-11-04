# 0061: The image of items in the table, and in media libraries

- Status: proposed
- Date: 2026-11-04
- Changes: the `itemImage` of resources ([0044](0044-gallery-and-calendar.md)), for media libraries ([0026](0026-media-libraries.md))

## Context

[0044](0044-gallery-and-calendar.md) made the `itemImage` field of a resource the image of its items in the gallery, and left the gallery out of lists without one. Two things were missing:

- **Media libraries had no image.** Every item of a resource of kind `media` has a `media`, with its `thumbnailUrl` ([0026](0026-media-libraries.md)), but `itemImage` names a field, and a library declares none for its image. A library then offered no gallery, even with `"layouts": ["gallery", "table"]`: the list of images showed only a table, without any image.
- **The table showed no image.** Panneau 4 started each row of a list with a small thumbnail when its items had an image, which is how people find an image, a product or a person in a long table.

The details of a media (its panel) didn't show its image either: its `file` field, a stored file, had no display, and showed as empty.

Making `itemImage` a path into items (`media.thumbnailUrl`) was considered. It would add a syntax to the protocol for one case, while what an image value is (a media reference, a media, a file, a URL) is already read the same way everywhere.

## Decision

- **A media library's image is the `media` of its items.** In a resource of kind `media`, `itemImage` defaults to `media`, the key of the `media` of its items: its thumbnail, or the URL of an image. A library can still name another field. A backend may also say `"itemImage": "media"`, for clients made before this decision.
- **What an image value is.** Clients read an `itemImage` value as a URL, a media reference (`{ id, label, media }`), a media (`MediaInfo`), or a stored file, and the first of a list. A media gives its `thumbnailUrl`, or its `url` when it is an image; a file gives its `url` when its `mime` is an image that browsers show (JPEG, PNG, GIF, WebP, AVIF, SVG…), not a HEIC or TIFF original, nor a PDF. Anything else has no image.
- **The table starts each title with a thumbnail** when the resource has an image, in every list, not only libraries: a square of its image (`object-fit: cover`), loaded when it comes into view (`loading="lazy"`), with an empty `alt`, since the title is next to it. An item without an image shows a neutral placeholder in its place, so the titles line up. On narrow lists, the thumbnail stays before the title of each block.
- **The panel of a media shows its image** over its details, as large as the panel, without cropping. A media without an image (a document without a thumbnail) shows none.
- **`file` and `image` values have displays.** A `file` value shows the name of each file, linked to its URL, after the thumbnail of an image that browsers show, or an icon. An `image` value is shown as a `media` one: its thumbnail and its label. The `media` display reads references, with the thumbnail of their `media` and their `label`.

## Consequences

- `@panneau/protocol`: `getItemImageField(resource)` gives the key of the image of a resource's items: its `itemImage`, or `media` in a library. The description of `itemImage` says so.
- `@panneau/lists`: `TableLayout` draws the thumbnails from `getItemImage`, which `ListView` gives every layout when it has `itemImage`; the skeleton of a table draws their placeholders. `getImageUrl()` reads media and files as above. `FileDisplay` is built in for `file`, and `MediaDisplay` for `image` too.
- `@panneau/app`: a library's list offers its gallery and shows its thumbnails without declaring `itemImage`, and so do the results of "Go to…". The panel of a media shows its image.
- `laravel-panneau`: `MediaResource::itemImage()` returns `media`, for the clients made before this decision.
- A layout of a plugin gets `getItemImage` as the built-in ones do.
