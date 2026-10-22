# 0026: Media libraries are resources

- Status: accepted, amended by [0027](0027-media-picker.md): a `media` field can allow several libraries
- Date: 2026-10-21
- Amends: [0010](0010-media.md), [0025](0025-presigned-uploads.md)

## Context

[0010](0010-media.md) made media part of the protocol through endpoints of their own: `GET /media`, `POST /media`, `/media/{id}/file`, `/media/tags` and `/media/{id}/restore`, served by a media adapter in `laravel-panneau`. Those endpoints weren't built in `laravel-panneau` yet; in `panneau-js`, only the media field called them, through `uploadMedia()` and `getMedia()` of the data adapter.

Meanwhile, Panneau got direct uploads and a `file` field ([0025](0025-presigned-uploads.md)): a file that belongs to a value, outside any library. So three things now take files, and they have different lives:

- an **upload** is a transient transfer to storage, which a value consumes;
- a **file** belongs to a value, and lives and dies with its item;
- a **media** has an identity, metadata and processing, and is reused.

A dedicated media API duplicates what resources already do: listing, filters, search, pagination, scope, policies, actions, trash and restore. It also leaves no room for what projects need from their library: their own fields (credit, alt text, rights), their own scope (a tenant), several libraries ("Images" and "Documents"), or a library without `laravel-mediatheque`.

Most of what Panneau's users upload are media (images, mostly), so the library keeps its name. A media is any file of a library, of any type: an image, a video, a PDF, a CSV that is reused.

## Decision

- **A media library is a resource of kind `media`.** `Resource.kind` says what a resource is: without it, an ordinary resource; clients treat a kind they don't know as an ordinary resource. A resource of kind `media`:
    - has a `file` field, of type `file` and not `multiple`: the original file, whose `accept`, `maxSize` and other rules are the library's;
    - gives each item a `media`: what the backend computed about its file (`type`, `mime`, `size`, `url`, `thumbnailUrl`, `variants`, `width`, `height`, `duration`, `status`, `metadata`). It is read-only: clients never send it, and the editable properties of a media are the fields of its resource;
    - accepts `filter[type]` (`image`, `video`, `audio`, `document`, `other`) in its list.
- **Every media operation is a resource operation.** Listing and search are `GET /resources/{library}`; making a media from an upload is `POST /resources/{library}` with `{ "file": { "upload": "upl_…" } }`; replacing its file is a `PATCH` with a new upload; trash and restore are the resource's. The `/media` endpoints, and the media methods of the data adapter, are removed.
- **A `media` field is a relation to a library.** Its `resource` names the library, and can be left out when the definition has only one. In items, its value is a reference `{ id, label, media, transform }` (`MediaReference`): what lists and fields show without fetching the media, and the edits of the image for this use. Requests send the id, or `{ id, transform }`. The backend resolves ids within the library's scope, as for relations.
- **A library's scope decides which media it holds.** Several libraries can share a backend: each one scopes its items, by type or by a column of the project, and gives its scope to the media it makes.
- **Ids are opaque**, unique within their resource, as for every resource. A backend may give globally unique ids (`laravel-mediatheque`'s `med_…`), which content can reference.
- `lintDefinition()` checks the `file` field of `media` resources, and that `media` fields name a library.

## Consequences

- Projects shape their library like any resource: fields, list, filters, policies, scope, actions. A library can be a tab of the admin, or not.
- A library doesn't need `laravel-mediatheque`. With it, the library's repository ingests the file and computes `media` from the mediatheque's renditions; without it, a resource with a `file` field computes `media` from the stored file.
- `@panneau/media`'s field makes media with `create()` and reads them with `get()`, through the library's resource. A media picker, to browse a library and upload to it, comes next, on a source that products such as Niche can also implement with their own API.
- The non-destructive image edits of [0010](0010-media.md) stay: a library's `transform` field holds the edits of a media, and a `media` value holds the edits for one use.
