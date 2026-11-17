# 0082: Overviews: dashboard pages, summaries above lists, and widgets that count a resource

- Status: proposed
- Date: 2026-11-17
- Builds on: [0064](0064-dashboard-widgets.md) (the widgets of the dashboard), [0053](0053-date-ranges-and-money.md) (date ranges)
- Changes: the "Stats and charts" item of the roadmap, which put the widgets of a resource next to its list
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6). Work: [#298](https://github.com/folkloreinc/panneau-js/issues/298), [#299](https://github.com/folkloreinc/panneau-js/issues/299), [#300](https://github.com/folkloreinc/panneau-js/issues/300), [#301](https://github.com/folkloreinc/panneau-js/issues/301), [folkloreinc/laravel-panneau#215](https://github.com/folkloreinc/laravel-panneau/issues/215)

## Context

Many resources of an admin are read, not edited:

- logs (emails sent, calls to a service, jobs that ran, deletions);
- usage counts;
- the reports of a synchronization.

An internal tools app on Panneau 5 has fourteen of them out of twenty resources. Each one is an entry of the menu and a table.

Nobody reads those tables row by row. Admins come with questions, such as:

- "Did anything fail since yesterday?"
- "What did this cost this month, and for whom?"
- "Who uses what?"

The answers are a number, a curve or a breakdown, with the rows only to explain them.

Panneau 5 has most of the pieces (0064): the `stat`, `series` and `list` widgets, a grid, and `stat` and `list` that read a resource with no code. Four things are missing:

- **One dashboard only.** The home page is the only one, so related logs can't be grouped into one page.
- **Nothing above a list.** The list page is a table. The roadmap put a resource's widgets in the aside of its list, but the aside holds the item panel (0028, 0074), and a summary is read before the rows, not next to one of them.
- **No chart without code.** A `series` can't read a resource ("a list doesn't give a count per period"). There is no widget for parts of a total (per status, per owner). Every chart is an endpoint written by the project, even for the same three questions on every log.
- **No shared time.** Each widget picks its own window, and an admin can't look at the same page over 7 days and then over a quarter.

## Decision

An **overview** is a set of widgets that answers questions about one or more resources. It is either a dashboard page or the summary above a list. Its widgets can count and sum a resource with no code, and it can share one period.

**Dashboard pages** ([#298](https://github.com/folkloreinc/panneau-js/issues/298)).

- A page whose component is the built-in `dashboard` carries its own widgets: `pages.activity = { "component": "dashboard", "label": "Activity", "widgets": [ … ] }`. The types, the grid, the states and the per-role filtering are those of 0064.
- The home page is the dashboard of `pages.home`. `definition.dashboard` stays as its shorthand, so existing definitions don't change.
- Data comes from `GET /dashboard/widgets/{widget}?page={page}`. Without `page` it means `home`. The `404` and `403` rules of 0064 apply per page: a widget that isn't on that page of the user is a `404`.
- Menus link to a dashboard page as to any page.

**Widgets that count a resource** ([#299](https://github.com/folkloreinc/panneau-js/issues/299)).

- **Declared, or nothing.** A resource's list declares what can be aggregated:

    ```json
    "aggregates": { "sum": ["cost", "tokens"], "groupBy": ["status", "owner"], "dates": ["created_at"] }
    ```

    A field that isn't declared can't be summed or grouped, and the backend refuses it with a `422`.

- **One endpoint.** `GET /resources/{resource}/aggregate` takes the query of the list (its filters and its search) and:
    - `measure`: `count`, or `sum:{field}`;
    - `group` (optional): `{period}:{date field}`, where the period is `day`, `week` or `month`, or a field of `groupBy`.

    It answers in the shape of a widget:
    - with no group, a `stat`;
    - grouped by a period, a `series`, with one point per period and 0 when a period is empty, as 0064 says;
    - grouped by a field, a `breakdown`.

    The answer counts only the items the user can list, through the same policies and scope as the list.

- **A new built-in type, `breakdown`:** `{ "items": [{ "label": "Failed", "value": 3, "tone": "danger", "url": "…" }], "total": 42, "other": 5 }`.
    - It is drawn as horizontal bars, the largest first, with the remainder in `other`.
    - On a resource, each bar links to the list filtered by its value. A breakdown of a `select` field takes the labels and tones of its options.
- **`stat`, `series` and `breakdown` on a resource.** With `settings.resource` and `settings.query` as in 0064, plus `settings.measure`, and `settings.group` for the last two. A `stat` with `sum:` shows the sum. A `stat` with `count` keeps reading `meta.total` of the list, as today.
- **A `stat` with a target.** An optional `target` (a budget, a quota) draws a meter under the number. Past the target, it takes the widget's `tone`.

**A summary above a list** ([#300](https://github.com/folkloreinc/panneau-js/issues/300)).

- **Declared by the resource.** A resource declares `summary: { "widgets": [ … ] }`. Its widgets are drawn between the header of the list page and the list, in the grid of a dashboard.
- **Collapsible.** The summary can be collapsed, and the browser remembers it per resource.
- **It follows the list.** Its widgets on the resource get the list's current filters and search, so filtering the list by an owner redraws the charts for that owner. A widget can keep the whole resource with `settings.followsList: false`.
- **The list can come second.** `summary.list: "collapsed"` opens the resource on its summary, with its list folded under it behind "Show the N items". A log is then read through its charts first.
- **Widgets with their own endpoint** get `GET /dashboard/widgets/{widget}?resource={resource}`, with the query of the list.

**One period** ([#301](https://github.com/folkloreinc/panneau-js/issues/301)).

- **Declared by the overview.** A dashboard page or a summary can declare `period: { "options": ["7d", "30d", "90d", "month", "year"], "default": "30d" }`.
- **Chosen in the header.** A segmented control in its header chooses the period, and the URL keeps it.
- **Widgets on a resource** get the period as the list's `date-range` filter that they name (`settings.period: "created_at"`). The backend needs nothing new.
- **Widgets with an endpoint** get `period` and its bounds (`period[from]`, `period[to]`, inclusive days, as a `date-range`). A widget that doesn't follow the period says so with `settings.period: false`, and the control lists the widgets it changes.
- **On a summary**, the period is the list's own `date-range` filter: choosing it filters the rows too.

**Logs need no new kind of resource.** A read-only resource is already one whose abilities forbid creating and editing (0046), and an admin with an overview can leave its logs out of the menus: their widgets link to their lists ("See all", a bar of a breakdown). A list reached that way keeps its filters in the URL. Its page says where it was opened from, through the history of the browser, as any page.

**Where it lives.**

- **`@panneau/protocol`:**
    - dashboard pages, `list.aggregates`, `Resource.summary`, `period`, and `BreakdownWidgetData`;
    - the `target` of a `stat`;
    - the aggregate endpoint and the `page`, `resource` and `period` parameters of the widget endpoint;
    - checks, the mock backend, and conformance.
- **`@panneau/ui`:** `BarChart` (horizontal, parts of a total, "Other") and `Meter`, on the chart colors and tones of the theme.
- **`@panneau/data`:** `useWidgetData()` with a page, a resource or a period, and a hook for the aggregate endpoint.
- **`@panneau/app`:** the `dashboard` page with its own widgets, the summary of `ResourceListPage`, and the period control.
- **`laravel-panneau`** ([#215](https://github.com/folkloreinc/laravel-panneau/issues/215)):
    - `Page::dashboard()`, `Resource::summary()`, the aggregates of a list, and the period;
    - an optional `Aggregates` contract of repositories, implemented once by `EloquentRepository` with a `GROUP BY` on a column or a truncated date;
    - `Widget::breakdown()`, with `->count()`, `->sum()`, `->per()` and `->by()` on a resource.

## Consequences

- The questions asked of a log are a few lines of the definition, with no endpoint and no JavaScript, and they can't show more than the user's list would.
- An admin with many logs can group them into one or two dashboard pages, and keep its menu to what is edited.
- A repository that isn't Eloquent gets the summaries and dashboards. Its widgets on a resource need the `Aggregates` contract, or `stat` and `list` only, as today.
- Aggregates are declared field by field, as filters are: the endpoint can't be used to read a field the list doesn't expose.
- The four parts ship one at a time, in the order of their issues. Each is useful alone: dashboard pages with endpoint widgets, then widgets on a resource, then summaries, then the period.
- Not decided:
    - users choosing their own widgets (as in 0064);
    - comparing a period with the previous one;
    - widgets of an item next to its form, which stay in the roadmap's sidebars.
