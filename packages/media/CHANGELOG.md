# @panneau/media

## 5.0.0-alpha.8

### Patch Changes

- 83c82d4: The declaration files work in TypeScript projects on `"module": "NodeNext"`. Their relative specifiers now name their file (`./schemas/index.js`, `./rest.js`), so the types that an entry point re-exports, such as `Definition` of `@panneau/protocol`, are no longer missing under Node's resolution, and the CSS Modules that some declarations imported are declared in place. Nothing changes for projects on the `Bundler` resolution.
- Updated dependencies [6e76c06]
- Updated dependencies [83c82d4]
- Updated dependencies [477d974]
  - @panneau/ui@5.0.0-alpha.8
  - @panneau/core@5.0.0-alpha.8
  - @panneau/data@5.0.0-alpha.8
  - @panneau/fields@5.0.0-alpha.8
  - @panneau/intl@5.0.0-alpha.8
  - @panneau/protocol@5.0.0-alpha.8

## 5.0.0-alpha.7

### Minor Changes

- fb534de: Skeletons instead of spinners while content loads (#121, decision 0034), drawn by the components themselves, so a product that uses them without the app gets them too:
  
  - `ListView`: while `items` is `undefined`, rows of its columns in its layout, as many as the page size, up to 10.
  - `ItemDetails`: `item` can be `undefined` while it loads, for the labels with a skeleton of each value.
  - `Form` and `FormView`: `isLoading` draws the layout of the form, and for each field its label and a block of its height, from its type. The app's edit page uses it while the item loads.
  - The media picker draws its cards with `Skeleton`, and its own skeleton CSS is gone.
  - The app: the item panel draws its title, actions and details, the preview a block in its frame, and the boot the shell with its sidebar and a page header, instead of a centered spinner.
  - New messages, in English and French: `lists.loading`, `lists.loadingItem`, `forms.loading`, `app.previewLoading`.

### Patch Changes

- 9c6c087: Every component is memoized by the React Compiler again. The packages were built with Babel 8, on which React Compiler 1.0 skips any component with a default value in its props (`Fieldset`, `Text`, `TextInput` and most others), so they shipped without memoization. The build is back on Babel 7, and the components the compiler still skipped (`Panneau`, `FormView`, `ListView`, `Select`, the file, location, embed, slug and relation fields, `MediaField`, `MediaPicker` and `ImageEditor`) are rewritten so that it compiles them. Nothing changes in their behavior.
- Updated dependencies [9c6c087]
- Updated dependencies [060e0de]
- Updated dependencies [fb534de]
- Updated dependencies [fb534de]
  - @panneau/fields@5.0.0-alpha.7
  - @panneau/ui@5.0.0-alpha.7
  - @panneau/protocol@5.0.0-alpha.7
  - @panneau/intl@5.0.0-alpha.7
  - @panneau/core@5.0.0-alpha.7
  - @panneau/data@5.0.0-alpha.7

## 5.0.0-alpha.6

### Minor Changes

- 48676ff: A media says why its processing failed (#84): the `media` block of a library item gets an optional `error`, `{ code, message }`, when its `status` is `failed`. The `media` and `image` fields show the message under "Processing failed", and the media picker gives it as the reason a media can't be picked (`statusFailedBecause`, in English and French).

### Patch Changes

- Updated dependencies [75a6496]
- Updated dependencies [48676ff]
- Updated dependencies [75a6496]
- Updated dependencies [4e453d2]
- Updated dependencies [75a6496]
  - @panneau/protocol@5.0.0-alpha.6
  - @panneau/data@5.0.0-alpha.6
  - @panneau/fields@5.0.0-alpha.6
  - @panneau/intl@5.0.0-alpha.6
  - @panneau/core@5.0.0-alpha.6
  - @panneau/ui@5.0.0-alpha.6

## 5.0.0-alpha.5

### Minor Changes

- eadfc08: `@panneau/media/editor`: the image editor (decision 0031). It edits a transform of an image, with the image as it will be rendered. `ImageEditor` fits in a page or a panel, and lays itself out for its own width. `ImageEditorDialog` opens it in a large dialog, and a full-screen sheet on phones.
  
  - **Tools:** crop (a frame with handles and thirds, ratios, and numbers), rotate (with flips) and focal point (with the automatic crops it gives), from `useImageEditorTools()`. A product adds its own, with a panel, an overlay and a `validate()`.
  - **The keyboard** moves and resizes the crop frame, and moves the focal point.
  - **The field's rules:** offered or enforced `ratios`, and a required crop, which the editor proposes around the focal point.
  - **The base of a transform for one use:** over the media's own transform by default, with `base` and `baseTransform`, or from the original file. When the media's transform changed, the crop is moved inside the new version, and the editor says so.
  
  The entry point loads neither `@panneau/data` nor `@panneau/core`. Its messages are in `@panneau/intl`, in English and French.
- f2c79b5: The `image` field (decision 0031). `ImageField` is a `media` field for images, with the image editor:
  
  - **Preview:** each image shows as it is rendered for this use, computed in the browser.
  - **Edit** opens the editor on its transform.
  - **Badges** say whether it is cropped, needs a crop, or was cropped over a version of the library that changed.
  - **Options:** `ratios` (offered or enforced), `cropRequired`, `rotate`, `focalPoint` and `transformBase`, shown next to the description.
  - **After a pick:** when a crop is required, the editor is the step right after the pick of one image.
  
  `mediaPlugin` now gives the `image` type too, and `MediaFieldEntry` reads its options and its `crop` rule (`getImageOptions()`). `MediaField` takes them as `image`. The image editor and the field share how an image is drawn. The mockups of the editor and the field are deleted.
- 8372b27: A `media` field can allow several libraries (decision 0027). Its `resource` takes a list of library ids, and without one it allows every library of the definition, instead of being an error when there are several. `MediaReference` gets `resource`, its library: ids are unique only within their library, so a field that allows several needs it in requests, and the mock backend refuses a media without it. `getMediaLibraries(definition, field)` (in `@panneau/protocol/runtime`) gives the libraries a field allows. `lintDefinition()` checks each listed id, and that a `relation` field names one resource. `getLibrary()` of `@panneau/media` takes a list too, and gives the first library: the field uploads to it, the references it makes carry their library, and it reads each media in its own library. The `relation` field ignores a list in `resource`.
- 199a687: The `media` field opens the media picker: "Choose media" ("Add media" with `multiple`) browses the libraries given as `sources`, and the media picked replaces the field's media, or is added to its list. `MediaFieldEntry` gives the sources of every library the field allows, through the adapter of `DataAdapterProvider`. With the picker, the upload button reads "Upload a file" ("Upload files"). A media is now removed by its library and id, so that two libraries can have media with the same id. New messages in `@panneau/intl`: `chooseMedia`, `addMedia`, `uploadFile` and `uploadFiles`.
- fb33783: New `@panneau/media/picker` entry point (decision 0027): `MediaPicker`, a dialog to browse media libraries, upload to them and pick one media, or several with `multiple`, on `MediaSource`s that Panneau or a product implements. It has search, a type filter, sorts, the filters of the sources and of the opener (the opener's `filter` is locked), infinite scroll that keeps its place (across openings with `stateKey`), a selection across libraries, `accept` and `maxSize` that grey out what doesn't match, details that edit the fields of a media with `update()` and ask before losing changes, an Upload tab whose files become media of the library shown and are selected (`confirmOnUpload` confirms a single one at once), and follows media being processed. It returns references with their library. The entry point loads neither `@panneau/data` nor `@panneau/core`. `createResourceMediaSource(adapter, library)`, in `@panneau/media`, gives the source of a library resource. `@panneau/intl` gets the picker's messages, in English and French.

### Patch Changes

- Updated dependencies [3830b4f]
- Updated dependencies [bdb1173]
- Updated dependencies [88a3d09]
- Updated dependencies [b86f35e]
- Updated dependencies [eadfc08]
- Updated dependencies [f2c79b5]
- Updated dependencies [81ec6b2]
- Updated dependencies [6d1f1d8]
- Updated dependencies [6d1f1d8]
- Updated dependencies [8372b27]
- Updated dependencies [199a687]
- Updated dependencies [fb33783]
- Updated dependencies [5779047]
- Updated dependencies [5b9aa44]
- Updated dependencies [5b2f3ce]
  - @panneau/core@5.0.0-alpha.5
  - @panneau/intl@5.0.0-alpha.5
  - @panneau/protocol@5.0.0-alpha.5
  - @panneau/data@5.0.0-alpha.5
  - @panneau/fields@5.0.0-alpha.5
  - @panneau/ui@5.0.0-alpha.5

## 5.0.0-alpha.4

### Minor Changes

- 3974fb5: Add `@panneau/media`, with the media field: `MediaField` and `mediaPlugin` (the `media` type). A file becomes a media through the adapter of `@panneau/data`, uploaded first through the upload source of the fields context when there is one, and the field follows its ingest (`status`) until it is ready or failed.
- b9852a0: Media libraries are resources (decision 0026). A resource of kind `media` (`Resource.kind`) has a `file` field and gives each item a read-only `media` (`MediaInfo`: type, mime, size, URLs, renditions, dimensions, duration, status). Every media operation is a resource operation: `POST /resources/{library}` with `{ file: { upload } }` makes a media, and the `/media` endpoints are removed, with the `Media`, `MediaResponse` and `MediaListResponse` schemas and the media methods of `DataAdapter` (`listMedia`, `getMedia`, `uploadMedia`, `updateMedia`, `deleteMedia`). A `media` field references media of a library (its `resource`, optional with a single library): its value is a `MediaReference` (`{ id, label, media, transform }`), and requests send ids or `{ id, transform }`. `lintDefinition()` checks both. The mock backend serves libraries. `MediaField` takes a `resource` and makes media with `create()` and reads them with `get()`; `isMedia()` and `toMedia()` become `toMediaReference()` and `toMediaReferences()`, with `getLibrary()`.

### Patch Changes

- Updated dependencies [b9852a0]
- Updated dependencies [ecc77a6]
- Updated dependencies [db1f253]
- Updated dependencies [3974fb5]
- Updated dependencies [3974fb5]
- Updated dependencies [3974fb5]
  - @panneau/protocol@5.0.0-alpha.4
  - @panneau/data@5.0.0-alpha.4
  - @panneau/intl@5.0.0-alpha.4
  - @panneau/fields@5.0.0-alpha.4
  - @panneau/core@5.0.0-alpha.4
  - @panneau/ui@5.0.0-alpha.4
