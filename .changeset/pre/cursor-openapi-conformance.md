---
'@panneau/protocol': patch
---

Two fixes to cursor pagination (decision 0039). `openapi.json` lists the `422` of `GET /resources/{resource}`, which answers a `cursor` the backend can't read. The `list` check of the conformance kit now accepts a list paged with cursors: it asks for the first page without `page`, checks that `meta` has a `nextCursor`, follows it to a page that doesn't repeat the first one, and expects a `422` for an invalid cursor. It used to require `meta.page`, so it failed on every list paged with cursors.
