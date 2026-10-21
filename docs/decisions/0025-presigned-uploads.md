# 0025: Direct uploads to S3 through presigned requests

- Status: proposed
- Date: 2026-10-21
- Issue: [#79](https://github.com/folkloreinc/panneau-js/issues/79)
- Changes: the `presigned` upload mode of the protocol ([0010](0010-media.md)), which was named but not specified

## Context

`DataAdapter.uploadMedia(file)` sends a file in one request, through PHP. That is fine for images, but not for videos of several gigabytes. They have to go from the browser to S3-compatible storage in parts, and resume when interrupted.

Uppy 6 (`@uppy/aws-s3` 6) runs its own S3 client in the browser and only asks the application to sign each request: `signRequest({ method, key, uploadId?, partNumber?, contentType? })` answers `{ url, key?, headers? }`. The browser then sends `CreateMultipartUpload`, `UploadPart`, `CompleteMultipartUpload`, or a single `PutObject`, to the presigned URLs. Since the server never sees the upload complete, the client has to tell it to ingest the file.

`laravel-mediatheque` 2 is adding this flow behind its routes ([laravel-mediatheque#65](https://github.com/folkloreinc/laravel-mediatheque/issues/65)): `uploads/sign` and `uploads/{upload}/complete`. The pilot project uploads with Uppy 6 directly for now.

## Decision

- **The protocol specifies the `presigned` mode** of `definition.uploads`. With `{ "mode": "presigned", "endpoint": "…/uploads" }`, the endpoint has two routes:
    - `POST {endpoint}/sign`, with Uppy's request as its JSON body. It answers `{ url, key?, headers?, upload? }`: the presigned URL, the key the backend chose for a new upload, the headers the URL was signed with, and, for a new upload, the id of the upload (`upl_…`). The backend creates the upload on the first request of a file, signs later requests only for keys of the same user's open uploads, and answers `404` otherwise.
    - `POST {endpoint}/{upload}/complete`, without a body. The backend checks that the object exists, ingests it, and answers `{ "data": Media }`.
- **The backend owns the routes.** `laravel-panneau` announces the routes of the mediatheque in the definition, under the prefix the application registered (a tenant, for example), so frontends don't depend on Laravel.
- **`Media.status`** (`pending`, `processing`, `ready`, `failed`) says where the ingest of a media is. Without it, a media is ready. A field shows the status and refreshes the media until it is ready or failed.
- **`@panneau/data/uploads`** provides `createPresignedUploads({ endpoint, … })`, which gives `signRequest`, ready to pass to `@uppy/aws-s3`, and `complete(key)`. It is plain `fetch`, with the headers and errors of the adapters (`getLaravelHeaders()`, `createLaravelError()` for Laravel), and doesn't import Uppy: apps without media don't load it.
- **Next, in another pull request:** a media field and an upload list in `@panneau/fields`, on Uppy 6 as an optional peer dependency of their own entry point. They show progress per file, pause, cancel and retries, and the status after ingest.

## Consequences

- `laravel-mediatheque#65` should answer `upload` in the sign response for a new upload (the client otherwise reads it from the last segment of the key), and `{ "data": Media }` in the shape of the protocol on completion.
- Small files can still use `uploadMedia()`.
- The `tus` mode stays named but unspecified, until a backend needs it.
