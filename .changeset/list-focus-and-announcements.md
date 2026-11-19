---
'@panneau/lists': minor
'@panneau/intl': minor
---

Focus and announcements in lists (decision 0095). `@panneau/lists`: the focus that was in an item that leaves a list goes to the same control of the next item, or of the previous one, or to the list (a group named like it) when it is left empty; an item that leaves goes when its fade ends (`animationend`), with a timer only when the animation doesn't end, instead of a copy of `--panneau-duration-slow`. The built-in layouts give each item's element `data-item-id`. `ConfirmDialog` opens on "Cancel" for a destructive action, and its confirming button is pending, not disabled, while the dry run counts, so it keeps the focus. `ListView` has one polite status message of its results, said after a new search, filter or page: how many items, or that none match. `@panneau/intl`: the messages `resultsCount` and `resultsOnPage` of lists, in English and in French.
