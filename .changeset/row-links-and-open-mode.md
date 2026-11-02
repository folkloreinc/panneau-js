---
'@panneau/protocol': minor
'@panneau/core': minor
'@panneau/intl': minor
'@panneau/lists': minor
'@panneau/actions': patch
'@panneau/app': minor
---

Lists have the `show` and `edit` buttons of v4 again, as the built-in links of the resource, and a resource can open its items in their form instead of the panel (decision 0040).

- `@panneau/protocol`: a backend declares the built-in links with their id only, `{ "id": "edit", "kind": "link", "scope": ["item"] }`: without `url` or `route`, the client resolves them to its routes. `label` is optional for `show` and `edit`, which the client labels in its locale, and required for every other action. The ids `show` and `edit` are reserved for `link` actions. The generated JSON Schema and OpenAPI document check both with `if`/`then`, and also that a `link` has a `url` or a `route` and a `client` action a `component`, as the Zod schemas do. A resource takes `open`: `panel` (the default) or `edit`, where an item's title goes. `BUILT_IN_LINK_ACTIONS` and `isBuiltInLink()` are in the runtime entry point. A backend that declares `edit` sends `abilities.update` on every item, and one that declares `show` sends `abilities.view`: the conformance kit checks it (`list.link-abilities`). The mock backend gives its items `view`, its example definition declares the built-in `edit`, and its `authors` open in their form.
- `@panneau/core`: `isActionAllowedOn()` hides `edit` on an item with `update: false`, and `show` on one with `view: false`, with or without a `url`: before, an `edit` or a `show` with a `url` was only hidden by `edit: false` or `show: false`. Without `placement`, the built-in links that the client resolves are in rows only; those with a `url` or a `route` keep the placements of item actions. `getOpenMode()` reads `open`, and `getResourceActions()` leaves out `show` from a resource whose items open in their form, as `resolveList()` does.
- `@panneau/intl`: `getActionLabel()` labels an action, and the built-in links in the locale: "View" and "Edit" ("Voir", "Modifier").
- `@panneau/lists`: `ListView` takes `getLinkHref`, which resolves the built-in links without a URL, and leaves out those it can't resolve. `hasOwnTarget()` says whether a link goes somewhere by itself. `isAllowedOn()` follows the abilities of the built-in links.
- `@panneau/actions`: results and runs label actions with `getActionLabel()`.
- `@panneau/app`: rows link `edit` to the item's form and `show` to its panel. With `"open": "edit"`, titles open the form, and the show route redirects there with its hash, after the `viewAny` check of the list; an item with `update: false` still opens in the panel. The panel doesn't repeat `edit` nor the `show` it is, and its "Edit" follows the URL or the route and the abilities of a declared `edit`, in a new tab for an external URL. Links with a `route` appear in the panel too.
