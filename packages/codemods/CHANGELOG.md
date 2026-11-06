# @panneau/codemods

## 5.0.0-alpha.27

No changes in this release.

## 5.0.0-alpha.26

No changes in this release.

## 5.0.0-alpha.25

No changes in this release.

## 5.0.0-alpha.24

No changes in this release.

## 5.0.0-alpha.23

No changes in this release.

## 5.0.0-alpha.22

No changes in this release.

## 5.0.0-alpha.21

No changes in this release.

## 5.0.0-alpha.20

No changes in this release.

## 5.0.0-alpha.19

No changes in this release.

## 5.0.0-alpha.18

No changes in this release.

## 5.0.0-alpha.17

No changes in this release.

## 5.0.0-alpha.16

### Minor Changes

- 9278b2c: Several countries, the providers of an embed, and color palettes ([decision 0058](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0058-multiple-countries-embed-providers-color-palettes.md)).
  
  - **`country` with `multiple`:** the value is an array of distinct ISO codes, in the order they were chosen. `CountryField` takes `multiple`: the chosen countries show with their flags and names, each with a button that removes it, and the combo box adds one, leaving out those already chosen. `min` and `max` count the countries. Lists show the flags and the names.
  - **The `providers` rule:** a new portable rule, `{ "rule": "providers", "value": ["YouTube", "Vimeo"] }`, that checks the `provider` of an `embed` value without case (a value without one is left to the backend). `EmbedField` takes `providers`: it names them under its help, and refuses an embed of another provider as soon as its preview comes back. Forms name the providers in the rule's message, in English and French.
  - **`color` with a palette:** `settings.palette`, `[{ value, label, color }]`, the colors to pick from. `ColorField` takes `palette`: a select of its colors with their swatches, that can be emptied unless the field is required. `getColorPalette()` and `getSwatchColor()` of `@panneau/fields/color` read it. Lists show the swatch and the label of a palette's color.
  - No codemod is needed: v4 fields had none of these options. A project with a taxonomy of countries, its own embed rule or a `select` of color names migrates its data or its definitions by hand.
- 3522797: Phone extensions ([decision 0057](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0057-phone-extensions.md)).
  
  - **`tel` values can have an extension**, after `;ext=` as in a `tel:` URI: `+15145550199;ext=123`. A number without an extension doesn't change.
  - `@panneau/protocol`: the `tel` rule takes `extension: true`, which accepts 1 to 10 digits after `;ext=`; without it, a value with an extension fails. The `tel` type implies `{ rule: 'tel', extension: true }` when `settings.extension` is `true`.
  - `@panneau/fields`: `TelField` takes `extension` (`settings.extension`), an input for the digits of the extension after the number. An extension typed or pasted after the number (`ext. 123`, `x123`, `poste 123`) moves to that input when the field is left. `@panneau/fields/tel` exports `splitExtension()`, `joinExtension()`, `readExtension()` and `MAX_EXTENSION_LENGTH`.
  - `@panneau/lists`: the `tel` display shows the extension, `+1 514 555 0199, ext. 123`, linked with `tel:+15145550199;ext=123`, when the field allows one.
  - `@panneau/intl`: their messages, in English and French.
  - `@panneau/codemods`: `TelField` takes `extension`.
  - No codemod or Rector rule: a v4 `telephone` field had no extension, and an extension kept in a separate field is merged into the number by a data conversion (`panneau:convert-phones` of `laravel-panneau`), not by rewriting code.

## 5.0.0-alpha.15

No changes in this release.

## 5.0.0-alpha.14

No changes in this release.

## 5.0.0-alpha.13

### Minor Changes

- b07c7ab: Countries, regions and phone numbers ([decision 0047](https://github.com/folkloreinc/panneau-js/blob/v5.x/docs/decisions/0047-countries-regions-and-phone-numbers.md)).
  
  - **`country`:** a new built-in type, an ISO 3166-1 alpha-2 code (`CA`). `CountryField` (`@panneau/fields/country`) picks it by name in the user's locale, with its flag; `settings.countries` limits the choices and `settings.preferred` puts some first. Lists show the flag and the name.
  - **`region`:** a new built-in type, a state, a province or a territory of the country in the field that `from` names, or of `settings.country`. `RegionField` (`@panneau/fields/region`) picks among the regions of Argentina, Australia, Brazil, Canada, China, India, Japan, Mexico and the United States, named in English or French, and gives the code without the country (`QC`); for other countries, it is a text. Lists show the name.
  - **`tel` values are now E.164** (`+15145550199`). **Breaking:** the new `tel` rule, implied by the type, refuses numbers kept as typed. `TelField` shows the country of the number, its flag and its calling code in a menu at the start of the input, formats the number as it is typed, follows a number typed with its calling code, and turns a number as typed into E.164 when the field is left. `settings.country` (`country`) is the country of a new number. Lists show the flag and the international format.
  - `@panneau/ui`: options of `Select` and items of `ComboBox` take a decorative `prefix`; `ComboBox` takes a `prefix` before its input; `Select` takes `renderValue` and `appearance="bare"`, to sit inside another control.
  - `@panneau/fields` depends on `libphonenumber-js`.
  - `@panneau/ui`: a `TextInput` with a prefix or a suffix, and a `ComboBox`, now look read-only when they are (`isReadOnly`); a read-only `ComboBox` has no button to show its options.

## 5.0.0-alpha.12

No changes in this release.

## 5.0.0-alpha.11

No changes in this release.

## 5.0.0-alpha.10

No changes in this release.

## 5.0.0-alpha.9

No changes in this release.

## 5.0.0-alpha.8

### Patch Changes

- 83c82d4: The declaration files work in TypeScript projects on `"module": "NodeNext"`. Their relative specifiers now name their file (`./schemas/index.js`, `./rest.js`), so the types that an entry point re-exports, such as `Definition` of `@panneau/protocol`, are no longer missing under Node's resolution, and the CSS Modules that some declarations imported are declared in place. Nothing changes for projects on the `Bundler` resolution.

## 5.0.0-alpha.7

### Minor Changes

- cb28e44: Add `@panneau/codemods` (#129): `npx @panneau/codemods@alpha v4-to-v5 <paths...> [--dry]` moves the JS of a Panneau 4 project to Panneau 5, and reports what it can't rewrite.
  
  - The container that renders `<Panneau components={{ [FIELDS_NAMESPACE]: fields }}>` of `@panneau/app` becomes a module that exports the project's plugin (`definePlugin({ id: 'project', fields, displays, … })`), with its keys in kebab case, and the entry that `panneau:install --upgrade` writes gets it in the `plugins` of `createPanneauApp()`. `definition`, `routes`, `user` and `baseUrl` come from the boot config; `uppy`, `MediasBrowserProvider`, the CSS of `@panneau/app` and the locales of `@panneau/intl` are dropped.
  - Custom field components keep their props, and get a registry entry next to them (`TitleFieldEntry(props: FieldEntryProps)`), which gives them `value`, `onChange`, the props of `getFieldProps()`, `locale`, `locales` and their own props from the `settings` of the field, wrapped in a `Fieldset` with the field's label, help and errors, as v4 wrapped them in a form group. The index of the fields re-exports the entries.
  - `useFieldComponent('text')` and `@panneau/field-*` become the v5 components (`TextField` of `@panneau/fields/text`, `SelectField` with `widget="radios"`, `ImageField` of `@panneau/media`…), with their renamed props (`prepend` → `prefix`, `helpText` → `description`); `fieldComponent` of a localized field becomes its children function, and a localized field without one is reported; `FormGroup` becomes the `label` of the field it wraps, or a `Fieldset`; `useFormValue()` reads `useFormState(useFormContext()).values` of `@panneau/forms`.
  - Everything else of v4 (imports of `@panneau/core/contexts`, `@panneau/data`, `@panneau/element-*`, props a v5 component doesn't have, ids of project fields, Bootstrap classes of `className` props) is reported, with what replaces it, and marked with a `// TODO(panneau-5)` comment. Running the codemods again changes nothing, and lists what is left. The changed files are then formatted with the project's Prettier.
