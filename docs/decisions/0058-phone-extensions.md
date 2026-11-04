# 0058: Phone extensions

- Status: proposed
- Date: 2026-11-04
- Changes: the `tel` values of [0047](0047-countries-regions-and-phone-numbers.md)

## Context

The contacts of an organisation often have an extension: a switchboard number, then the digits that reach a person. Sites keep it in a separate text field next to the number. Since [0047](0047-countries-regions-and-phone-numbers.md), a `tel` value is a number in E.164 (`+15145550199`), which has no room for an extension, so the extension stays apart: lists can't show it with the number, nor dial it, and nothing checks that it is digits.

Two shapes can keep an extension with its number:

- **One string**, the number in E.164, then `;ext=` and the digits, as in a `tel:` URI ([RFC 3966](https://www.rfc-editor.org/rfc/rfc3966)): `+15145550199;ext=123`.
- **An object**, `{ "number": "+15145550199", "extension": "123" }`.

## Decision

### The value is one string

- **Value:** the number in E.164, then `;ext=` and the digits of the extension, 1 to 10: `+15145550199;ext=123`. A number without an extension doesn't change: `+15145550199`. `null` when empty.
- **`settings.extension: true`** allows an extension. Without it, a `tel` value has none.
- **The `tel` rule** takes an optional parameter, `{ "rule": "tel", "extension": true }`, that accepts `;ext=` and 1 to 10 digits after the number. Without it, a value with an extension fails. The type implies `{ "rule": "tel", "extension": true }` when `settings.extension` is `true`, and `{ "rule": "tel" }` otherwise; a `tel` rule on the field replaces the implied one, as before.
- **Field:** an input for the extension, after the number, in the same box (`ext.`, `poste` in French). It takes digits only. Clearing it gives back the number alone.
    - While the number isn't complete, the value is the text as typed, with the extension after `;ext=` (`514 555;ext=123`), which the rule refuses.
    - An extension typed or pasted after the number, as people write it (`514 555-0199 ext. 123`, `x123`, `poste 123`), moves to its input when the field is left.
    - A value with `;ext=` in a field without the setting shows as it is, as any value that isn't E.164.
- **Lists** show the number in its international format and its extension, `+1 514 555 0199, ext. 123` (`poste 123` in French), linked with `tel:+15145550199;ext=123`.

### Why one string

- **Values kept today stay valid**, and so does code that reads them: a number without an extension is the same string, so a field that turns extensions on needs no conversion, and code that reads a `tel` value as a string (a search, an export, a mail template) still reads one.
- **`tel:` links take it as it is**, since it is the syntax of RFC 3966: `tel:+15145550199;ext=123`. `libphonenumber` reads it too (`parsePhoneNumber('+15145550199;ext=123').ext` is `'123'`).
- **One column.** A backend keeps it in the column it has, a `string` that the rule checks, and a list sorts and filters it as text.
- An object would change the type of every `tel` value, or give the type two shapes, for the few fields that have extensions; clients and backends would read both.

### What it costs

Code that sends the number to a service that has no extensions, an SMS service most of all, removes the extension first:

```js
const number = value.replace(/;ext=\d+$/, ''); // '+15145550199'
```

`splitExtension(value)` of `@panneau/fields/tel` gives `{ number, extension }`, and `PhoneNumber::withoutExtension($value)` of `laravel-panneau` the number in PHP. A value from a field without the setting has no extension, so this only matters for fields that turn it on.

## Consequences

- The `tel` rule of the protocol takes `extension`, and its schema has its own entry in the union of rules.
- `@panneau/fields`: `TelField` takes `extension`, and `@panneau/fields/tel` exports `splitExtension()`, `joinExtension()` and `readExtension()`. `@panneau/lists` shows extensions. `@panneau/intl` has their messages.
- `laravel-panneau`: `Tel::extension()`, a rule that accepts an extension, a `PhoneNumber` that reads and keeps extensions when asked, and `panneau:convert-phones`, which keeps the extensions typed after numbers and merges an extension kept in another column, for the columns that ask for it.
- Projects that keep an extension in a separate field turn on `settings.extension` and merge the column into the number with `panneau:convert-phones`: a data conversion, not a codemod.
