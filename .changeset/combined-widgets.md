---
'@panneau/protocol': minor
'@panneau/ui': minor
'@panneau/data': minor
'@panneau/intl': minor
'@panneau/app': minor
---

Combined widgets (decision 0089), so that one card answers several questions instead of repeating the same total in three.

- A `metric` widget: its number, its change from the previous period ("↑ 12% from the previous 30 days"), its trend as a small line, and its 5 largest parts as bars. On a resource, with `settings.points` and `settings.by`, the client reads the value, the trend, the parts, and the value over the previous range when the widget follows a period.
- A `series` with several lines: `series` in its data, drawn as one chart with a legend of their totals and help, or stacked with `settings.stacked`. On resources, `settings.split` draws a line per value of a field, and `settings.sources` a line per source, with an `alert` ("4 failed").
- A `table` widget: rows of numbers, one per subject, with a trend column. On resources, `settings.rows` gives each row its value, its change, its alert and its trend.
- `settings.format` (options of `Intl.NumberFormat`, also in the data) for every built-in type, so money and sizes read as money and sizes; `settings.goodWhen` colors a change as good or bad news; `settings.hideEmpty` hides a widget with nothing to show.
- `@panneau/protocol`: `MetricWidgetData`, `TableWidgetData`, `SeriesWidgetSeries`, `WidgetNumberFormat` and the settings in the schemas and the OpenAPI document; `readWidgetFormat()`, `isWidgetDataEmpty()`, `getWidgetChange()`, `getChangeTone()`, `getPreviousRange()`, `getWidgetSources()`, `getWidgetAggregates()`, `isCombinedWidget()`, `readsResources()` and the caps in `@panneau/protocol/runtime`; lint of the new settings, the mock backend, and conformance of these widgets.
- `@panneau/ui`: `Sparkline`, `ChartLegend`, `LineChart` with `series` and `stacked`, and the `change` of `Stat`.
- `@panneau/data`: `useResourceAggregates()`, several aggregates in parallel.
- `@panneau/intl`: the messages of the change, the alert, the columns of a table and the trend, in English and French.
