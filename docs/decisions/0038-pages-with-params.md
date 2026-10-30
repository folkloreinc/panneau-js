# 0038: Pages with params

- Status: accepted
- Date: 2026-10-30
- Issue: [#151](https://github.com/folkloreinc/panneau-js/issues/151)
- Changes: the client route of pages, `{basePath}/pages/{page}`, in [0019](0019-app-entry.md)

## Context

A page of the definition (`pages`) is a component of a plugin, at `{basePath}/pages/{page}`, with the page's `props` and the definition. A page about one thing (a job of a media server, an order) has no way to know which: it reads `?id=` itself, and nothing can link to it with a route reference (`{ "route": "job", "params": { "id": … } }`), since `routes` would have to repeat its path with the base path.

Until the dashboard has widgets, and as long as a product has screens that aren't resources, these pages come from plugins.

## Decision

- **A page declares `params`**, the names of the path segments after it: `{ "component": "job", "params": ["id"] }` is at `{basePath}/pages/job/{id}`.
    - The component gets their values as `params` (`{ id: "4f2a" }`), decoded, next to the page's `props` and the definition. Every page component gets `params`, empty without any.
    - A page takes exactly its `params`: fewer or more segments show the "not found" page.
    - The page remounts when its params change, so its state starts over for another item.
- **Route references can name a page.** `{ "route": "job", "params": { "id": 12 } }` resolves to `routes.job` of the definition when there is one, as before, and otherwise to the page `job`, with its `params` from the reference's. A missing param is a warning, and no navigation. A `link` action with `route` gives the item's id as `id`, so `"route": "job"` on an action of a list of jobs opens the page of the job.
- **Menus don't link to a page with `params`**, which is about one thing: a menu entry of such a page, and the default menu, leave it out.
- `path` of a page, which nothing reads, stays as it is. Params are segments under `/pages/`, so that pages never take a reserved first segment of 0019.

## Consequences

- The routes of 0019 grow: `{basePath}/pages/{page}/{param}…`. The backend already serves the page of the app for every path under `basePath`.
- Additive in the protocol: `params` is optional on `Page`. Backends have nothing to do, unless they declare such pages.
- A custom show page of a resource, instead of the item panel, is not part of this: it would be another route of resources.
