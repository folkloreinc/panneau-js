---
'@panneau/protocol': patch
---

`GET /resources/{resource}/aggregate` documents its limits: a `422` keyed by `measure` or `group` for an aggregate over too many items, and a `429` with `Retry-After` when a user asks too often.
