---
'@panneau/protocol': minor
'@panneau/app': minor
---

Pages of the definition can take params (decision 0038). A page with `"params": ["id"]` is at `{basePath}/pages/{page}/{id}`, and its component gets `params` (`{ id: "4f2a" }`), next to its `props` and the definition. Route references can name a page (`{ "route": "job", "params": { "id": … } }`) when `routes` has no route of that name, so a `link` action with `"route": "job"` opens the page of its item. Menus leave pages with params out.
