# 0025: Direct uploads to storage, separate from media

- Status: proposed
- Date: 2026-10-21
- Issue: [#79](https://github.com/folkloreinc/panneau-js/issues/79)
- Changes: the `presigned` upload mode of the protocol ([0010](0010-media.md)), which was named but not specified

## Context

Files reach the backend through PHP today: `POST /media` in `multipart/form-data`, or the file values and action parameters (an import) of a multipart request. That is fine for images and small files, but not for videos of several gigabytes. They have to go from the browser to S3-compatible storage in parts, and resume when interrupted.

Uppy 6 (`@uppy/aws-s3` 6) runs its own S3 client in the browser and only asks the application to sign each request: `signRequest({ method, key, uploadId?, partNumber?, contentType? })` answers `{ url, key?, headers? }`. The browser then sends `CreateMultipartUpload`, `UploadPart`, `CompleteMultipartUpload`, or a single `PutObject`, to the presigned URLs. Since the server never sees the upload complete, the client has to tell it.

Not every upload is a media: an import or a file field doesn't belong in the media library. `laravel-mediatheque` 2 already keeps uploads (`upl_…`) apart from media, and is adding the signing to its own routes for apps that use it without Panneau ([laravel-mediatheque#65](https://github.com/folkloreinc/laravel-mediatheque/issues/65)).

## Decision

- **An upload is not a media.** With `"uploads": { "mode": "presigned" }` in the definition, the Panneau API has two routes:
    - `POST /uploads/sign`, with Uppy's request as its JSON body. It answers `{ url, key?, headers?, upload? }`: the presigned URL, the key the backend chose for a new file, the headers the URL was signed with, and the upload a new file created (`upl_…`). The backend signs later requests only for keys of the same user's open uploads, and answers `404` otherwise.
    - `POST /uploads/{upload}/complete`, without a body. The backend checks that the object exists, and answers the upload: `{ "data": { "id": "upl_…", "key", "name", "mime", "size" } }`.
- **Values reference uploads.** A value that takes a file (a file field, an action parameter such as an import) also takes `{ "upload": "upl_…" }`, which the backend resolves. A media is one use of an upload: `POST /media` takes `{ "upload": "upl_…" }` in JSON, as well as a file in `multipart/form-data`.
- **Both ways stay.** `POST /media` and multipart requests keep working, for small files and for backends without direct uploads. A field picks the direct upload for large files.
- **`Media.status`** (`pending`, `processing`, `ready`, `failed`) says where the ingest of a media is. Without it, a media is ready. A field shows it and refreshes the media until it is ready or failed.
- **The routes are the Panneau API's.** `laravel-panneau` implements them with the services of `laravel-mediatheque`: its uploads, storage and ingest. The routes of the mediatheque serve apps and screens outside Panneau. Another backend can set `uploads.endpoint` to routes elsewhere that follow the same contract.
- **`@panneau/data/uploads`** provides `createPresignedUploads({ baseUrl, … })`, which gives `signRequest`, ready to pass to `@uppy/aws-s3`, and `complete(key)`, which resolves with the upload. It is plain `fetch` and doesn't import Uppy. `DataAdapter.uploadMedia()` takes `{ upload }` as well as a file.
- **The conformance kit** checks the signing routes (`uploads.sign`), and the mock backend answers them.
- **Next, in another pull request:** a media field and an upload list in `@panneau/fields`, on Uppy 6 as an optional peer dependency of their own entry point. They show progress per file, pause, cancel and retries, and the status after ingest.

## Consequences

- `laravel-panneau` needs the two routes, the resolution of `{ upload }` in values and actions, and `POST /media` from an upload.
- The mediatheque's sign response should name the upload it creates (`upload`), so that its own clients don't derive it from the key.
- Without `laravel-mediatheque`, `laravel-panneau` offers multipart uploads only, until it has its own signing.
- The `tus` mode stays named but unspecified, until a backend needs it.
