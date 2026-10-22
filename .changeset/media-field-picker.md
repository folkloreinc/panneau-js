---
'@panneau/media': minor
'@panneau/intl': minor
---

The `media` field opens the media picker: "Choose media" ("Add media" with `multiple`) browses the libraries given as `sources`, and the media picked replaces the field's media, or is added to its list. `MediaFieldEntry` gives the sources of every library the field allows, through the adapter of `DataAdapterProvider`. With the picker, the upload button reads "Upload a file" ("Upload files"). A media is now removed by its library and id, so that two libraries can have media with the same id. New messages in `@panneau/intl`: `chooseMedia`, `addMedia`, `uploadFile` and `uploadFiles`.
