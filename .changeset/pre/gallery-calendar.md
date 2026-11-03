---
'@panneau/protocol': patch
'@panneau/core': patch
'@panneau/lists': patch
'@panneau/intl': patch
'@panneau/app': patch
---

Gallery and calendar layouts for lists ([decision 0044](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0044-gallery-and-calendar.md)).

- `@panneau/protocol`: a list has `calendar` (`ListCalendar`: `field`, `filter`, `perPage`), in the JSON Schema and its types. `lintDefinition()` checks that its field is a `date` or a `datetime`, and that the list has its `date-range` filter.
- `@panneau/core`: `resolveList()` resolves `calendar` (`ResolvedCalendar`, or `null`; `DEFAULT_CALENDAR_PER_PAGE`). In the `calendar` layout of a list with a calendar, the list state's `query` is the month's: the list's query with its `date-range` filter set to the days around the month, `perPage` from the calendar, and no page or cursor. The view has `month`, in the URL (`month=2026-11`) when it isn't the current month, with `setMonth()`, and it isn't remembered. `ListDefaults` takes `calendar`. `currentMonth()`, `shiftMonth()`, `isMonth()` and `getCalendarRange()` are exported.
- `@panneau/lists`: `GalleryLayout` (the image of each item, its title, checkbox and actions) and `CalendarLayout` (the weeks of a month from the first day of the week of the locale, with the previous, next and current month; on narrow lists, the days that have items) are built in and exported. `ListView` takes `itemImage` and `calendar`, and leaves out the gallery without the first and the calendar without the second. In the calendar, the list's filter of the calendar is hidden, there is no pagination, and a notice says when the month has more items than the list got. `ListLayoutProps` has `getItemImage` and `calendar` (`ListCalendarProps`). `getImageUrl()` reads the URL of a media reference, a file or a URL. `List` takes the calendar too.
- `@panneau/intl`: messages of the gallery and the calendar, in English and French.
- `@panneau/app`: a list offers the layouts its definition declares, or the table and the cards when it declares none, with the image of the resource's items and its calendar.
