---
'@panneau/data': patch
'@panneau/lists': patch
'@panneau/app': patch
---

Edits in place show at once (decision 0105). A cell of a list shows the value it saves right away and stays usable: a value picked while it saves is saved after it, with the version the first save got, and a failed save puts the value back and says why. `useUpdateItem(resource, { optimistic: true })` writes the values at once in the cached item and in every cached list that holds it, sends the edits of an item one after the other without a stale `If-Match`, and puts back only the edit that failed. The list of a resource in the app uses it; the form's save is unchanged.
