# @panneau/media

The media of Panneau: the media field, which makes media of uploads and follows their ingest. The media library comes here too.

```bash
npm install @panneau/media@^5.0.0-alpha.0 @tanstack/react-query react-aria-components react-intl
```

| Export           | Content                                                                  |
| ---------------- | ------------------------------------------------------------------------ |
| `@panneau/media` | `MediaField`, `MediaFieldEntry`, `mediaPlugin`, `isMedia()`, `toMedia()` |

## The media field

`MediaField` (the `media` type) holds media of the media library. A file chosen or dropped becomes a media through the adapter (`uploadMedia()` of `@panneau/data`): sent to storage first when there is an upload source, then made a media from its upload (`{ upload }`), or sent to `POST /media` in `multipart/form-data` without one. The field shows each media with its thumbnail and its status (`pending`, `processing`, `failed`), and reads a media again (`getMedia()`) until its ingest is done ([decision 0025](../../docs/decisions/0025-presigned-uploads.md)).

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
