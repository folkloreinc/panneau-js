# 0045: A current context, picked in the app and sent with every request

- Status: proposed
- Date: 2026-11-03
- Issue: [#182](https://github.com/folkloreinc/panneau-js/issues/182), [folkloreinc/laravel-panneau#147](https://github.com/folkloreinc/laravel-panneau/issues/147)
- Changes: the client routes of [0019](0019-app-entry.md), which get a prefix

## Context

The contests platform, pilot of phase 2, is multi-tenant: internal, agency and client users work on contests that belong to clients. Its admin is filtered today by the domain of the request: one admin per contest. In Panneau 5 it becomes one app, where the user picks the contest to work on, then the client. Each resource keeps to that choice in its scope, and the menus can depend on it.

Other products have the same need: a site among several, an organization, a season. The protocol has no place for it: the definition can't say what the user can pick, and the client can't send the pick to the backend.

Where the pick lives matters:

- **in the server's session**, two tabs can't work on two contests, and a link to an item doesn't say which contest it belongs to;
- **in the URL of the app**, each tab has its own, links and history keep it, and the backend stays stateless. The client has to send it with every request.

## Decision

- **The definition declares the params of the context**, in order, in `context.params`:

    ```jsonc
    "context": {
        "params": [
            {
                "name": "client",
                "label": "Client",
                "allLabel": "All clients", // the label of no value, for an optional param
                "value": "4", // what the definition was built for
                "valueLabel": "Northwind",
            },
            {
                "name": "contest",
                "label": "Contest",
                "required": true,
                "options": [{ "value": "12", "label": "Summer 2026" }], // inline choices, optional
                "value": null,
            },
        ],
    }
    ```

    - `name` is an identifier, unique, and not one of the reserved first segments of 0019 (`resources`, `pages`, `media`, `search`, `account`, `auth`).
    - The choices of a param are its `options`, or, without them, `GET {api}/context/{name}/options?q=…`, which answers `{ "data": [{ "value", "label", "description"? }] }`: the first matches of `q`, for a combo box. The backend decides what the user can pick.
    - Each param depends on the params before it: the request of its choices sends only the values before it, and changing a value drops the values after it.
    - The params are the same whatever the values: only their `value`, `valueLabel` and choices change.

- **The client sends the values with every API request**, in a `Panneau-Context` header, in the format of a query string (`client=4&contest=12`), the values it has, in order. The definition is fetched with it too.
    - The backend checks each value for the user. A value the user can't use is a `403` problem of type `urn:panneau:problem:context`, with the `param` it refuses. Names it doesn't know are ignored.
    - The definition is built for the values: their `value` and `valueLabel`, the menus, the abilities. When the header has no value for a required param, the backend may choose one (the domain of the request, the user's only contest, the last one it saw), and says so in `value`. An optional param without a value has none: its `allLabel` is the choice of no value.
    - The backend gives the values to each resource, which applies them in its scope. Without a value for a required param, the resource routes may answer the same `403` problem; the definition and the routes of the context always answer.
    - Responses vary with the header: `Vary: Panneau-Context`. A backend on another origin allows it in CORS (`Access-Control-Allow-Headers`).

- **The context is in the URL of the app**, as a prefix of the routes of 0019: `{basePath}/{name}/{value}/…`, for each param that has a value, in order (`/panneau/client/4/contest/12/resources/entries`). Values are URL-encoded.
    - Every link of the app keeps the prefix: routes are built under the base path and the prefix.
    - The backend serves the page of the app for these paths, as for every path under `basePath`. A backend that inlines the definition in the boot config reads the prefix of the path, to build it for those values.
    - When the definition has a value that the URL hasn't (the backend chose it), the app adds it to the URL, in place.
    - The client remembers nothing else: a backend that wants the last context back chooses it when the header has none.

- **The app has a picker**, at the top of the sidebar: one button per param, with its label and the label of its value, that opens its choices (inline, or searched through `GET /context/{name}/options`). While a required param has no value, the app shows a page to pick it, in place of the page of the route.
- **Changing the context loads the app again**: the app goes to the new URL with a navigation of the browser, rather than in place. A context changes the definition, the menus, the abilities and every item, and nothing of the previous one must show, not even for an instant from the cache. Going back or forward to another context does the same. Leaving a form with unsaved changes asks first, as for any navigation.
- A `403` context problem on the definition (a contest that was deleted, or taken away from the user) takes the app to its URL without that value and the values after it.
- `DataAdapter` gets `withContext(values)`, which gives an adapter that sends the header, and `getContextOptions(name, { q })`. Both are optional: an app with a context needs them, and a product with its own API implements them.

## Consequences

- Additive in the protocol: `context` is optional, and a backend without it never gets the header. The conformance kit checks a backend whose definition has a context: the choices of its params, the definition built for a value, and the `403` of a value that doesn't exist.
- The routes of 0019 get a prefix. A context param can't be named like a reserved first segment; a reserved segment added later can't be the name of a param either, which a major version of the protocol would say.
- A context change costs a page load. It is rare, and it keeps every cache, runner and guard of the app to one context.
- The client trusts nothing of the context: the backend checks every value on every request, as it checks the abilities. The URL only says which values the user asked for.
- Menus that depend on the role were already possible: the definition is built for the user. Menus that depend on the context are, now that it is built for the values.
