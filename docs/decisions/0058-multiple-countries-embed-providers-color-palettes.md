# 0058: Several countries, the providers of an embed, and color palettes

- Status: proposed
- Date: 2026-11-04
- Issues: [#213](https://github.com/folkloreinc/panneau-js/issues/213), [#214](https://github.com/folkloreinc/panneau-js/issues/214), [#215](https://github.com/folkloreinc/panneau-js/issues/215)
- Changes: the `embed` type of [0033](0033-more-field-types.md), and the `country` type of [0047](0047-countries-regions-and-phone-numbers.md)

## Context

Three built-in types fall short of what sites store. Films, works and artists have several countries, which sites keep as taxonomies of names typed by hand, while `country` holds one code. Some embeds only make sense from some providers, a trailer from YouTube or Vimeo, while `embed` accepts any URL its backend resolves. And editors pick the background of a block among the few colors of a brand, which sites write as a `select` of color names without a swatch, since `color` takes any hexadecimal value.

## Decision

### `country` with `multiple`

- **Value:** an array of distinct codes, in the order they were chosen, `["CA", "FR"]`, or `null` when empty. The order is the user's: credits list countries in an order that matters.
- **Field:** the chosen countries, each with its flag, its name and a button that removes it, then the combo box of the single field, which adds one and leaves out those already chosen. `countries` and `preferred` apply.
- **Rules:** `min` and `max` count the countries, and `required` needs one.
- **Backends** check an array of distinct codes, each allowed by the field.
- **Lists** show the flags and the names.

### The `providers` rule

- **A portable rule:** `{ "rule": "providers", "value": ["YouTube", "Vimeo"] }`. Its names are the `provider_name` of oEmbed, the `provider` of an `EmbedValue`, compared without case.
- **Names, not URL hosts.** A provider has many hosts (`youtube.com`, `youtu.be`, `m.youtube.com`) and a host can change, while its oEmbed name is what the backend already resolves and stores. A rule on hosts would repeat, in every definition, the schemes that the backend's resolver knows.
- **Clients** check the value that `GET /embeds` resolved, and show the failure as soon as it comes back. A value without a `provider` (an app without the endpoint) is left to the backend. The field names the providers under its help.
- **Backends** resolve the URL, as they do when saving it (from their cache, usually), and refuse a URL that they can't resolve or whose provider isn't listed.

### `color` with a palette

- **`settings.palette`:** `[{ "value": "purple", "label": "Purple", "color": "#6b21a8" }]`. `value` is what the field stores, `color` (hexadecimal) draws its swatch, and `label` names it. Without `color`, `value` is a hexadecimal color, which draws itself.
- **Stored values are the palette's `value`s, not hexadecimal colors.** A brand's purple can change without rewriting content: the site maps `purple` to its color where it renders it, and the palette's `color` is only the swatch the admin shows.
- **Field:** with a palette, a select of its colors, each with its swatch, that can be emptied unless the field is required. A value outside the palette, kept from before, shows as it is. Without a palette, the field is the hexadecimal input of today.
- **Backends** refuse a value outside the palette.
- **Lists** show the swatch and the label, from the field's palette.

## Consequences

- The protocol has one more portable rule, `providers`, and `multiple` applies to `country`.
- `@panneau/fields`: `CountryField` takes `multiple`, `EmbedField` takes `providers`, and `ColorField` takes `palette`. `@panneau/fields/color` exports `getColorPalette()` for displays.
- `laravel-panneau` gets `Country::multiple()`, `Embed::providers()` and `Color::palette()`.
- No codemod nor Rector rule: v4 fields had none of these options. A project with a taxonomy of countries, its own embed rule or a `select` of color names migrates its data or its definitions by hand.
