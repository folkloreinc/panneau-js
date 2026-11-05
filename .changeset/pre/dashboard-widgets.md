---
'@panneau/protocol': minor
'@panneau/ui': minor
'@panneau/data': minor
'@panneau/core': minor
'@panneau/intl': minor
'@panneau/app': minor
---

The widgets of the dashboard (decision 0064):

- `@panneau/protocol`: the built-in widget types are `stat`, `series` and `list`, and `StatWidgetData`, `SeriesWidgetData` and `ListWidgetData` are the shapes of their data at `GET /dashboard/widgets/{widget}`, in the schemas and the OpenAPI document (with a `500` for data in the wrong shape). A `stat` or a `list` with `settings.resource` and `settings.query` reads the list of a resource instead. `validateDefinition()` checks the widgets: unique ids, a resource that exists, filters of its list, no `stat` on a list paged with cursors. `checkWidgetData()`, `getWidgetResource()` and the widget constants are in `@panneau/protocol/runtime`. The mock backend answers the widgets with its `widgets` option, and the conformance kit checks the endpoint (`dashboard.widgets`, `dashboard.widgets.resource`, `dashboard.widgets.unknown`).
- `@panneau/ui`: `Stat`, a number in large type with its label, its help, a tone and a link, and `LineChart`, a line on the chart colors of the theme with its values in a table for assistive technologies. Both draw a skeleton while they load.
- `@panneau/data`: `useWidgetData()`, `widgetDataQueryOptions()` and `queryKeys.widget()`.
- `@panneau/core`: `WidgetProps`, the props of the widgets of plugins.
- `@panneau/intl`: the messages of the widgets, in English and French.
- `@panneau/app`: the built-in `dashboard` page draws the widgets of `definition.dashboard` in a grid of 12 columns, one column on a phone. Each widget draws a skeleton of its type while it loads, its error with "Try again" when it fails, and nothing on a `403` or on a resource the user can't list, without touching the others. Without widgets, the home page still shows the cards of the resources.
