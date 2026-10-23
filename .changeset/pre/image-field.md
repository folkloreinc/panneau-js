---
'@panneau/media': minor
'@panneau/intl': minor
---

The `image` field (decision 0031). `ImageField` is a `media` field for images, with the image editor:

- **Preview:** each image shows as it is rendered for this use, computed in the browser.
- **Edit** opens the editor on its transform.
- **Badges** say whether it is cropped, needs a crop, or was cropped over a version of the library that changed.
- **Options:** `ratios` (offered or enforced), `cropRequired`, `rotate`, `focalPoint` and `transformBase`, shown next to the description.
- **After a pick:** when a crop is required, the editor is the step right after the pick of one image.

`mediaPlugin` now gives the `image` type too, and `MediaFieldEntry` reads its options and its `crop` rule (`getImageOptions()`). `MediaField` takes them as `image`. The image editor and the field share how an image is drawn. The mockups of the editor and the field are deleted.
