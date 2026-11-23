---
'@panneau/ui': patch
'@panneau/fields': patch
'@panneau/intl': patch
---

Fixes in fields. An invalid `Select` has the red border and focus ring of an invalid text input. The map of a location or an address field no longer zooms when the page scrolls over it: the wheel scrolls the page, with a hint to hold ⌘ (Ctrl elsewhere) or to click the map, which then zooms with the wheel; its buttons, a pinch, a double click and the + and − keys still zoom it. Date-time and date range fields name the time zone they are typed in, in the locale, with its offset on that day (`Eastern Time (UTC−4)`), and lists show ranges in another zone the same way. `DatePicker` takes `end`, content at the end of its control.
