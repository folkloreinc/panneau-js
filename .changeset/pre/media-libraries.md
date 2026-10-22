---
'@panneau/protocol': minor
'@panneau/data': minor
'@panneau/media': minor
---

Media libraries are resources (decision 0026). A resource of kind `media` (`Resource.kind`) has a `file` field and gives each item a read-only `media` (`MediaInfo`: type, mime, size, URLs, renditions, dimensions, duration, status). Every media operation is a resource operation: `POST /resources/{library}` with `{ file: { upload } }` makes a media, and the `/media` endpoints are removed, with the `Media`, `MediaResponse` and `MediaListResponse` schemas and the media methods of `DataAdapter` (`listMedia`, `getMedia`, `uploadMedia`, `updateMedia`, `deleteMedia`). A `media` field references media of a library (its `resource`, optional with a single library): its value is a `MediaReference` (`{ id, label, media, transform }`), and requests send ids or `{ id, transform }`. `lintDefinition()` checks both. The mock backend serves libraries. `MediaField` takes a `resource` and makes media with `create()` and reads them with `get()`; `isMedia()` and `toMedia()` become `toMediaReference()` and `toMediaReferences()`, with `getLibrary()`.
