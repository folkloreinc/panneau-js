---
'@panneau/protocol': patch
'@panneau/data': patch
'@panneau/intl': patch
'@panneau/app': patch
---

A current context, picked in the app and sent with every request (#182, [decision 0045](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0045-current-context.md)).

- `@panneau/protocol`: the definition's `context.params` (`ContextParam`, `ContextOption`, `DefinitionContext`): a name, a label, `required`, `allLabel`, inline `options`, and the `value` and `valueLabel` it was built for. The `Panneau-Context` header (`CONTEXT_HEADER`, `formatContextHeader()`, `parseContextHeader()`, `contextBefore()`), the `403` problem of type `urn:panneau:problem:context` with its `param` (`CONTEXT_PROBLEM_TYPE`), `GET /context/{param}/options` (`ContextOptionsResponse`) and `RESERVED_ROUTE_SEGMENTS`, in the schemas and the OpenAPI document, where every operation takes the header and can answer the `403`. The mock backend takes `context` (the choices of each param, and the items of each resource in the context), and the conformance kit checks a backend with a context, with `context` to send values with every request.
- `@panneau/data`: `DataAdapter.withContext(values)`, an adapter that sends `Panneau-Context`, and `getContextOptions(name, { q })`, both optional. The REST and Laravel adapters have them.
- `@panneau/app`: the values of the context are a prefix of the routes (`{basePath}/client/4/contest/12/…`) and every request sends them. The sidebar has a field per param (a button with a popover in the rail of icons), with its choices inline or searched; picking other values loads the app for them. While a required param has no value, every route asks for it. Values the backend chose go to the path, and a value the user can't use takes the app to the path without it. New classes: `panneau-context-picker-*` and `panneau-context-page-*`.
- `@panneau/intl`: the messages of the picker and of the page that asks for a value, in English and in French.
