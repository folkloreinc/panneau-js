---
'@panneau/intl': patch
'@panneau/lists': patch
---

Lists show their checkboxes once "Select" is pressed in their toolbar (decision 0070), and hide them with "Done", which clears the selection. Without it, rows have no column of checkboxes before them, and their titles line up with the headers and the filters. A selection shows the checkboxes too, and running a selection action ends it. Shown checkboxes no longer wait for hover.
