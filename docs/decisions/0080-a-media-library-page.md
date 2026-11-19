# 0080: A media library page, the picker's library outside a dialog

- Status: accepted
- Date: 2026-11-17
- Issue: [#295](https://github.com/folkloreinc/panneau-js/issues/295)
- Amends: [0027](0027-media-picker.md), which made the picker a dialog only

## Context

The media picker ([0027](0027-media-picker.md)) browses libraries: search, the type filter, sorts and filters, infinite scroll, the details of a media, which edit its fields, and uploads. Its pieces were internal to `MediaPicker`, a dialog that picks.

A product also needs the library on its own: the page of its media, to browse, find, upload and edit them, with nothing to pick. Building that page again from `ListView` would give two experiences that look alike and differ: other cards, another search, other details.

## Decision

- **`MediaLibrary`** (`@panneau/media/picker`) is the library of the picker in a page. It takes the same options as the picker's library (`MediaLibraryOptions`): `sources`, `source`, `accept`, `maxSize`, `filter`, `filters`, `sorts`, `sort`, `stateKey`, `uploadSource` and `refreshInterval`.
    - It has the switcher of the libraries, the Library and Upload tabs, the toolbar, the grid and the details. It has no footer, no count and no button: choosing a media opens its details, and an upload shows the media it made.
    - Its grid scrolls with the page: the infinite scroll watches the viewport, and the details stay in view beside the grid (`position: sticky`). On a phone, the details take the place of the grid, as in the picker.
    - It is a `section`, named by `aria-label`, or by the library shown.
- **One implementation.** `useMediaLibrary()` is the library: the sources and their query, the selection, the details, the uploads, the media being processed and the infinite scroll. `MediaPicker` puts it in a dialog that picks, with its selection, its footer and its button; `MediaLibrary` puts it in a page. The hook is internal: the public API is the two components.
- `MediaPickerProps` extends `MediaLibraryOptions` with what picking adds: `isOpen`, `onOpenChange`, `multiple`, `value`, `title`, `confirmLabel`, `confirmOnUpload` and `onSelect`. The picker's API doesn't change.

## Consequences

- A product shows its media library with the components of its picker: the same cards, search, filters, details and uploads in both places, on its own `MediaSource`.
- A change to the picker's library changes the page too, and the stories and tests of both cover it.
- Actions on several media (delete, move to another library) are not part of this decision: the library page has no selection yet.
