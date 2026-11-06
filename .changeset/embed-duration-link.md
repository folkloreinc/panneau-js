---
'@panneau/protocol': patch
'@panneau/intl': patch
'@panneau/fields': patch
---

An embed can say how long its video or sound lasts: `duration`, in seconds, when its provider gives it (Vimeo's oEmbed does). The preview of the embed field shows it over the thumbnail, as players do (`2:14`), or after the provider without a thumbnail, and has a button that opens the embed in a new window ("Open in a new window", in English and French) instead of being a link as a whole.
