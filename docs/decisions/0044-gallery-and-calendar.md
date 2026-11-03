# 0044: Gallery and calendar layouts, and the query of a calendar

- Status: accepted
- Date: 2026-11-03
- Issue: [#178](https://github.com/folkloreinc/panneau-js/issues/178)
- Changes: the layouts of a list in the protocol, and the list state of [0022](0022-lists-render-core-state.md) and [0042](0042-list-view-columns-and-remembered-view.md)

## Context

The protocol named four layouts of a list from the start: `table`, `cards`, `gallery` and `calendar`. Lists had the first two. The contests platform needs the other two: the photos of a contest's entries, and the events of a contest (rounds, judging days, the ceremony) on their dates.

A gallery is another way to draw a page of items. A calendar isn't: it shows the items of a month, however many pages they would take, and a page of the list in date order would cut a month anywhere.

## Decision

### Gallery

- **`gallery`** shows the items as a grid of images: the image of each item, its title under it, its checkbox and its actions.
- **The image is the item's `itemImage` field** of the resource, which search results and pickers already show: a media reference (its thumbnail), or a URL. An item without one shows a placeholder.
- A list without `itemImage` doesn't offer the gallery. It is paged as the other layouts are.

### Calendar

- **A list declares its calendar:**

    ```jsonc
    "list": {
        "layouts": ["table", "calendar"],
        "filters": [{ "id": "starts_at", "type": "date-range" }],
        "calendar": { "field": "starts_at" } // and optionally "filter": "starts_at", "perPage": 200
    }
    ```

    - `field` is a `date` or `datetime` field of the resource: each item is shown on the day of its value.
    - `filter` is the id of the list's `date-range` filter on that field, the field's name by default. The calendar needs one: it is how it asks for a range of dates. `lintDefinition()` checks both.
    - Without `calendar`, a list doesn't offer the `calendar` layout.

- **Its query is a range of dates, not a page.** In the calendar, the list state asks for the list's query (its other filters, its search) with:
    - the `date-range` filter set to the days around the month shown: from 6 days before its first day to 6 days after its last day, so that the weeks shown are covered whatever day they start on (`filter[starts_at][from]=2026-10-26&filter[starts_at][to]=2026-12-06`). It replaces the value the user gave that filter, whose control is hidden in the calendar;
    - `perPage` from `calendar.perPage`, 100 by default, and no `page` or `cursor`.

    A backend needs nothing new: it answers the list endpoint as for any other query.

- **One request per month.** When the answer says that more items match than it gave (`total` above the items, or a `nextCursor`), the calendar says how many it shows, and that filters narrow it. It doesn't follow the pages: a month of the contests platform holds tens of events, and a resource with thousands a month is a list to filter, or a calendar with a larger `perPage`.
- **The month is part of the view** ([0042](0042-list-view-columns-and-remembered-view.md)), in the URL as `month=2026-11` when it isn't the current month. It is not remembered: a calendar opens on the current month.
- **The calendar shows** the weeks of the month, starting on the first day of the week of the UI's locale (Monday in French, Sunday in American English), with the title of each item as its link, in the order of their dates. Buttons go to the previous and the next month, and to today's. On a phone, it lists the days of the month that have items, in order.
- The calendar has no checkboxes: selections are made in the other layouts.

## Not decided here

- **Items over several days** (an `end` field), weeks and days as views, and dragging an item to another day to change its date.
- **A calendar that follows every page** of a month.

## Consequences

- The protocol's `ListDefinition` has `calendar` (`field`, `filter`, `perPage`), in the JSON Schema and its types, and `lintDefinition()` checks its field and its filter. The protocol says which layouts the clients build in.
- `@panneau/core`: `resolveList()` resolves `calendar` (`ResolvedList.calendar`, or `null`). In the calendar, the list state's `query` is the query of the month, and its view has `month`, with `setMonth()`.
- `@panneau/lists`: `GalleryLayout` and `CalendarLayout` are built in, and exported. `ListView` takes `itemImage` and `calendar`, and leaves out the layouts it can't show. `ListLayoutProps` gives layouts `getItemImage()` and, in the calendar, `calendar` (the field, the month, `onMonthChange`, and how many items the month has when the page doesn't hold them all).
- `@panneau/app`: a list offers the layouts its definition declares, or the table and the cards when it declares none, as before.
- `laravel-panneau`'s `ResourceList` has `calendar()`.
