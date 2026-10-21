---
'@panneau/protocol': minor
'@panneau/data': minor
---

Direct uploads to storage, separate from media (decision 0025). The protocol specifies the `presigned` upload mode: `POST /uploads/sign` signs each request of Uppy 6's S3 client, and `POST /uploads/{upload}/complete` gives an upload (`Upload`), which values reference as `{ "upload": "upl_…" }` (`UploadReference`): a file field, an import, or `POST /media` in JSON to make it a media. `POST /media` in `multipart/form-data` keeps working. A new `file` field type holds files that belong to an item: items give a stored file (`StoredFile`: `name`, `url`, `mime`, `size`), and requests send `{ upload }` to replace it, the stored file to keep it, or `null` to remove it. Media have an optional `status` (`pending`, `processing`, `ready`, `failed`). The mock backend answers the upload routes and stores the uploads that `file` values reference, and the conformance kit checks them (`uploads.sign`). `@panneau/data/uploads` adds `createPresignedUploads()`, without importing Uppy, and `uploadMedia()` takes `{ upload }` as well as a file.
