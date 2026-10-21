---
'@panneau/protocol': minor
'@panneau/data': minor
---

Direct uploads to S3 through presigned requests (decision 0025). The protocol specifies the `presigned` upload mode: `POST {endpoint}/sign` signs each request of Uppy 6's S3 client, and `POST {endpoint}/{upload}/complete` ingests the file. Media have an optional `status` (`pending`, `processing`, `ready`, `failed`). `@panneau/data/uploads` adds `createPresignedUploads()`, which gives `@uppy/aws-s3` its `signRequest` and completes uploads, without importing Uppy.
