# 0027: A media picker on a source that products can implement

- Status: accepted
- Date: 2026-10-22
- Issue: [#91](https://github.com/folkloreinc/panneau-js/issues/91)
- Amends: [0026](0026-media-libraries.md), for a `media` field that allows several libraries
- Mockups: [#89](https://github.com/folkloreinc/panneau-js/pull/89), in `mockups/media-picker/` and [`docs/mockups/media-picker/`](../mockups/media-picker/)

## Context

[0026](0026-media-libraries.md) made media libraries resources of kind `media`, and announced "a media picker, to browse a library and upload to it, on a source that products such as Niche can also implement". Today the `media` field uploads new media, but it can't pick media that are already in a library.

The picker has two kinds of users:

- **Panneau's `media` field**, on libraries that are resources of the definition.
- **Products with their own API and UX** (Niche), which open it from their own screens, such as an editor that inserts an image. The picker must not constrain them: it has to be standalone and themeable, and read their media through their API.

Its UX was agreed on mockups, in #89: a modal with a Library tab (grid, search, filters, sorts, details) and an Upload tab, one or several libraries, light and dark, desktop and phone.

## Decision

- **The picker reads sources.** A `MediaSource` is one library, as the picker sees it:
    - `id` and `label`;
    - `accept` and `maxSize`;
    - `filters` and `sorts`;
    - `fields`: what the details can edit;
    - `canCreate`;
    - `list({ q, filter, sort, cursor })`, which gives a page of media and the cursor of the next one;
    - `get(id)`, to refresh media that are being processed;
    - `create(file)`, with an upload (`{ upload }`, [0025](0025-presigned-uploads.md)) or the file itself;
    - `update(id, values)`, for the fields edited in the details.

    The picker never calls an adapter itself.

- **Panneau's source is `createResourceMediaSource(adapter, library)`**, in `@panneau/media`. It reads a library resource:
    - `list()` sends `GET /resources/{library}` with `q`, `filter`, `sort`, and the page number as the cursor;
    - `create()` sends `POST` with `{ file: { upload } }`;
    - `update()` sends `PATCH`;
    - its filters and sorts are those of the resource's `list`;
    - its fields are those of the resource, except `file`, and none when the user can't update it;
    - `canCreate` is the resource's `create` ability.

    A product writes its own source on its API.

- **The picker is in `@panneau/media/picker`**, an entry point that only imports `@panneau/ui`, `@panneau/fields`, `@panneau/intl` and types of `@panneau/protocol`, so that a product doesn't load `@panneau/data` or `@panneau/core` to open it. The `media` field opens it with the sources of its libraries.
- **What the picker does:**
    - **Selection:** it returns one media, or several with `multiple`, each with the id of its source. A multiple selection can span libraries.
    - **Libraries:** the opener restricts the picker by giving only the sources it allows.
    - **Primary button:** its label is the opener's ("Select", "Insert", "Use 3 media"). It stays disabled until something valid is selected.
    - **`accept` and `maxSize`:** media that don't match are shown greyed out, with the reason. Media being processed (`pending`, `processing`) can be picked; a `failed` media can't.
    - **Filters:** the type filter, the source's filters, and the opener's: added (`filters`), or applied and shown locked (`filter`). Sorts work the same way (`sorts`, `sort`).
    - **Upload tab:** it uploads to the library shown, and selects the media it makes. With `confirmOnUpload` and a single media, it confirms as soon as that media exists.
    - **Details:** they edit the source's `fields`, with an explicit "Save". When the user selects another media with unsaved changes, the picker asks whether to save them or to discard them.
    - **Infinite scroll:** the picker keeps each source's query, loaded pages and scroll position while it is open, so going to the details, the Upload tab or another library and back returns to the same place. With a `stateKey`, it keeps them across openings.
    - **Layout:** a large dialog on desktop and a full-screen sheet on phones. The card size follows the density and a component token. It is built only from `@panneau/ui` and the `--panneau-*` tokens.
- **`@panneau/ui` gets what the picker needs**, as public components that other screens can use: a wider `Dialog` size (`xl`), a full-screen sheet on phones, a slot in the dialog's header, and a `SegmentedControl`.
- **A `media` field can allow several libraries.** This amends 0026:
    - its `resource` takes a list of library ids, in the order of the picker's switcher;
    - left out, it allows every library of the definition, instead of being an error when there are several;
    - ids are unique only within their resource, so a reference to a media of such a field carries its library: `{ id, resource }`, in values and in requests;
    - `lintDefinition()` checks that each id names a library.

## Consequences

- `@panneau/protocol`: `Field.resource` takes a list for `media` fields, `MediaReference` gets an optional `resource`, and `lintDefinition()` and `docs/protocol.md` follow. `laravel-panneau` resolves `{ id, resource }` in the libraries of the field.
- `@panneau/ui` gets `Dialog` options and `SegmentedControl` before the picker is built.
- `@panneau/media` gets the `./picker` entry point, `createResourceMediaSource()`, and a `media` field that opens the picker.
- Products implement `MediaSource` on their own API, and open the picker from their own screens with their own titles and buttons.
- Once the picker is built, its mockups are deleted.
- **Not decided here:** the crop and transform of an image for one use, in the `media` field's flow. That comes in a later decision.
