# 0057: Durations in a declared unit, with days

- Status: proposed
- Date: 2026-11-04
- Issue: [#211](https://github.com/folkloreinc/panneau-js/issues/211)
- Changes: the `duration` values of [0033](0033-more-field-types.md)

## Context

[0033](0033-more-field-types.md) made `duration` a whole number of seconds, typed in hours, minutes and seconds, with a precision of `seconds` or `minutes`.

The sites that move to Panneau 5 keep durations, but none of them in seconds. Running times of shows, films and episodes are kept in minutes, in `number` fields or as text. The settings of a recommendation engine are a half-life in hours, time windows in days and an exclusion in minutes. To use `duration`, each site would convert its columns to seconds, and every piece of code that reads them. The input has no days either: a window of 30 days is typed as 720 hours.

Two ways to store a duration that isn't in seconds:

- **A whole number in a unit that the field declares.** The column keeps its data and its meaning: `90` is still 90 minutes for the site's own code. The database compares, sorts and sums it. The number alone doesn't say its unit: the definition does.
- **An ISO 8601 duration** (`PT1H30M`). It says its unit, but a database can't compare, sort or sum it, `P1D` and `PT24H` are the same duration written twice, and every column in minutes would still be converted.

## Decision

A duration is a **whole number in the unit of its field**, zero or more. No ISO 8601 strings.

- **`settings.unit`** is the unit of the value: `seconds` (the default, as before), `minutes`, `hours` or `days`. The `min` and `max` rules are in it too.
- **The units are seconds, minutes, hours and days.** A day is 24 hours, 86,400 seconds: no calendar, time zone or daylight saving time is involved. There are no weeks, which nobody asked for, nor months and years, which have no fixed length.
- **`settings.precision`** is the smallest part the input shows, any of the four units. It defaults to `unit`. A precision finer than `unit` is raised to it: a value in hours has no minutes to show.
- **`settings.largestUnit`** is the largest part the input shows. It defaults to the larger of `hours` and `precision`, so the input shows hours, minutes and seconds as before. A largest unit smaller than `precision` is raised to it.
- **The input** shows one number per part, from `largestUnit` down to `precision`. The largest part has no upper bound (`100` hours, `90` minutes); the others stop where the next unit starts: hours at 23 below days, minutes and seconds at 59. A value finer than the precision (a value in seconds shown to the minute) keeps its hidden part when another part changes.
- **Lists** show the parts with a value, from `largestUnit` to `precision`, rounded to the precision: `1 h 30 min`, `2 d 4 h` (`2 j 4 h` in French), `0 min` for zero.
- **The protocol** describes these settings (`DurationSettings`, `DURATION_UNITS`), and `validateDefinition()` refuses a unit it doesn't know, as it does for the settings of `richtext`.
- **Backends** still check a whole number, zero or more. The unit doesn't change what they store or check: it only tells clients how to read and show the number.

A definition without these settings behaves as before: seconds, typed in hours, minutes and seconds, the hours without an upper bound.

## Consequences

- Sites that keep minutes in a `number` field switch the type to `duration` with `"unit": "minutes"`, without touching their data. Durations kept as localized text (`1 h 30`) need a data migration, which the project writes.
- `@panneau/fields` exports the helpers that resolve the units (`resolveDurationUnits()`, `getDurationUnits()`), and `formatDuration()` and `splitDuration()` take the units as options.
- `@panneau/intl` gets the messages of days (`Days`, `d`; `Jours`, `j`).
- `laravel-panneau`'s `Duration` field gets `unit()` and `largestUnit()`, and `precision()` takes the four units.
- Changing the unit of a field that has data changes what every stored number means: the project converts the data with it.
