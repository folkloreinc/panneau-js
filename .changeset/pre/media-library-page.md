---
'@panneau/media': minor
---

Add `MediaLibrary` to `@panneau/media/picker`: the library of the media picker as a page, with the same sources, search, filters, upload and details, without the dialog and without picking. A click on a media opens its details. `MediaPicker` and `MediaLibrary` share one implementation, and `MediaPickerProps` now extends the new `MediaLibraryOptions` (decision 0081).
