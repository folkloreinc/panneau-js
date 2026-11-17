---
'@panneau/protocol': minor
'@panneau/data': minor
'@panneau/app': minor
'@panneau/intl': minor
---

Dashboards as pages (decision 0084). A page whose component is the built-in `dashboard` carries its own `widgets`, and the app draws them under the page's label, or says it has none. The home page is the dashboard of `pages.home`: its widgets are `pages.home.widgets`, or `dashboard.widgets`, which stays as the shorthand, so existing definitions don't change.

- `@panneau/protocol`: `widgets` on a `Page`, `getDashboardWidgets(definition, page)`, `getDashboardPages(definition)`, `HOME_PAGE` and `DASHBOARD_COMPONENT` in `@panneau/protocol/runtime`. `validateDefinition()` checks the widgets of every dashboard page, and refuses `widgets` on another page. `GET /dashboard/widgets/{widget}` takes `page` (`home` without it) in the OpenAPI document, the mock backend answers the widgets of every dashboard page (its widget functions get the `page`), and conformance checks each dashboard page, and that a widget is a `404` on a page it isn't on.
- `@panneau/data`: `getWidgetData(widget, { page })`, `widgetDataQueryOptions(adapter, widget, { page })` and `useWidgetData(widget, { page })`. The key of a widget, `queryKeys.widget(widget, { page })`, now ends with its page, still under `['panneau', 'dashboard']`.
- `@panneau/app`: the built-in `dashboard` page draws the widgets of its own page, and a menu links to it as to any page. `@panneau/intl`: the message of a dashboard page without widgets.
