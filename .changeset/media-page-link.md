---
'@panneau/media': minor
'@panneau/intl': minor
---

`PickerMedia` takes an `href`, the page of the media in the product: `MediaLibrary` links to it from the details ("Open the media page"). `MediaPicker` doesn't, so as not to leave its dialog. A `MediaSource` takes `types`, the types of media it has: the type filter offers only those, and hides itself for a single type.
