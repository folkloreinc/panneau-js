---
'@panneau/fields': patch
'@panneau/lists': patch
'@panneau/media': patch
'@panneau/protocol': patch
---

The file field shows each file as a card: the thumbnail of an image (or its `thumbnailUrl`, such as the poster of a video), the icon of its type for other files, and its name, type and size. An image just chosen shows before it is saved. Stored files can give a `thumbnailUrl`. The gallery and table thumbnails of lists, and the media picker, show the icon of a file's type (a PDF without a preview), never a broken image. `FileThumbnail`, `getFileKind()` and `kindOfMime()` are exported from `@panneau/fields`.
