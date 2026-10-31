---
'@panneau/app': minor
---

Plugin pages can look like the pages of resources, and the edit page shows the actions of its item.

- `@panneau/app` exports the building blocks of its pages: `PageLayout` (the column of a page, `default` or `narrow`), `PageHeader` (the title, a link to the parent page, the actions) and `LinkButton`.
- The edit page of an item shows, in its header, the actions of its resource placed in `form`, which is where actions of the `item` scope go by default, for the item's abilities. They run through the action runner, after a confirmation when they ask for one; a `link` action with a URL is a link. Until now, an action placed in `form` was never shown. An action that removes the item, such as `delete`, goes back to the list, in place of the item's page in the history, unless its result has a `redirect`.
