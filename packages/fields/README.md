# @panneau/fields

Controlled field components for the protocol's built-in field types, built on [`@panneau/ui`](../ui). They work without a definition, a router or a network: a product can use them directly in its own screens.

```bash
npm install @panneau/fields@^5.0.0-alpha.0 @panneau/ui@^5.0.0-alpha.0 react-aria-components react-intl
```

```tsx
import { TextField } from '@panneau/fields/text';
import { PanneauRoot } from '@panneau/ui';

<PanneauRoot>
    <TextField label="Title" value={title} onChange={setTitle} errors={errors.title} required />
</PanneauRoot>;
```

## Fields

Every field takes `value`, `onChange`, `onBlur`, `errors`, `disabled`, `readOnly`, `required`, `label` and `description`, plus `className` and `xxxClassName` props for its inner elements. Fields keep no value of their own, and an empty value is `null`.

| Import                      | Components                                   | Value                                          |
| --------------------------- | -------------------------------------------- | ---------------------------------------------- |
| `@panneau/fields/text`      | `TextField`                                  | `string`                                       |
| `@panneau/fields/textarea`  | `TextAreaField`                              | `string`                                       |
| `@panneau/fields/number`    | `NumberField`                                | `number`                                       |
| `@panneau/fields/boolean`   | `BooleanField` (checkbox, switch)            | `boolean`                                      |
| `@panneau/fields/date`      | `DateField`                                  | `'2026-10-15'`                                 |
| `@panneau/fields/datetime`  | `DateTimeField`                              | `'2026-10-15T13:30:00Z'`, or without an offset |
| `@panneau/fields/time`      | `TimeField`                                  | `'09:30'`                                      |
| `@panneau/fields/select`    | `SelectField` (dropdown, radios, checkboxes) | an option's value, or a list with `multiple`   |
| `@panneau/fields/email`     | `EmailField`                                 | `string`                                       |
| `@panneau/fields/url`       | `UrlField`                                   | `string`, with `https://` added on blur        |
| `@panneau/fields/color`     | `ColorField`                                 | `'#1d4ed8'`                                    |
| `@panneau/fields/slug`      | `SlugField`, `slugify()`                     | `string`, following a `source` until edited    |
| `@panneau/fields/localized` | `LocalizedField`                             | `{ fr: …, en: … }`                             |
| `@panneau/fields/group`     | `GroupField`                                 | an object                                      |
| `@panneau/fields/repeater`  | `RepeaterField` (items or typed blocks)      | a list of objects; blocks have a `type`        |
| `@panneau/fields/relation`  | `RelationField`, `createRelationSource()`    | `{ id, label }`, or a list with `multiple`     |
| `@panneau/fields/locales`   | `en`, `fr`                                   | deprecated: use `@panneau/intl`                |

## From a definition

Each subpath also exports the **registry entry** of its type (`TextFieldEntry`…): a component that renders a protocol `Field`. `@panneau/fields` exports them all as `builtInFields`, and as `fieldsPlugin` for `@panneau/core`. `DefinitionField` uses them without a provider; `FieldsProvider` adds or overrides entries.

```tsx
import {
    DefinitionField,
    FieldsProvider,
    builtInFields,
    createRelationSource,
} from '@panneau/fields';

<FieldsProvider
    components={builtInFields}
    locales={['fr', 'en']}
    relationSource={createRelationSource(adapter, { definition })}
>
    <DefinitionField field={field} path={field.name} value={value} onChange={setValue} />
</FieldsProvider>;
```

- **Localized fields** (`localized: true`) render the field of their type for each locale of the provider, at `title.fr`, `title.en`.
- **Groups and repeaters** render their nested fields with `NestedField`, at paths like `blocks.2.body`. A `binding` in `FieldsProvider` can bind every nested field to a store by path: `@panneau/forms` binds them to its form state. Without one, the group or repeater sets its whole value.
- **Relations** search a `RelationSource`. `createRelationSource()` makes one from any adapter with a `list()` method, such as the `DataAdapter` of `@panneau/data`. Labels come from the resource's `itemTitle`. Without a source, a relation field shows its references, read-only.
- **Plugin slot:** a type without an entry, such as `richtext` and `media` until Phase 2, renders a placeholder that names it. A plugin that provides the type replaces it.

## Messages

Strings go through react-intl, with English defaults. Add the messages of every Panneau package to the app's with `withPanneauMessages()` from [`@panneau/intl`](../intl), or use `fieldsPlugin`, which carries the French messages of every package (`ui`, `fields` and `forms`).

The package layout, scripts and API reports are explained in [`docs/packages.md`](../../docs/packages.md).
