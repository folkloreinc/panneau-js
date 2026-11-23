---
'@panneau/app': patch
---

Opening an item from its list no longer renders the list again. An item that opens in its panel because it can't be updated (with `open` left to `edit`) used to empty the page until it loaded, then render the list again with new rows, losing its scroll, hover and focus. The list now stays mounted, and only the panel mounts, with its skeleton, and unmounts when it closes. A link to an item shows the list and the panel's skeleton while it loads, then goes to the item's form when it opens there (decision 0101).
