---
'@panneau/protocol': minor
'@panneau/core': minor
'@panneau/intl': minor
'@panneau/lists': minor
'@panneau/actions': patch
'@panneau/app': minor
---

Lists have the `show` and `edit` buttons of v4 again, as the built-in links of the resource, and a resource can open its items in their form instead of the panel (decision 0040).

- `@panneau/protocol`: a backend declares the built-in links with their id only, `{ "id": "edit", "kind": "link", "scope": ["item"] }`: without `url` or `route`, the client resolves them to its routes. `label` is optional for `show` and `edit`, which the client labels in its locale, and required for every other action. The ids `show` and `edit` are reserved for `link` actions. A resource takes `open`: `panel` (the default) or `edit`, where an item's title goes. `BUILT_IN_LINK_ACTIONS` and `isBuiltInLink()` are in the runtime entry point. The conformance kit checks that the items of a resource with `edit` say whether they can be updated (`abilities.update`). The example definition of the mock declares the built-in `edit`, and its `authors` open in their form.
- `@panneau/core`: `isActionAllowedOn()` hides `edit` on an item with `update: false`, and `show` on one with `view: false`. Without `placement`, the built-in links are in rows only, no longer in forms. `getOpenMode()` reads `open`, and `getResourceActions()` leaves out `show` from a resource whose items open in their form, as `resolveList()` does.
- `@panneau/intl`: labels of the built-in links, "View" and "Edit" ("Voir", "Modifier").
- `@panneau/lists`: `ListView` takes `getLinkHref`, which resolves the built-in links without a URL, and leaves out those it can't resolve. `getActionLabel()` labels an action, and `hasOwnTarget()` says whether a link goes somewhere by itself. `isAllowedOn()` follows the abilities of the built-in links.
- `@panneau/actions`: labels of actions without one, in results and runs, fall back to their id.
- `@panneau/app`: rows link `edit` to the item's form and `show` to its panel. With `"open": "edit"`, titles open the form, and the show route redirects there. The panel doesn't repeat the built-in links, and its "Edit" follows the URL and the abilities of a declared `edit`.
