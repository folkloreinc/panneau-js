# 0053: Date ranges and money

- Status: proposed
- Date: 2026-11-04
- Issues: [#198](https://github.com/folkloreinc/panneau-js/issues/198), [#200](https://github.com/folkloreinc/panneau-js/issues/200)
- Changes: the `calendar` of lists ([0044](0044-gallery-and-calendar.md)), and makes the `timeZone` setting of `datetime` part of the protocol

## Context

Two kinds of values are rebuilt by hand in the admins that move to Panneau 5.

**Date ranges.** Events, performances, editions, campaigns and contest periods have a start and an end. Every site edits them as two independent `date` or `datetime` fields over two columns: nothing checks that the end comes after the start, the end is often optional, and none of them has an "all day" flag. Performances and screenings are a range plus a venue, repeated, written again as a custom field in several sites. Date-times are stored in the application's time zone. One platform also keeps an IANA time zone next to some of its periods, and shows their bounds in that zone, whatever the zone of the user.

**Money.** Prices, offers, donations and prizes are typed in a `number` field with `$ CAD` as a suffix, and kept as dollars in floats, as decimals, or as cents in integers, depending on the site. Amounts are rounded by hand (`Math.round(value * 100)`), which assumes two decimals for every currency. Payment services (Stripe, PayPal, Square) all take an amount in minor units and an ISO 4217 currency.

## Decision

### `daterange`

- **Value:** one object, `{ "start", "end" }`, or `null` when empty. It is one value of the item, like `location`: one field, one rule, one picker, one column of lists. A backend stores it as it wants: the Laravel cast keeps it in two columns (`starts_at`, `ends_at`), as the sites do, so that both stay sortable and filterable.
- **Bounds:** set by `settings.time`.
    - Without it (the default), the bounds are days: `{ "start": "2026-11-04", "end": "2026-11-06" }`. Both are inclusive: this range is three days.
    - With `"time": true`, they are date-times, with an offset: `{ "start": "2026-11-04T23:30:00Z", "end": "2026-11-05T01:00:00Z" }`. Clients write them in UTC, as `datetime` values. A backend may send them with another offset (the application's).
    - With `"time": true` and `"allDay": true`, the field has an "All day" switch. An all-day value has days as bounds and `"allDay": true`, as calendars do (iCalendar, Google Calendar): `{ "start": "2026-11-04", "end": "2026-11-04", "allDay": true }`. Other values leave `allDay` out, or set it to `false`.
- **Open ends:** `settings.open` is `start`, `end` or `both`: that bound can be `null`. An exhibition "from November 4" has no end; a sale "until December 1" has no start. Without it, a range has both bounds.
- **The `daterange` rule** is a new portable rule, implied by the type, as `json` and `tel` are. Clients and backends check that a filled value:
    - is an object whose bounds are days or date-times, or `null` where the range is open;
    - has both bounds where it isn't open: a client keeps a range typed halfway as it is, and the rule refuses it (`start` or `end`);
    - ends on or after its start (`order`). A range of one day, or of no time at all, is valid.

    `required` fails on `null`. The rule reads `open` from the field: the client adds it to the implied rule, `{ "rule": "daterange", "open": "end" }`.

- **Time zones of date-times.** A date-time on the wire is an instant. The zone it is shown and typed in is, in order:
    1. the value's `timeZone`, an IANA zone (`America/Toronto`), when it has one;
    2. `settings.timeZone`, the zone of the place, for a field whose events all happen in one city;
    3. the browser's.

    With `"chooseTimeZone": true`, the field shows a menu of zones next to the bounds, and keeps the choice in the value: `{ "start", "end", "timeZone": "America/Vancouver" }`, for a platform that keeps a zone next to its periods. A backend keeps it as it is (the Laravel cast in a third column). Lists show the bounds in the zone of the value, or of the field, with the zone's short name when it isn't the user's.

    `settings.timeZone` is the setting `datetime` already reads: it becomes part of the protocol for both types. A `datetime` value is a string, and has no zone of its own; a single date-time that needs one is not decided here. A `time` has no date, so no zone.

- **Field:** one control for both bounds: the start and the end, typed segment by segment in the order of the locale, and one calendar that picks the range in two clicks. With `time`, each bound has its time; with `allDay`, a switch hides the times. An open bound can be cleared alone.
- **Lists** show the range in the locale's format, with `Intl.DateTimeFormat.formatRange`: `Nov 4 – 6, 2026`, `Nov 4, 2026, 7:30 – 9:00 PM`. An open range shows `From Nov 4, 2026` or `Until Dec 1, 2026`. Lists sort a range by its start.
- **The `date-range` filter** on a `daterange` field keeps the items whose range overlaps the filter's days: they start on or before `to`, and end on or after `from`. An open bound never limits the overlap.
- **The calendar** ([0044](0044-gallery-and-calendar.md)) takes a `daterange` field: an item shows on each day its range covers, within the weeks shown, and the calendar asks for a month through the same `date-range` filter, which gives the items that overlap it. A range open at its end shows on its first day only. `lintDefinition()` accepts a `daterange` as the field of a calendar.

#### Sessions: a repeater, not a type

> Changed by [0065](0065-compound-fields.md): sessions are a compound field, `"type": "sessions"` with `multiple`, which renders as this repeater without its plugin.

Performances and screenings are a list of sessions, each a range and a venue. They are a `repeater` of a `daterange` and a `relation` to the venues, not a type of their own:

```jsonc
{
    "name": "sessions",
    "type": "repeater",
    "fields": [
        { "name": "dates", "type": "daterange", "settings": { "time": true } },
        { "name": "venue", "type": "relation", "resource": "venues" },
    ],
}
```

- A type would have to know which resource holds the venues, and how many other fields a session has: a price, a link to the tickets, a note. A repeater already does, and the `daterange` rule applies to each session.
- `laravel-panneau` gives the preset, `Sessions::make('sessions')->venues('venues')`, which builds that repeater. The Laravel side decides whether sessions are a JSON column or rows of their own.
- A calendar of the sessions of each item is not decided here.

### `money`

- **Value:** `{ "amount": 1250, "currency": "CAD" }`, or `null` when empty.
    - `amount` is an integer in the minor unit of the currency: cents for the dollar and the euro, yen for the yen, thousandths of a dinar for the Kuwaiti dinar. The number of digits of each currency is its exponent in ISO 4217, which Panneau ships, not the CLDR's, which differs for a few cash currencies. There is no decimal option: a decimal amount is the source of the rounding errors this type removes, and payment services want minor units.
    - `currency` is an ISO 4217 code in capitals.
- **Currency:**
    - `settings.currency` fixes it: the field shows it, and can't change it;
    - `settings.currencies` lists those the user picks from, in a menu next to the amount, the first one for a new amount;
    - without either, the menu offers every currency, and a new amount has none until one is picked.
- **The `money` rule** is a new portable rule, implied by the type. A filled value is an object with an integer `amount` and a `currency`: among `currencies`, or equal to `currency`, when the field has them; an ISO 4217 code that Panneau knows otherwise (`CURRENCY_CODES`). The client adds them to the implied rule, `{ "rule": "money", "currencies": ["CAD", "USD"] }`. An amount typed without a currency keeps `currency: null`, which the rule refuses.
- **`min` and `max`** apply to the amount, in minor units: `{ "rule": "min", "value": 100 }` is one dollar. They don't convert currencies.
- **Field:** a number input in the currency format of the locale (`1 250,00 $` in French, `$1,250.00` in English), with the digits of the currency. It reads and writes minor units, without floating point errors. Clearing the amount gives `null`.
- **Lists** show the amount in the locale's currency format, and sort it by its amount.
- **Taxes stay out of the type.** Whether a price includes taxes is a policy of the site, the same for all its prices in most of them, and a payment service doesn't take it. A site that needs it per price adds a `boolean` field next to the amount; the taxes of an order are amounts of their own.

## Consequences

- `daterange` and `money` are built-in types. The protocol lists them, the `daterange` and `money` rules, and the types of their values (`DateRangeValue`, `MoneyValue`), and ships the exponents of ISO 4217 currencies (`getCurrencyDigits()`).
- `checkRules()` reads the amount of a `money` value for `min` and `max`. Implied rules can carry settings of their field.
- `@panneau/ui` gets a `DateRangePicker` with open ends. `NumberInput` already formats currencies.
- `@panneau/fields` gets `DateRangeField` and `MoneyField`. `@panneau/lists` gets their displays, and the calendar shows ranges.
- Panneau 4 had no range or money field, so `@panneau/codemods` has nothing to replace. `laravel-panneau`'s upgrade report suggests `daterange` where a resource has two date fields named as a start and an end, and `money` for a number field with a currency suffix: the values have to be converted, so neither is automatic.
- `laravel-panneau` gets the `DateRange`, `Money` and `Sessions` fields, a `Money` value object, the `AsDateRange` and `AsMoney` casts, the overlap of `date-range` filters on ranges, and `panneau:convert-money`, which turns amounts kept as floats or decimals into minor units.
