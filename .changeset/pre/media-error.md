---
'@panneau/protocol': minor
'@panneau/media': minor
'@panneau/intl': minor
---

A media says why its processing failed (#84): the `media` block of a library item gets an optional `error`, `{ code, message }`, when its `status` is `failed`. The `media` and `image` fields show the message under "Processing failed", and the media picker gives it as the reason a media can't be picked (`statusFailedBecause`, in English and French).
