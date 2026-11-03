---
'@panneau/protocol': patch
'@panneau/core': patch
'@panneau/fields': patch
'@panneau/intl': patch
'@panneau/app': patch
---

The rest of the UI follows the abilities of the current user (decision 0042): pages and fields have abilities, menus leave out what the user can't reach, and a route reached without the ability shows a forbidden state.

- `@panneau/protocol`: `abilities` on a page (`{ "view": false }`) and on a field (`{ "view": false }`, `{ "update": false }`), where only `false` restricts. The JSON Schema and the OpenAPI document follow. The mock backend reads the abilities of resources (`403` on lists without `viewAny`, on creates without `create`), of items (`403` without `view`, `update` or `delete`), and of fields (items leave out the values of hidden fields, writes ignore those of fields the user can't see or update); an item of `items` can give its own `abilities`. The conformance kit checks that resources without `viewAny` answer `403` on their list, that items leave out hidden fields, that a dry run of `delete` skips an item without `delete` and, with `writes`, that an empty create of a resource without `create` and an empty update of an item without `update` answer `403`.
- `@panneau/core`: `canViewField()`, `canUpdateField()`, `getVisibleFields()` and `canViewPage()`. `resolveFields()` and `resolveForm()` leave out the fields the user can't see, and make those they can't edit read-only. `resolveList()` leaves the fields the user can't see out of columns and sorts, and those they can't edit out of `inlineEdit`.
- `@panneau/fields`: a field with `abilities.update: false` is read-only.
- `@panneau/intl`: messages of the forbidden page (`forbidden`, `forbiddenText`) and of an item the user can't view (`itemForbidden`).
- `@panneau/app`: a forbidden page, in the shell, on the list and show routes of a resource without `viewAny` (before, "not found"), the create route of a resource without `create`, a page with `view: false`, and when a list or an item answers `403`. The item panel says when the user can't view the item, without "Retry". The edit route of an item without `update: true` goes to its panel. `pages.home` with `view: false` shows the built-in home. Menus leave out the pages the user can't open, and the separators left at their start, at their end or next to another one. Lists, panels and forms leave out the fields the user can't see.
