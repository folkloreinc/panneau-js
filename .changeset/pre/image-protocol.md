---
'@panneau/protocol': minor
'@panneau/forms': minor
'@panneau/intl': minor
---

The protocol of the image editor and the `image` field (decision 0031):

- **`image` fields**, a built-in type: `media` fields for images, with the editor's options `ratios` (suggested), `rotate`, `focalPoint` and `transformBase` (`media`, `original` or `choose`). `lintDefinition()` checks their libraries as for `media`, and the mock backend references their images.
- **The `crop` portable rule:** `{ "rule": "crop", "value": { "ratios": ["16:9", "1:1"], "required": true } }`. It requires a crop for each image, and one of the ratios once rendered, within one pixel. `checkRules()` and `checkValues()` check it, and `@panneau/forms` words it ("Crop the image to 16:9 or 1:1.") in English and French.
- **`MediaTransform`** says its `base`: from the original file (the default), or over the media's own transform (`"media"`), with `baseTransform`, the media's transform it was made on. It keeps the keys that editor tools add.
- **`MediaInfo.transform`:** the media's own transform. The mock backend gives it from the library's `transform` field.
- **`parseRatio()`, `matchesRatio()` and `renderedCropSize()`** in `@panneau/protocol/runtime`.
