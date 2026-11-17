---
'@panneau/ui': minor
'@panneau/lists': minor
'@panneau/app': patch
'@panneau/actions': patch
'@panneau/fields': patch
---

Add the motion tokens `--panneau-duration-slow`, `--panneau-ease-out` and `--panneau-ease-in`, used by every component in place of easings written by hand. An item that leaves a list (deleted, or out of its filters) now fades out at its place before it goes, in the table, the cards and the gallery (`isLeaving` in the props of a layout).
