---
'@panneau/media': patch
---

The media picker starts filtered on the type its opener accepts: a `media` field that accepts `application/pdf` opens on "Documents", an `image` field on "Images", `video/*` on "Videos" and `audio/*` on "Audio". The user can still choose "All types", where the media not accepted stay greyed out. An `accept` of several types, or none, starts on "All types" as before.
