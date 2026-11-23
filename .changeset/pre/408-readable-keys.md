---
'@panneau/protocol': patch
'@panneau/core': patch
'@panneau/fields': patch
'@panneau/forms': patch
'@panneau/lists': patch
'@panneau/app': patch
'@panneau/media': patch
---

Fields, columns, filters and pages without a `label` show their key made readable instead of the key as written: `published_at` reads "Published at", `author_id` reads "Author", `seo.title` reads "Seo title". The same fallback names fields, list columns, filters and their chips, sort options, the columns menu, the details of an item, the error summary and the conflict dialog of a form, inline editing, the filters of the media picker, and the pages in the navigation and the "Go to…" palette. A label given by the definition is shown as given, an empty one included. `@panneau/protocol/runtime` exports the fallback: `humanizeKey()`, `labelOrKey()` and `getFieldLabel()`.
