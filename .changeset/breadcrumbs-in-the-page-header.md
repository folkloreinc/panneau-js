---
'@panneau/protocol': minor
'@panneau/ui': minor
'@panneau/app': minor
---

Breadcrumbs in the page header (decision 0093). `@panneau/protocol`: resources and pages take an optional `parent`, a page of `pages` (or for a page, a resource: `{ "resource": "jobs" }`), which `lintDefinition()` checks. `@panneau/ui`: a crumb of `Breadcrumbs` whose `label` is `undefined` is a skeleton, and the current page's label is cut before its parents'. `@panneau/app`: `PageHeader` takes `parents`, by default those of the route the app renders; one parent is the link above the title, two or more are breadcrumbs from 48rem of the root and a link to the nearest parent below it, with `crumbLabel` and `isLoading` (a skeleton for the title and its crumb). `back` is deprecated: use `parents={[back]}`. The title of an item's form is a skeleton while the item loads, the title of the tab names the parents, and a resource or a page that isn't in the menus keeps its nearest parent there current.
