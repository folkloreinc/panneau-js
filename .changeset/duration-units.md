---
'@panneau/protocol': minor
'@panneau/fields': minor
'@panneau/lists': minor
'@panneau/intl': minor
---

`duration` values in a declared unit, with days ([decision 0056](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0056-duration-units.md)).

- **`settings.unit`** is the unit of a `duration` value: `seconds` (the default, as before), `minutes`, `hours` or `days`. The value stays a whole number in that unit, and so do the `min` and `max` rules. A day is 24 hours.
- **`settings.precision`** takes the four units, as the smallest part the input shows. It defaults to the unit, and a precision finer than the unit is raised to it.
- **`settings.largestUnit`** is the largest part the input shows: `hours` by default (or the precision when it is larger), or `days`. The largest part has no upper bound; hours stop at 23 below days.
- `DurationField` takes `unit`, `precision` and `largestUnit`. `formatDuration()` and `splitDuration()` take them as options (their former calls work as before), and `formatDuration()` takes the `labels` of the units. New helpers: `resolveDurationUnits()`, `getDurationUnits()`, `isDurationUnit()`.
- Lists show the days, in the unit and to the precision of the field: `2 d 4 h` (`2 j 4 h` in French).
- `@panneau/protocol`: `DURATION_UNITS` and the `DurationSettings` schema, which `validateDefinition()` checks.
- `@panneau/intl`: the messages of days.
- Definitions without these settings behave as before. No codemod or Rector rule is needed: v4 had no duration field, and sites that keep minutes in a `number` field switch its type to `duration` and set `unit: minutes`, without touching their data.
