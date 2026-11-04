# 0054: Postal addresses

- Status: proposed
- Date: 2026-11-04
- Issue: [#199](https://github.com/folkloreinc/panneau-js/issues/199)
- Builds on: the `country` and `region` types of [0047](0047-countries-regions-and-phone-numbers.md), and the address search of `location` ([0033](0033-more-field-types.md))

## Context

Many admins keep postal addresses: of organisations, venues, users, participants, orders. Panneau has no type for one, so each project rebuilds it from `text` fields:

- postal codes are never normalized or checked, and `h2x1y4`, `H2X1Y4` and `H2X 1Y4` sit in the same column;
- the province is free text, sometimes localized;
- the keys differ from one project to the next (`postal_code`, `postalcode`, `zipCode`), and a project can edit the same address in three shapes in three resources.

`location` keeps a point and one `address` string. Its address search finds the parts of an address, and drops them.

## Decision

### `address`

- **Value:** an object of strings, `{ "street", "unit", "city", "region", "postalCode", "country" }`, or `null` when every part is empty. A part that is empty is left out. A country alone isn't an address yet: a field doesn't keep it, and the checks treat it as empty.
    - `street`: the number and the street, on one line (`1234 Rue Saint-Denis`).
    - `unit`: an apartment, a suite or a floor (`App. 5`), optional.
    - `region`: a value of the `region` type for the address's country (0047): the code of the region without its country for the countries Panneau knows the regions of (`QC`), the text as typed for the others.
    - `country`: an ISO 3166-1 alpha-2 code, as a value of the `country` type.
    - `point`: `{ "lat", "lng" }`, the place of the address on a map, only with `settings.point` (below).
- **Settings:**
    - `country`: the country of a new address (`"CA"`). The field puts it in the value as soon as a part is typed, and a backend sets it on an address without one before it saves.
    - `countries` and `preferred`: those of the `country` type. With one country in `countries`, the field doesn't show the country, and sets it.
    - `required`: the parts that a filled address (with a part other than its country) must have. Defaults to `["street", "city", "country"]`, the parts every postal address has. A project that only ships to Canada lists `region` and `postalCode` too. The `required` rule, as for any field, requires an address.
    - `point`: `true` adds a map under the parts, the one of `location`, and the point to the value.
- **Field:** the parts as inputs that browsers can fill in (`autocomplete` `street-address`, `postal-code`…), the country first: it sets the labels, the order and the regions of the other parts.
    - The region is the `region` field of the country.
    - Labels by country: _Province_ and _Postal code_ for Canada, _State_ and _ZIP code_ for the United States, _Region_ and _Postal code_ elsewhere, in English and French.
    - Order: the city, the region and the postal code for the countries whose addresses end that way (Canada, the United States and the other countries of the known regions, `Montréal QC H2X 1Y4`); the postal code first elsewhere (`75001 Paris`).
- **Backends** check each part as a string, the country as a code of the field's countries, and may turn the names of the regions they know into codes (`Québec` gives `QC`), as the address search does.
- **Lists** show the address on one line, in the order of its country, with the flag of its country: `1234 Rue Saint-Denis, Montréal QC H2X 1Y4`.
- **`localized`** works as for any field: an address per locale, for projects that write the street in each language.

### Postal codes

- **Normalized** by country, by the client when the postal code or the country changes, and by the backend before it saves:
    - Canada: capitals, a space after the third character, `H2X 1Y4`;
    - United States: five digits, or ZIP+4 with a hyphen, `12345-6789`;
    - elsewhere: capitals, spaces collapsed.
- **The `postalCode` rule** is a new portable rule. It refuses a postal code that doesn't normalize to the format of its country, for the countries Panneau knows the format of: Canada and the United States for now. Postal codes of other countries pass. Clients and backends check it.
    - The `address` type implies it, as `tel` implies `tel`, with the address's own country.
    - Other fields can use it, with their country as a code or another field of the form, as for `before` and `after`: `{ "rule": "postalCode", "value": "CA" }` or `{ "rule": "postalCode", "value": { "field": "country" } }`.
- **Errors of the parts** are keyed by the path of the part, as those of a group: `address.postalCode` with `postalCode`, `address.street` with `required`. The field shows each one under its input.

### The address search

- `GeocodingResult` gets optional `address` parts. `createNominatimSource()` asks Nominatim for them (`addressdetails`), and turns the region into its code for the countries Panneau knows.
- The `address` field shows the search of the `FieldsProvider`'s maps above the parts. A place chosen fills every part, and the point with `settings.point`. Results without parts aren't shown: a source that only gives labels doesn't fill addresses.

### `location` keeps one `address` string

`location` doesn't get the parts: `address` takes an optional point instead.

- The two values answer different questions. `location` is a place on a map, which may have no postal address (a park, the entrance of a site). `address` is where to send mail, with parts that a backend checks and a site prints. The point is a convenience for the venues that show a map.
- An address without a point is the common case (users, participants, organisations). As parts of `location`, it would need a point that the value requires.
- A project that needs both keeps both values: an `address` with `point`.

## Consequences

- `address` is a built-in type, and `postalCode` a portable rule.
- `@panneau/protocol` gets `normalizePostalCode()` and `isPostalCode()`, which clients use to normalize and check postal codes.
- `@panneau/fields` gets the `address` field, with `formatAddress()`; `GeocodingResult` gets `address`, and `createNominatimSource()` fills it.
- `@panneau/forms` shows the errors of the parts of an `address` and a `link` under their inputs, as for a group.
- `@panneau/lists` gets the display of addresses.
- `laravel-panneau` gets the `Address` field, a `PostalCode` rule, and `panneau:convert-addresses`, which turns the parts of addresses kept in separate text columns into an address value, as `panneau:convert-phones` does for phone numbers. The upgrade from 1.x points to it.
