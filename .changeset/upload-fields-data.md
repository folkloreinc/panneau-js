---
'@panneau/data': minor
---

`DataAdapter.presignedUploads({ endpoint })` (optional) gives the direct uploads of an adapter: the REST adapter makes them with `createPresignedUploads()`, with its base URL, headers, credentials and errors. The main entry point exports the types of direct uploads (`PresignedUploads`, `PresignedResponse`, `PresignableRequest`). `useOptionalDataAdapter()` of `@panneau/data/query` gives the adapter of `DataAdapterProvider`, or `null` without one.
