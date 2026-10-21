# 0025: Direct uploads to storage, separate from media

- Status: accepted
- Date: 2026-10-21
- Issue: [#79](https://github.com/folkloreinc/panneau-js/issues/79)
- Changes: the `presigned` upload mode of the protocol ([0010](0010-media.md)), which was named but not specified

## Context

Files reach the backend through PHP today: `POST /media` in `multipart/form-data`, or the file values and action parameters (an import) of a multipart request. That is fine for images and small files, but not for videos of several gigabytes. They have to go from the browser to S3-compatible storage in parts, and resume when interrupted.

Uppy 6 (`@uppy/aws-s3` 6) runs its own S3 client in the browser and only asks the application to sign each request: `signRequest({ method, key, uploadId?, partNumber?, contentType? })` answers `{ url, key?, headers? }`. The browser then sends `CreateMultipartUpload`, `UploadPart`, `CompleteMultipartUpload`, or a single `PutObject`, to the presigned URLs. Since the server never sees the upload complete, the client has to tell it.

Not every upload is a media: an import or a file field doesn't belong in the media library. `laravel-mediatheque` 2 had started to sign uploads for Uppy 6 on its own routes ([laravel-mediatheque#65](https://github.com/folkloreinc/laravel-mediatheque/issues/65)), tied to its media policy and its media disk.

## Decision

- **An upload is not a media.** With `"uploads": { "mode": "presigned" }` in the definition, the Panneau API has two routes:
    - `POST /uploads/sign`, with Uppy's request as its JSON body. It answers `{ url, key?, headers?, upload? }`: the presigned URL, the key the backend chose for a new file, the headers the URL was signed with, and the upload a new file created (`upl_…`). The backend signs later requests only for keys of the same user's open uploads, and answers `404` otherwise.
    - `POST /uploads/{upload}/complete`, with the file's name (`{ "name" }`, optional, since the key the backend chose doesn't keep it). The backend checks that the object exists, and answers the upload: `{ "data": { "id": "upl_…", "key", "name", "mime", "size" } }`.
- **Values reference uploads.** A value that takes a file (a file field, an action parameter such as an import) also takes `{ "upload": "upl_…" }`, which the backend resolves. A media is one use of an upload: `POST /media` takes `{ "upload": "upl_…" }` in JSON, as well as a file in `multipart/form-data`.
- **A `file` field type** holds files that belong to an item, outside the media library. Items give a stored file, `{ name, url, mime, size }` (`StoredFile`). Requests send `{ upload }` to replace it, the stored file to keep it, or `null` to remove it.
- **Both ways stay.** `POST /media` and multipart requests keep working, for small files and for backends without direct uploads. A field picks the direct upload for large files.
- **`Media.status`** (`pending`, `processing`, `ready`, `failed`) says where the ingest of a media is. Without it, a media is ready. A field shows it and refreshes the media until it is ready or failed.
- **Panneau owns uploads; the mediatheque only ingests.** `laravel-panneau` implements the routes itself: its own uploads (`upl_…`), on a disk of its configuration, authorized by its own gate, and signed with the disk's S3 client ([laravel-panneau#81](https://github.com/folkloreinc/laravel-panneau/issues/81)). `laravel-mediatheque` has no upload routes: it ingests files, including an upload that `POST /media` makes a media. Another backend can set `uploads.endpoint` to routes elsewhere that follow the same contract.
- **`@panneau/data/uploads`** provides `createPresignedUploads({ baseUrl, … })`, which gives `signRequest`, ready to pass to `@uppy/aws-s3`, and `complete(key)`, which resolves with the upload. It is plain `fetch` and doesn't import Uppy. `DataAdapter.uploadMedia()` takes `{ upload }` as well as a file.
- **The conformance kit** checks the signing routes (`uploads.sign`), and the mock backend answers them.
- **Next, in another pull request:** the fields. The `file` field and the upload core (an upload list, a file picker, `useUploads()`) are in `@panneau/fields`, which gets an upload source from its context, like its relation source, and doesn't depend on `@panneau/data`. The upload source on Uppy 6 is in its own entry point, `@panneau/fields/uppy`, the only one that imports Uppy. The `media` field is in `@panneau/media`, in the data layer, since it calls the adapter. They show progress per file, pause, cancel and retries, and the status after ingest.

## Consequences

- `laravel-panneau` needs the two routes, the resolution of `{ upload }` in values and actions, and `POST /media` from an upload.
- `laravel-mediatheque` drops its upload routes and models, and keeps ingestion from a file on a disk. Apps that uploaded through its routes (the pilot project's media library) upload through Panneau's.
- Direct uploads don't need `laravel-mediatheque`: an app with imports and no media library has them too.
- The `tus` mode stays named but unspecified, until a backend needs it.
