---
'@panneau/media': minor
'@panneau/intl': minor
---

`@panneau/media/editor`: the image editor (decision 0031). `ImageEditor` edits a transform of an image in a dialog, with the image as it will be rendered:

- **Tools:** crop (a frame with handles and thirds, ratios, and numbers), rotate (with flips) and focal point (with the automatic crops it gives), from `useImageEditorTools()`. A product adds its own, with a panel, an overlay and a `validate()`.
- **The keyboard** moves and resizes the crop frame, and moves the focal point.
- **The field's rules:** offered or enforced `ratios`, and a required crop, which the editor proposes around the focal point.
- **The base of a transform for one use:** over the media's own transform by default, with `base` and `baseTransform`, or from the original file. When the media's transform changed, the crop is moved inside the new version, and the editor says so.

The entry point loads neither `@panneau/data` nor `@panneau/core`. Its messages are in `@panneau/intl`, in English and French.
