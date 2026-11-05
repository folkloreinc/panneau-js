# 0064: The widgets of the dashboard

- Status: proposed
- Date: 2026-11-04
- Changes: the built-in widgets of [0015](0015-dashboards-and-search.md)

## Context

[0015](0015-dashboards-and-search.md) made the home page a dashboard of widgets declared in the definition, per project and per role, each one fed by `GET /dashboard/widgets/{widget}`. The protocol had `Widget` (`id`, `type`, `label`, `width`, `settings`) and the route, but not what a widget returns, and the home page was still a card per resource.

An internal tools app built on the same ideas has had such a dashboard for a while. What worked there:

- a widget is a read the backend already does, as the user, through the same policies: it never shows what the user couldn't see in the resource itself;
- three shapes cover nearly every widget: a number, a series, a short list. The app draws them, and projects write no JavaScript for them;
- most widgets are "how many X need me" and "the latest X": a filtered list, counted or cut short;
- a widget that fails doesn't take the others down.

## Decision

**Three built-in types.** Each has the shape of its data, which `GET /dashboard/widgets/{widget}` returns as is (no `data` envelope). Texts are translated by the backend.

- `stat`: `{ "value": 12, "help": "3 more than last week", "tone": "warning", "url": "…" }`. The number in large type, formatted for the locale, `help` under it, the label of the widget above it. `tone` only when the number calls for attention: the number stays neutral otherwise, and at 0 (the meaning of tones is in [#226](https://github.com/folkloreinc/panneau-js/issues/226)). The widget links to `url`.
- `series`: `{ "period": "day", "points": [{ "date": "2026-10-05", "value": 4 }], "total": 12 }`. `period` is `day`, `week` or `month`, and each `date` is the first day of its period, the dates going up, one point per period (a period without a value is a point at 0). A line on the first categorical chart color of the theme, and `total` above it when there is one.
- `list`: `{ "items": [{ "title": "…", "description": null, "meta": "12 answers", "url": "…", "badge": { "label": "Open", "tone": "success" } }], "empty": "No open contests.", "url": "…" }`. At most 5 items, the most useful first: the backend chooses them. `empty` is the message without items (a generic one otherwise), `url` the "See all" link under them.

These replace the built-in types of 0015: its chart is the `series`, its recent items a `list` on a resource. Shortcuts and a welcome message aren't built-in widgets: the menus and the header of the home page already have them, and a plugin can add them.

**Widgets on a resource.** The built-in `stat` and `list` can read the list of a resource instead of an endpoint of their own:

```json
{
    "id": "to-judge",
    "type": "stat",
    "label": "Entries to judge",
    "settings": { "resource": "entries", "query": { "filter[status]": "to-judge" } }
}
```

- `settings.query` is the query of the list, written as its query parameters, and the client adds the page: a `stat` reads one item and shows `meta.total`, a `list` reads the first 5 and shows their title (`itemTitle`) and the badge of their value of the first `select` column of the list. Both link to the list with that query, and each item to where its title goes in the list.
- The user reads the list as they would on its page: no endpoint, no new policy, and the widget is up to date as soon as an item changes.
- `validateDefinition()` checks that the resource exists, that the filters of `query` are filters of its list, that `query` doesn't set `page`, `perPage` or `cursor`, and that a `stat` doesn't read a list paged with cursors, which has no total. A `series` has no `resource`: a line needs a count per period, which a list doesn't give.

**Widgets of plugins.** Any other `type` is a widget of a plugin (`widgets` of `PanneauPlugin`), a component that gets `WidgetProps`: the widget, the data of the same endpoint, and the definition. The dashboard draws its card, its label, its skeleton and its error; the plugin draws the data. A type that no plugin provides says so in its place. The built-in types can't be replaced by a plugin: a project that wants another home page replaces the `dashboard` page.

**The endpoint.** `GET /dashboard/widgets/{widget}` answers only the widgets of the user's dashboard, as the user:

- a widget that isn't in it, or a `stat` or `list` on a resource, is a `404`;
- a widget the user isn't allowed to see is a `403`;
- data that doesn't have the shape of its type is a `500` problem, never the data. The backend logs the wrong keys. `checkWidgetData()` of `@panneau/protocol/runtime` is the reference of these checks, and `StatWidgetData`, `SeriesWidgetData` and `ListWidgetData` are the schemas.

**States.** Each widget loads on its own:

- while it loads, a skeleton of its type ([0034](0034-skeletons-while-content-loads.md)): the number, the line, three rows;
- when it fails (an error, data in the wrong shape, a widget that throws while it draws), its error with "Try again", in its place;
- on a `403`, or on a resource the user can't list, nothing: the widget isn't drawn, and the grid closes the gap;
- the others are unaffected.

**Layout.** A grid of 12 columns. A widget takes its `width`, 3 for a `stat` and 6 for the others by default, in the order of the definition. On a narrow screen (under 48rem), one column.

**Per role.** The backend sends the widgets of the user in `dashboard.widgets`, as it already builds the menus and the abilities for them. A user without widgets has the cards of the resources.

**Where it lives.**

- `@panneau/protocol`: the shapes and `settings` in the schemas and the OpenAPI document, the checks, a `widgets` option of the mock backend, and conformance checks of the endpoint and of the lists of the widgets on a resource.
- `@panneau/ui`: `Stat` and `LineChart`, on the chart colors of the theme.
- `@panneau/data`: `useWidgetData()`.
- `@panneau/app`: `pages.home` with `{ "component": "dashboard" }` renders `definition.dashboard`. Without widgets, the cards of the resources stay.
- `laravel-panneau`: the builders (`Widget::stat()`, `Widget::series()`, `Widget::list()`, on a resource or `using()` a class), the endpoint and its checks, and a cache per widget, user and locale for widgets that call another service or compute something heavy ([folkloreinc/laravel-panneau#178](https://github.com/folkloreinc/laravel-panneau/issues/178)).

## Consequences

- The common dashboard ("how many need me", "the latest") is a few lines of the definition, with no endpoint and no JavaScript.
- A widget can't show more than its user could find in the admin: it is a read of a list they can open, or an endpoint that runs as them.
- Users can't choose and arrange their own widgets yet: that needs the same store of preferences as saved views ([0042](0042-list-view-columns-and-remembered-view.md)), and keeps this format.
