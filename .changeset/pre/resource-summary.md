---
'@panneau/protocol': minor
'@panneau/data': minor
'@panneau/app': minor
'@panneau/intl': minor
---

A summary above the list of a resource (decision 0084). A resource declares `summary: { widgets, list? }`: widgets drawn between the header of its list page and the list, in the grid of a dashboard, which the user can hide (the browser remembers it per resource). The widgets on the resource and those with data of their own follow the list's current filters and search, unless `settings.followsList` is `false`. With `list: "collapsed"`, the resource opens on its summary, its list folded under it behind "Show the N items".

- `@panneau/protocol`: `Resource.summary` (`ResourceSummary`) and `settings.followsList`, checked by `validateDefinition()` at `resources.<i>.summary.widgets.<j>`. `GET /dashboard/widgets/{widget}` takes `resource`, with the list's `filter[…]` and `q`, for the widgets of a summary; `page` and `resource` together are a `422`. `getSummaryWidgets()`, `getSummaryResources()`, `followsList()`, `toWidgetDataParams()` and `readWidgetDataQuery()` in `@panneau/protocol/runtime`. The mock backend answers the widgets of summaries, whose functions get the `resource` and the `query` of the list (their `page` is `null` there), and conformance checks them.
- `@panneau/data`: `getWidgetData()`, `widgetDataQueryOptions()` and `useWidgetData()` take `resource` and `query`, keyed apart from the widgets of pages. Changes to the items of a resource refetch the widgets of its summary.
- `@panneau/app`: the summary on the list page. `@panneau/intl`: "Summary", "Show the list" and "Show the N items".
