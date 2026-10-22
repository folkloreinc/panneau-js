# @panneau/media

The media of Panneau: the media field, which references media of a library, makes media of uploads and follows their processing, and the media picker, which browses libraries and uploads to them.

```bash
npm install @panneau/media@^5.0.0-alpha.0 @tanstack/react-query react-aria-components react-intl
```

| Export                  | Content                                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@panneau/media`        | `MediaField`, `MediaFieldEntry`, `mediaPlugin`, `createResourceMediaSource()`, `getLibrary()`, `toMediaReference()`, `toMediaReferences()`, `isProcessing()` |
| `@panneau/media/picker` | `MediaPicker`, and the types of its sources: `MediaSource`, `MediaQuery`, `MediaPage`, `PickerMedia`, `MediaSort`                                            |

## The media field

`MediaField` (the `media` type) references media of libraries: resources of kind `media` ([decision 0026](../../docs/decisions/0026-media-libraries.md)). Its value is a reference, `{ id, resource, label, media, transform }`, or a list of them. "Choose media" ("Add media" with `multiple`) opens [the media picker](#the-media-picker) on its `sources`: the media picked replaces the field's media, or is added to its list once. A file chosen or dropped becomes a media of the library through the adapter (`create(resource, { file })` of `@panneau/data`): sent to storage first when there is an upload source, then made a media from its upload (`{ upload }`), or sent in `multipart/form-data` without one. The field shows each media with its thumbnail and its status (`pending`, `processing`, `failed`), and reads it again (`get()`) until its file is processed.

- `resource` is the library the field uploads to. A `media` field can allow several libraries ([decision 0027](../../docs/decisions/0027-media-picker.md)): `MediaFieldEntry` uploads to the first one (`getLibrary()`: the field's `resource`, the first it lists, or the first library of the definition), with its `itemTitle` for the labels. The references the field makes carry their library (`resource`), and it reads each media in its own library. Without a library, the field shows its media and can't add any.
- `sources` are the libraries the picker browses (`MediaSource`), and `stateKey` keeps what the user browsed between openings. Without sources, the field only uploads. `MediaFieldEntry` gives the sources of every library the field allows (`createResourceMediaSource()`, with the adapter of `DataAdapterProvider`), and a `stateKey` by libraries.

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

## The media picker

`MediaPicker` (`@panneau/media/picker`, [decision 0027](../../docs/decisions/0027-media-picker.md)) is a dialog to browse libraries, upload to them, and pick one media, or several with `multiple`. It reads `MediaSource`s, one per library, and returns references with their library (`{ id, resource, label, media }`). This entry point only imports `@panneau/ui`, `@panneau/fields`, `@panneau/intl` and the runtime of `@panneau/protocol`: a product opens the picker from its own screens without loading `@panneau/data` or `@panneau/core`.

- **Library tab:** search, the type filter, the sorts and filters of the source and of the opener, infinite scroll, and the details of the last media selected, which edit the source's `fields` with `update()`.
- **Upload tab:** files become media of the library shown (`create()`), and are selected. With `confirmOnUpload` and a single media, the picker confirms as soon as the media exists.
- **What the opener chooses:**
    - `sources`: the libraries;
    - `accept` and `maxSize`: media that don't match are greyed out, with the reason;
    - `filter`: filters the user can't change, shown as locked;
    - `filters` and `sorts`: more of them;
    - `value`: the current media;
    - `title` and `confirmLabel`;
    - `stateKey`: keeps the query, the pages and the scroll position of each library across openings.
- Media being processed can be picked, and are read again (`get()`) until they are ready. A media whose processing failed can't be picked.

`createResourceMediaSource(adapter, library)` gives the source of a library resource: `GET /resources/{library}` with `q`, `filter`, `sort` and the page as the cursor, `POST` from an upload, and `PATCH` for the details. A product implements `MediaSource` on its own API.

```tsx
import { createResourceMediaSource } from '@panneau/media';
import { MediaPicker } from '@panneau/media/picker';

const sources = definition.resources
    .filter((resource) => resource.kind === 'media')
    .map((library) => createResourceMediaSource(adapter, library));

<MediaPicker
    isOpen={isOpen}
    onOpenChange={setOpen}
    sources={sources}
    accept={['image/*']}
    confirmLabel="Insert"
    onSelect={([media]) => insertImage(media)}
/>;
```

`mediaPlugin` gives the `media` type to `@panneau/core`: pass it after `fieldsPlugin`. The `file` type is built into `@panneau/fields`.

The package layout, scripts and API reports are explained in [`docs/packages.md`](../../docs/packages.md).
