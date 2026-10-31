# @panneau/codemods

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
