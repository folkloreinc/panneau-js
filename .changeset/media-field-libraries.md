---
'@panneau/protocol': minor
'@panneau/media': minor
'@panneau/fields': patch
---

A `media` field can allow several libraries (decision 0027). Its `resource` takes a list of library ids, and without one it allows every library of the definition, instead of being an error when there are several. `MediaReference` gets `resource`, its library: ids are unique only within their library, so a field that allows several needs it in requests, and the mock backend refuses a media without it. `getMediaLibraries(definition, field)` (in `@panneau/protocol/runtime`) gives the libraries a field allows. `lintDefinition()` checks each listed id, and that a `relation` field names one resource. `getLibrary()` of `@panneau/media` takes a list too, and gives the first library: the field uploads to it, the references it makes carry their library, and it reads each media in its own library. The `relation` field ignores a list in `resource`.
