---
'@panneau/media': minor
'@panneau/intl': minor
---

New `@panneau/media/picker` entry point (decision 0027): `MediaPicker`, a dialog to browse media libraries, upload to them and pick one media, or several with `multiple`, on `MediaSource`s that Panneau or a product implements. It has search, a type filter, sorts, the filters of the sources and of the opener (the opener's `filter` is locked), infinite scroll that keeps its place (across openings with `stateKey`), a selection across libraries, `accept` and `maxSize` that grey out what doesn't match, details that edit the fields of a media with `update()` and ask before losing changes, an Upload tab whose files become media of the library shown and are selected (`confirmOnUpload` confirms a single one at once), and follows media being processed. It returns references with their library. The entry point loads neither `@panneau/data` nor `@panneau/core`. `createResourceMediaSource(adapter, library)`, in `@panneau/media`, gives the source of a library resource. `@panneau/intl` gets the picker's messages, in English and French.
