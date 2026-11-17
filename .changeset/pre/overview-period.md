---
'@panneau/protocol': minor
'@panneau/data': minor
'@panneau/app': minor
'@panneau/intl': minor
---

One period for a dashboard page or a summary (decision 0084). A dashboard page (`pages.<id>.period`, or `dashboard.period` for the home page) or a summary (`summary.period`) declares `period: { options, default }`, among `7d`, `30d`, `90d`, `month` and `year`. A segmented control in its header chooses it, and the URL keeps it (`?period=90d`). Widgets on a resource get its days in the `date-range` filter that `settings.period` names, widgets with data of their own get `period[option]`, `period[from]` and `period[to]` unless `settings.period` is `false`, and on a summary the period is the list's own `date-range` filter, so it filters the rows too.

- `@panneau/protocol`: `OverviewPeriod` and `SummaryPeriod`, on `Page`, `dashboard` and `ResourceSummary`, and `settings.period` of widgets, checked by `validateDefinition()`. The `period` parameter of `GET /dashboard/widgets/{widget}` in OpenAPI. `OVERVIEW_PERIODS`, `getPeriodRange()`, `getDefaultPeriod()`, `readPeriodOption()`, `findPeriodOption()`, `localDay()`, `isDay()`, `getDashboardPeriod()`, `getSummaryPeriodFilter()` and `followsPeriod()` in `@panneau/protocol/runtime`; `toWidgetDataParams()` and `readWidgetDataQuery()` write and read the period. The mock backend gives widget functions the `period`, and refuses a wrong one with a `422`; conformance checks the widgets that follow a period.
- `@panneau/data`: `getWidgetData()`, `widgetDataQueryOptions()` and `useWidgetData()` take a `period`, which keys the data.
- `@panneau/app`: the period control of dashboard pages and summaries. `@panneau/intl`: the names of the periods.
