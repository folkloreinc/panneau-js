---
'@panneau/protocol': minor
'@panneau/ui': minor
'@panneau/data': minor
'@panneau/app': minor
'@panneau/intl': minor
---

Widgets can count and sum a resource (decision 0084). A list declares its `aggregates` (`sum`, `groupBy`, `dates`), and `GET /resources/{resource}/aggregate` answers their count or sum, by period or by field, in the shape of a widget, with its schemas, checks, OpenAPI path, mock backend and conformance checks. `breakdown` is a new built-in widget type, drawn by the new `BarChart` of `@panneau/ui`, and a `stat` can have a `target`, drawn by the new `Meter`. On the dashboard, a `series`, a `breakdown` and a `stat` that sums read the aggregates of a resource, through `getResourceAggregate()` and `useResourceAggregate()` of `@panneau/data`.
