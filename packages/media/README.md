# @panneau/media

The media of Panneau: the media field, which references media of a library, makes media of uploads and follows their processing. The media picker and the library come here too.

```bash
npm install @panneau/media@^5.0.0-alpha.0 @tanstack/react-query react-aria-components react-intl
```

| Export           | Content                                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `@panneau/media` | `MediaField`, `MediaFieldEntry`, `mediaPlugin`, `getLibrary()`, `toMediaReference()`, `toMediaReferences()`, `isProcessing()` |

## The media field

`MediaField` (the `media` type) references media of a library: a resource of kind `media` ([decision 0026](../../docs/decisions/0026-media-libraries.md)). Its value is a reference, `{ id, resource, label, media, transform }`, or a list of them. A file chosen or dropped becomes a media of the library through the adapter (`create(resource, { file })` of `@panneau/data`): sent to storage first when there is an upload source, then made a media from its upload (`{ upload }`), or sent in `multipart/form-data` without one. The field shows each media with its thumbnail and its status (`pending`, `processing`, `failed`), and reads it again (`get()`) until its file is processed.

- `resource` is the library the field uploads to. A `media` field can allow several libraries ([decision 0027](../../docs/decisions/0027-media-picker.md)): `MediaFieldEntry` uploads to the first one (`getLibrary()`: the field's `resource`, the first it lists, or the first library of the definition), with its `itemTitle` for the labels. The references the field makes carry their library (`resource`), and it reads each media in its own library. Without a library, the field shows its media and can't add any.

- `adapter` defaults to the adapter of `DataAdapterProvider` (`useOptionalDataAdapter()` of `@panneau/data/query`). Without one, the field is read-only, and says so.
- `uploadSource` defaults to the one of the fields context (`FieldsProvider`, or `FormView` of `@panneau/forms`). The upload core, the file field and the Uppy source are in [`@panneau/fields`](../fields): this package doesn't import Uppy.
- `accept` and `maxSize` (the field's `accept`, its `accept` rule and its `maxSize` rule) refuse files before they are sent.

```tsx
import { FieldsProvider, builtInFields } from '@panneau/fields';
import { createUppyUploadSource } from '@panneau/fields/uppy';
import { mediaPlugin } from '@panneau/media';

const uploadSource =
    definition.uploads?.mode === 'presigned' && adapter.presignedUploads !== undefined
        ? createUppyUploadSource(
              adapter.presignedUploads({ endpoint: definition.uploads.endpoint }),
          )
        : null;

<DataAdapterProvider adapter={adapter}>
    <FieldsProvider
        components={{ ...builtInFields, ...mediaPlugin.fields }}
        uploadSource={uploadSource}
    >
        …
    </FieldsProvider>
</DataAdapterProvider>;
```

`mediaPlugin` gives the `media` type to `@panneau/core`: pass it after `fieldsPlugin`. The `file` type is built into `@panneau/fields`.

The package layout, scripts and API reports are explained in [`docs/packages.md`](../../docs/packages.md).
