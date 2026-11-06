---
'@panneau/protocol': patch
'@panneau/intl': patch
'@panneau/lists': patch
'@panneau/actions': patch
'@panneau/app': patch
---

"Show" in the toast of a run opens the list of the items it changed (decision 0069). Every list has a filter on the ids of its items, `filter[ids][]=12`, at most 100 (`IDS_FILTER`, `IDS_FILTER_LIMIT`), which the mock and local lists apply. Lists show it as a chip, "2 items", that removes it. A list's definition can no longer declare a filter with the id `ids`. The conformance kit checks that a backend reads it (`list.filter-ids`). `ActionRunnerProvider` takes `onShowItems(resource, ids)`, which the app gives, and offers "Show" for the items of a selection by ids that the run changed, when the toast has no "Undo", "Details" or "Download".
