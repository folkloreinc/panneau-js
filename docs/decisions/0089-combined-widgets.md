# 0089: Combined widgets: a metric, several lines, a table of numbers

- Status: proposed
- Date: 2026-11-18
- Builds on: [0064](0064-dashboard-widgets.md) (the widgets of the dashboard), [0084](0084-overviews.md) (overviews, aggregates, the period), [0085](0085-readable-line-charts.md) (readable line charts)
- Decides: "comparing a period with the previous one", left open by 0084, and "the change against the previous period, a trend in a `stat`, several series with a legend", left open by 0085
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6)

## Context

An admin built an "Activity" overview of an internal tools app with the widgets of 0084: for each of its logs (emails sent, text messages, jobs that ran), a `stat` of the count over the period, a `series` of that count per day with its total above the line, and a `breakdown` per status with its total too. The page had 15 cards, and the same total appeared up to three times for one log: in the stat, above the line, above the bars. Its admins found it redundant: it answered one question per card, and the questions they ask come together.

- "How many emails this month, is it more than last month, and how many failed?" is one subject: a number, its change, its trend, its parts.
- "Emails and text messages per day" is one chart, with two lines and a legend, not two charts side by side whose scales differ.
- "Which log moved, and which one has failures?" is a table: a row per log, a column per number.

The pieces are there (aggregates, the period, `Stat`, `LineChart`, `BarChart`), but a card can only draw one of them, from one read.

## Decision

Three built-in types that answer several questions in one card. Each is drawn from data of its own, at `GET /dashboard/widgets/{widget}`, or from the aggregates of resources with no code, through several reads of `GET /resources/{resource}/aggregate`. The backend needs nothing new for the second.

**`metric`: one subject in one card.**

- Data: `{ "value": 40, "previous": 32, "help": "…", "tone": "…", "url": "…", "target": 50, "points": [{ "date": "2026-10-05", "value": 4 }], "period": "day", "parts": [{ "key": "failed", "label": "Failed", "value": 3, "tone": "danger", "url": "…" }], "other": 1, "format": { … } }`. Only `value` is required. `parts` has the shape of the items of a `breakdown`, at most 10.
- Drawn as the number, formatted; under it, the change from `previous`: "↑ 12% from the previous 30 days", or the difference when `previous` is 0 ("↑ 4 from …"), or "No change from …"; a small line of `points` (`Sparkline`); its 5 largest `parts` as bars with their values, and the rest with `other` as "Other"; `help` under the number.
- The change is neutral. With `settings.goodWhen: "up"` (or `"down"`), a change that way is `success`, the other way `danger`. The arrow and the words say the direction; the color only says whether it is good news.
- On a resource: `settings.resource`, `query`, `measure` (`count` or `sum:{field}`), and optional `settings.points` (`{day|week|month}:{date field}`) and `settings.by` (a field of `groupBy`). The client reads the aggregate without a group (the value), grouped by `points` (the trend), grouped by `by` (the parts), and, when the widget follows the period of its overview (`settings.period`), the aggregate over the previous range, for `previous`. `target` works as for a `stat`.

**The previous range** (`getPreviousRange(range, option)` of `@panneau/protocol/runtime`): the same number of days just before the range, for `7d`, `30d`, `90d` and a range without an option; the same days of the month before for `month` (March 1 to 31 after February 1 to 28); the same days a year before for `year`. The change says which: "from the previous 30 days", "from the same days last month", "from the 12 months before", or "from the previous period" when the widget doesn't follow a period. A `metric` with data of its own gets the period as in 0084 (`period[option]`, `period[from]`, `period[to]`), and its backend computes `previous` over the same range.

**`series` with several lines.**

- Data: the `series` of 0064, with an optional `series: [{ "key": …, "label": "Emails", "points": [ … ], "total": 32, "tone": "…", "url": "…", "help": "…", "alert": { "value": 4, "label": "failed", "tone": "danger" } }]`, at most 6, drawn instead of `points`. `points` stays required: with `series`, it is their total per period, or `[]`. Clients that draw one line keep drawing it, so a single series is unchanged.
- Drawn as one chart with a line per series, on the categorical chart colors or the solid color of their `tone`, or stacked as areas with `settings.stacked: true`, and a legend (`ChartLegend`) with the label, the total and the help of each. A series' `alert`, above 0, replaces its help: "4 failed", in its tone (`danger` by default). The dates are the union of the dates of the lines, a date missing is 0. A chart of several lines shows the values of a date under the pointer and from the keyboard (0085's `isInteractive`): no value is written on the lines.
- On a resource, two ways, exclusive:
    - `settings.split: field`, with `settings.resource` and a `group` on a period: a line per value of a field of `groupBy` that the list also filters by. The client reads the total line and the breakdown by that field, then a line for each of its 5 largest values with `filter[field]=key`. When the breakdown has more (or items without a value), "Other" is the total minus those lines, per period. Lines take the labels and tones of the options of a `select`, and link to the list filtered by their value.
    - `settings.sources: [{ "resource", "label", "query", "measure", "group", "period", "help", "tone", "alert" }]`, without `settings.resource`: a line per source, at most 5, possibly from different resources. `group` and `period` default to those of the widget. `alert: { "query", "label", "tone" }` counts the items of the source's query and period with the filters of `query` on top, and shows "4 failed" when there are some.

**`table`: rows of numbers, one per subject.**

- Data: `{ "columns": [{ "key": "cost", "label": "Cost", "align": "end", "format": { … } }], "rows": [{ "label": "Summaries", "url": "…", "cells": { "cost": 9.08, "calls": { "value": 6, "tone": "danger", "help": "failed", "format": { … } } }, "points": [ … ] }], "period": "day", "empty": "…", "url": "…" }`. At most 6 columns and 8 rows. A cell is a number, `null` (drawn "—"), or a number with a tone, a word after it and a format of its own; a cell missing is empty. Column keys are unique.
- Drawn as a compact table: the labels first, linking to their `url`, the numbers aligned to the end and formatted (the cell's format, else the column's, else the widget's), and a last column with a small line of each row's `points`. It scrolls sideways on a phone.
- On resources: `settings.rows: [{ "resource", "label", "query", "measure", "points", "period", "alert" }]`, at most 8. Each row is a count or a sum over the period, with the default columns: the value, the change from the previous period (a percent, or the difference when it was 0, colored by `goodWhen`), and the alert ("6 rejected"); and the trend of `points` (`settings.points` by default). The value of a sum of `money` is written in its currency.

**Number formats.** `settings.format` takes options of `Intl.NumberFormat`: `style` (`decimal`, `percent`, `currency` with `currency`, `unit` with `unit`), `currencyDisplay`, `unit` (a unit of ECMA-402, `byte`, `kilobyte`, `megabyte`, `second`…, or two joined by `-per-`), `unitDisplay`, `minimumFractionDigits`, `maximumFractionDigits`, `notation` (`compact`) and `signDisplay`. The data of a `stat`, `series`, `breakdown`, `metric` and `table` may carry `format` too; the settings win key by key. Without either, a sum of `money` on a resource is written in the field's currency, as before. So a cost reads "$9.08" instead of "9.08", and a size "1,530.3 MB". Options a client can't use (an unknown unit, a style without its unit) are dropped (`readWidgetFormat()`), never thrown.

**Hide empty widgets.** `settings.hideEmpty: true` hides a built-in widget whose data has nothing to show, as a `403` does, and the grid closes the gap: a `stat` at 0, a `metric` at 0 that was 0 (or has no `previous`: a fall to 0 is news), a `series` whose points are all 0, a `breakdown` whose parts and rest are all 0, a `list` without items, a `table` without rows (`isWidgetDataEmpty()`).

**The cost of reading resources.** These are several calls to the aggregate endpoint, in parallel (`useResourceAggregates()` of `@panneau/data/query`), each cached as any aggregate and refetched when the items change. Per widget, at most:

| Widget                | Reads                                                                          |
| --------------------- | ------------------------------------------------------------------------------ |
| `metric`              | 4: the value, the trend, the parts, the value over the previous range          |
| `series` with split   | 7: the total line, the breakdown, then a line for each of the 5 largest values |
| `series` with sources | 10: a line and an alert per source, 5 sources                                  |
| `table` with rows     | 32: per row, the value, the previous value, the trend and the alert, 8 rows    |

A page that needs more, or a backend that computes them better in one query, gives the widget data of its own: the shapes are the same.

**Checks.** `checkWidgetData()` and the schemas (`MetricWidgetData`, `TableWidgetData`, `SeriesWidgetSeries`, `WidgetNumberFormat`, also in the OpenAPI components) check the data. `lintDefinition()` checks that the settings of a type are on that type (`goodWhen` on a `metric` or a `table`, `split`, `sources` and `stacked` on a `series`, `rows` on a `table`, `points` and `by` on a `metric`), that a `metric` reads a resource that declares aggregates, that `points` is a period of its `dates`, that `by` and `split` are fields of its `groupBy`, and `split` a filter of its list; that each source and row names a resource with aggregates, a measure it can sum, a period group of its dates, a `date-range` filter for its period, filters of its list in its query and its alert; and that the lines of a series and the trends of a table share one period. The mock backend answers these types with its `widgets` option, and refuses a widget that reads resources with a `404`. Conformance checks the endpoint widgets of these types against their schemas, and each aggregate a combined widget reads.

**Where it lives.**

- `@panneau/protocol`: the shapes and settings, `readWidgetFormat()`, `isWidgetDataEmpty()`, `getWidgetChange()`, `getChangeTone()`, `getPreviousRange()`, `getWidgetSources()`, `getWidgetAggregates()`, `isCombinedWidget()`, `readsResources()`, and the constants of the caps, in `@panneau/protocol/runtime`; lint, mock and conformance.
- `@panneau/ui`: `Sparkline`, `ChartLegend`, `LineChart` with `series` and `stacked`, and a `change` of `Stat`.
- `@panneau/data`: `useResourceAggregates()`.
- `@panneau/app`: the three types, their skeletons and errors (0034, 0064), `format`, `goodWhen` and `hideEmpty`.
- `laravel-panneau`: builders for the three types, on resources or `using()` a class, the checks of their data, and `previous` over `getPreviousRange()` for a `metric` of its own.

## Consequences

- A typical activity page goes from 15 cards to 3: a `table` of the logs (each count, its change, its failures, its trend), a `series` of the messages sent per day by channel, and a `metric` of the cost with its parts. Each number appears once.
- Money and sizes read as money and sizes, on every built-in type.
- A rise is not assumed to be good: a change is colored only where the definition says which way is good.
- A `table` on resources can make many reads; its caps keep it bounded, and data of its own stays the way to one request.
- Not decided: comparing with a period chosen by the user (the previous one is the only comparison), a change in the `stat` (a `metric` has it), and lines of a `series` on different periods.
