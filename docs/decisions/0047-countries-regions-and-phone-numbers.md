# 0047: Countries, regions and phone numbers

- Status: accepted
- Date: 2026-11-03
- Changes: the `tel` values of [0033](0033-more-field-types.md)

## Context

Addresses and contacts are among the most common values of an admin: an order keeps its customer's phone, and the province and country to ship to. Panneau has no field for a country or a region, so projects use `text` fields, and get `Quebec`, `QC`, `Qc` and `Québec` in the same column. A list can't filter them, and a backend can't check them.

[0033](0033-more-field-types.md) made `tel` a string as typed. The field asks for a phone keyboard, and that is all: nothing tells the user which country a number is in, `5145550199` and `+1 (514) 555-0199` are both kept as they are, and a number without its country code can't be called from abroad nor sent to an SMS service.

## Decision

### `country`

- **Value:** an ISO 3166-1 alpha-2 code, in capitals (`CA`), or `null`. `XK` (Kosovo) is allowed too.
- **Field:** a combo box of the countries, each with its flag and its name in the user's locale (`Intl.DisplayNames`), sorted in that locale. Typing filters them by name or code.
- **Settings:**
    - `countries` lists the codes the field offers, when a project only ships to some countries;
    - `preferred` lists codes shown first, above the others: `["CA", "US"]`.
- **Backends** refuse a code that isn't an ISO 3166-1 alpha-2 code, and one outside `countries` when the field has them.
- **Lists** show the flag and the name.

### `region`

A state, a province, a territory: the first-level subdivision that a postal address names.

- **Its country** is the value of the field that `from` names, in the same object (`"from": "country"`), or `settings.country` (`"CA"`) when the field has no `from` or that field is empty. Without a country, the field is a text input.
- **Value:** for a country that Panneau knows the regions of, the region's code without its country (`QC` for `CA-QC`, `13` for `JP-13`), as in addresses and in the APIs of carriers and payment services. For other countries, the region as typed. `null` when empty.
- **Field:** a combo box of the regions of its country, with their names in the user's locale, for the countries that Panneau knows; a text input for the others.
- **Known regions:** Argentina, Australia, Brazil, Canada, China, India, Japan, Mexico and the United States, where postal addresses name the first-level subdivision. Their codes come from ISO 3166-2, and their names, in English and French, from the CLDR. Other locales fall back to English.
- **Backends** check that a value is a string. They may check the code against the regions of the country, but don't have to.
- **Lists** show the name of the region, from its country in the item (`from`) or the field's settings, or the value as it is.

### `tel` (changed)

- **Value:** an international number in E.164, `+15145550199`, or `null`. While a number isn't complete, the value is the text as typed, which the `tel` rule refuses: the form can't be saved with a number that can't be called, as with JSON that doesn't parse.
- **The `tel` rule** is a new portable rule, implied by the type, as `json` is: a value is `+` and 7 to 15 digits, without a leading zero. Clients and backends check it.
- **Field:** the country of the number, its flag and its calling code (`🇨🇦 +1`), in a menu at the start of the input, and the number in that country's format as it is typed (`514 555-0199`).
    - The country follows the number: typing `+33…` picks France, and an E.164 value shows its own country. `settings.country` is the country of a new number. Without it, it is the region of the user's locale (`fr-CA` gives Canada).
    - A value that isn't E.164, kept from before, shows as it is. Leaving the field turns it into E.164 when it reads as a number of the chosen country.
    - Formats, calling codes and the lengths of numbers come from `libphonenumber-js`, with its smallest metadata.
- **Lists** show the flag and the number in its international format (`+1 514-555-0199`), linked with `tel:`. A value that isn't E.164 shows as it is.

## Consequences

- `country` and `region` are built-in types. The protocol lists them, and the `tel` rule.
- `@panneau/fields` gets the `country` and `region` fields, their data (the codes of the countries, the regions of nine countries in two languages), and depends on `libphonenumber-js`.
- `@panneau/ui`: options of selects and combo boxes can have a decorative prefix (a flag), a select can show its value in its own way and draw no box, inside another control, and a combo box can show content before its input.
- `laravel-panneau` gets the `Country` and `Region` fields, and `Tel` checks E.164 values.
- Projects with phone numbers as typed convert them to E.164, or their forms refuse them until they are retyped.
