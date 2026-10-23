# @panneau/fields

Controlled field components for the protocol's built-in field types, built on [`@panneau/ui`](../ui). They work without a definition, a router or a network: a product can use them directly in its own screens.

```bash
npm install @panneau/fields@^5.0.0-alpha.0 @panneau/ui@^5.0.0-alpha.0 react-aria-components react-intl
npm install @uppy/core@^6.3.0 @uppy/aws-s3@^6.3.0   # only for @panneau/fields/uppy
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

| Import                      | Components                                   | Value                                                               |
| --------------------------- | -------------------------------------------- | ------------------------------------------------------------------- |
| `@panneau/fields/text`      | `TextField`                                  | `string`                                                            |
| `@panneau/fields/textarea`  | `TextAreaField`                              | `string`                                                            |
| `@panneau/fields/number`    | `NumberField`                                | `number`                                                            |
| `@panneau/fields/boolean`   | `BooleanField` (checkbox, switch)            | `boolean`                                                           |
| `@panneau/fields/date`      | `DateField`                                  | `'2026-10-15'`                                                      |
| `@panneau/fields/datetime`  | `DateTimeField`                              | `'2026-10-15T13:30:00Z'`, or without an offset                      |
| `@panneau/fields/time`      | `TimeField`                                  | `'09:30'`                                                           |
| `@panneau/fields/select`    | `SelectField` (dropdown, radios, checkboxes) | an option's value, or a list with `multiple`                        |
| `@panneau/fields/email`     | `EmailField`                                 | `string`                                                            |
| `@panneau/fields/url`       | `UrlField`                                   | `string`, with `https://` added on blur                             |
| `@panneau/fields/color`     | `ColorField`                                 | `'#1d4ed8'`                                                         |
| `@panneau/fields/slug`      | `SlugField`, `slugify()`, `sourceText()`     | `string`, following a `source` until edited, checked with `onCheck` |
| `@panneau/fields/tel`       | `TelField`                                   | `string`, as typed                                                  |
| `@panneau/fields/range`     | `RangeField` (a slider)                      | `number`, `null` until moved                                        |
| `@panneau/fields/duration`  | `DurationField`, `formatDuration()`          | seconds, typed in hours, minutes and seconds                        |
| `@panneau/fields/json`      | `JsonField`, `parseJson()`                   | an object or an array; the text while it doesn't parse              |
| `@panneau/fields/tags`      | `TagsField`                                  | a list of strings, free or among suggestions                        |
| `@panneau/fields/embed`     | `EmbedField`                                 | `{ url, title, thumbnailUrl, … }`, from the backend (below)         |
| `@panneau/fields/location`  | `LocationField`, `createNominatimSource()`   | `{ lat, lng, address }`, on a map (below)                           |
| `@panneau/fields/localized` | `LocalizedField`                             | `{ fr: …, en: … }`                                                  |
| `@panneau/fields/group`     | `GroupField`                                 | an object                                                           |
| `@panneau/fields/repeater`  | `RepeaterField` (items or typed blocks)      | a list of objects; blocks have a `type`                             |
| `@panneau/fields/relation`  | `RelationField`, `createRelationSource()`    | `{ id, label }`, or a list with `multiple`                          |
| `@panneau/fields/file`      | `FileField`                                  | a file, or a list with `multiple` (below)                           |
| `@panneau/fields/uppy`      | `createUppyUploadSource()`                   | the upload source on Uppy 6 (below)                                 |
| `@panneau/fields/locales`   | `en`, `fr`                                   | deprecated: use `@panneau/intl`                                     |

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
    - **Plain ids.** Values can be ids (`"12"`, `["12", "13"]`), as a product's own API gives them. The field shows their labels once the source's optional `resolve(resource, ids)` gives them (`createRelationSource()` implements it with the adapter's `get()`), and their ids until then. Fields that show the same ids share one request. `useRelationReferences()` does the same for other components.
    - **Creating from the picker.** When the source has `create(resource, text)`, the picker offers "Create “…”" for a text that matches no item, and adds the new item. `createRelationSource(adapter, { create: true })` creates it with the adapter's `create()`, with the text as its `itemTitle` (in every locale when it is localized), on the resources that allow `create`; a function gives other values. A field's `onCreate` prop replaces the source's, and can open a dialog with a full form: it resolves with the new reference, or `null`. `onCreate={null}` turns creating off.
- **Files** upload through the `uploadSource` of the provider (below). Without one, the value holds the files themselves.
- **Plugin slot:** a type without an entry, such as `richtext` and `media` without their plugins (`@panneau/editor`, `@panneau/media`), renders a placeholder that names it. A plugin that provides the type replaces it.

## Files and uploads

`FileField` (the `file` type) holds files that belong to an item, outside the media library: an attachment, a PDF, a CSV ([decision 0025](../../docs/decisions/0025-presigned-uploads.md)). Its value is a file, or a list of them with `multiple`:

- a **stored file**, `{ name, url, mime, size }`, as items give it: the field shows it with a link;
- an **uploaded file**, `{ upload, name, mime, size }`, once the browser sent the file to storage: requests send its `upload`;
- the **`File` itself**, without an upload source: the adapter sends it in `multipart/form-data`.

A new file replaces the file of a single value, and is added to a multiple one. `accept` and `maxSize` (from the field's `accept`, its `accept` rule and its `maxSize` rule) refuse files before they are sent. A read-only field only shows its files.

**Upload sources.** An `UploadSource` makes an uploader for each field, which reports each file's progress and gives its upload once it is done. `createUppyUploadSource()` of `@panneau/fields/uppy` makes one on Uppy 6: files go to S3-compatible storage with URLs that the backend signs, in parts when they are large (they can pause and resume), and each upload is completed with the backend. `@uppy/core` and `@uppy/aws-s3` 6 are optional peer dependencies, only for that entry point: nothing else in the package imports Uppy. Make the source once, and pass it as `uploadSource` to `FieldsProvider`, or to `FormView` of `@panneau/forms`, when the definition announces direct uploads:

```tsx
import { createUppyUploadSource } from '@panneau/fields/uppy';

const uploadSource =
    definition.uploads?.mode === 'presigned' && adapter.presignedUploads !== undefined
        ? createUppyUploadSource(
              adapter.presignedUploads({ endpoint: definition.uploads.endpoint }),
          )
        : null;

<FieldsProvider components={builtInFields} uploadSource={uploadSource}>
    …
</FieldsProvider>;
```

`adapter.presignedUploads()` comes from `@panneau/data`; `createUppyUploadSource()` only needs an object with its `signRequest()` and `complete()` (`PresignedUploadsLike`), so fields don't depend on `@panneau/data`. A field's `uploadSource` prop overrides the provider's, and `null` turns uploads off.

**Building blocks.** `@panneau/fields` also exports what the file field is made of, for other fields that take files (the media field of `@panneau/media`): `useUploads()` (checks files, uploads them through a source, and gives their state), `UploadList` (a progress bar per file, with pause, resume, cancel and retry), `FilePicker` (a button and a drop zone), and `formatSize()`, `matchesMime()`, `getAccept()`, `getMaxSize()`.

## Messages

Strings go through react-intl, with English defaults. Add the messages of every Panneau package to the app's with `withPanneauMessages()` from [`@panneau/intl`](../intl), or use `fieldsPlugin`, which carries the French messages of every package (`ui`, `fields` and `forms`).

The package layout, scripts and API reports are explained in [`docs/packages.md`](../../docs/packages.md).

## Checking a value

A field with `check` in the definition, such as a `slug`, checks its value with the backend as it is typed ([decision 0032](../../docs/decisions/0032-field-checks-and-slugs.md)). The slug field then shows the URL the backend gives, says when the slug is taken with a free one to use, and is read-only when the backend says the field doesn't apply to the item. Give forms a check source for the item they edit:

```tsx
import { createFieldCheckSource } from '@panneau/fields';

<FormView form={form} checkSource={createFieldCheckSource(adapter, 'pages', item?.id ?? null)} />;
```

Without one, fields don't check, and the slug shows its fixed `settings.prefix`.

## Embeds and places

An `embed` field shows the title and the thumbnail of a URL's video, sound or post. It gets them from the backend (`GET /embeds`), through the embed source of the provider; without one, it keeps the URL alone:

```tsx
import { createEmbedSource } from '@panneau/fields';

<FieldsProvider embedSource={createEmbedSource(adapter)}>…</FieldsProvider>;
```

A `location` field places a point on a Leaflet map, loaded when the field is first shown. The tiles are OpenStreetMap's by default. `maps` sets other tiles and an address search, a `GeocodingSource`: `createNominatimSource()` searches OpenStreetMap's Nominatim, whose [usage policy](https://operations.osmfoundation.org/policies/nominatim/) suits small volumes; a product with more uses its own service. Without a geocoding source, the field has no address search, and the latitude and longitude are typed or picked on the map.

```tsx
import { createNominatimSource } from '@panneau/fields';

<FieldsProvider
    maps={{
        tiles: { url: 'https://tiles.example.com/{z}/{x}/{y}.png', attribution: '© Example' },
        geocoding: createNominatimSource({ email: 'dev@example.com', countryCodes: ['ca'] }),
    }}
>
    …
</FieldsProvider>;
```

`<Panneau>` and `createPanneauApp()` give the embed source of their adapter, and take `maps`.
