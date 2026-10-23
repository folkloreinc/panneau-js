# @panneau/media

The media of Panneau: the media field, which references media of a library, makes media of uploads and follows their processing, the media picker, which browses libraries and uploads to them, and the image editor, which crops, turns and sets the focal point of an image.

```bash
npm install @panneau/media@^5.0.0-alpha.0 @tanstack/react-query react-aria-components react-intl
```

| Export                  | Content                                                                                                                                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@panneau/media`        | `MediaField`, `ImageField`, `MediaFieldEntry`, `mediaPlugin`, `getImageOptions()`, `createResourceMediaSource()`, `getLibrary()`, `toMediaReference()`, `toMediaReferences()`, `isProcessing()` |
| `@panneau/media/picker` | `MediaPicker`, and the types of its sources: `MediaSource`, `MediaQuery`, `MediaPage`, `PickerMedia`, `MediaSort`                                                                               |
| `@panneau/media/editor` | `ImageEditor`, `useImageEditorTools()`, and the types of the editor and its tools: `EditedImage`, `ImageEditorTool`, `ImageEditorToolContext`                                                   |

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

## The image editor

`ImageEditor` (`@panneau/media/editor`, [decision 0031](../../docs/decisions/0031-image-editor-and-image-field.md)) edits a transform of an image (the protocol's `MediaTransform`) in a dialog: the image as it will be rendered, the overlay of a tool over it, the tool's options on the side, and the result. This entry point only imports `@panneau/ui`, `@panneau/intl` and the runtime of `@panneau/protocol`.

- **Tools.** Crop (a frame with handles and thirds, ratios, and numbers), rotate (with flips) and focal point (with the automatic crops it gives), from `useImageEditorTools()`. A product adds its own: a panel, an overlay drawn in the coordinates of the view, and a `validate()` that says why the edits can't be applied yet. Tools can add their own keys to the transform.
- **Keyboard.** The crop frame and the focal point can be focused: arrow keys move them, and Shift + arrow keys resize the frame.
- **The field's rules.** `ratios` are offered, or enforced with `enforceRatios`. With `cropRequired`, the editor proposes the largest crop of the first ratio around the focal point, or waits for a crop.
- **The base of a transform for one use.** When the image has its own transform (`mediaTransform`, from its library), the edits apply over it by default, and the editor returns `{ base: "media", baseTransform, … }`. From the original file, it returns the edits alone. `canChooseBase` lets the user choose. When the media's transform is no longer the `baseTransform` of the value, the editor moves the crop inside the new version and says so.
- It returns null when there is nothing to apply. On phones, it is a full-screen sheet. `--panneau-image-editor-stage` and `--panneau-image-editor-stage-pattern` set the colors of the stage, which stays dark.

```tsx
import { ImageEditor, useImageEditorTools } from '@panneau/media/editor';

const tools = useImageEditorTools();

<ImageEditor
    isOpen={isOpen}
    onOpenChange={setOpen}
    image={{ label: 'Cover', url, width: 4000, height: 3000, mediaTransform: media.transform }}
    value={reference.transform ?? null}
    tools={[tools.crop, tools.focalPoint]}
    ratios={['16:9', '1:1']}
    enforceRatios
    cropRequired
    onApply={(transform) => onChange({ ...reference, transform })}
/>;
```

## The image field

`ImageField` (the `image` type, [decision 0031](../../docs/decisions/0031-image-editor-and-image-field.md)) is a `media` field for images, with the image editor. Its value, libraries, picker and uploads are those of `MediaField`, and it accepts `image/*` by default.

- Each image shows as it is rendered for this use, computed in the browser from the original, the media's own transform and the transform for this use. Edit opens the editor on that transform.
- Badges say whether an image is cropped for this use, needs a crop the field requires, or was cropped over a version of the library that changed since.
- **Options:** `ratios`, offered or enforced with `enforceRatios`; `cropRequired`; `rotate` and `focalPoint`, which offer those tools; and `transformBase` (`media`, `original` or `choose`). They show next to the description.
- When a crop is required, the editor is the step right after the pick of one image ("Next: crop", then "Use this crop"), with "Back to the library". It doesn't open after an upload.
- `MediaFieldEntry` renders the `image` type with `getImageOptions()`: the field's `crop` rule (enforced ratios, a required crop), its suggested `ratios`, `rotate`, `focalPoint` and `transformBase`.

`mediaPlugin` gives the `media` and `image` types to `@panneau/core`: pass it after `fieldsPlugin`. The `file` type is built into `@panneau/fields`.

The package layout, scripts and API reports are explained in [`docs/packages.md`](../../docs/packages.md).
