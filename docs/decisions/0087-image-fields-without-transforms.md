# 0087: Image fields without transforms

- Status: accepted
- Date: 2026-11-17
- Issue: [#319](https://github.com/folkloreinc/panneau-js/issues/319)
- Amends: [0031](0031-image-editor-and-image-field.md), for the fields whose values keep no transform
- Part of: [#6](https://github.com/folkloreinc/panneau-js/issues/6), Phase 3 (fields)

## Context

[0031](0031-image-editor-and-image-field.md) gave every `image` field the image editor: each image has an Edit action, and the transform it makes is kept in the field's value, for this use.

Not every backend keeps it. A site whose pages render images through its own filters (sizes, crops of its templates), or whose values are only ids of media, can't render a transform for one use. `laravel-panneau` already has the switch, `transforms(false)` on a media field: its repository receives ids only, and transforms are ignored. But the definition doesn't say it, so the client still offers Edit: the user crops an image, saves, the backend answers `200` and drops the crop without a word.

The choice belongs to each field, not to the site: one site can keep crops for the cover of its articles, and not for the images of its galleries.

## Decision

- **A field says whether its values keep transforms: `transforms`.** It is `true` by default, as before. It takes the name of the backend's switch.

    ```jsonc
    { "name": "gallery", "type": "image", "multiple": true, "transforms": false }
    ```

- **With `"transforms": false`, the backend keeps no transform** for this use: it ignores the `transform` of the values it receives, and items give none.
- **An `image` field with `"transforms": false` has no editor.**
    - Its images have no Edit action, and a pick is never followed by the crop step.
    - It still shows each image large, as the media is, with its library's own transform, and its name and size.
    - It sends no `transform`, even one that a value received before.
    - `ratios`, `rotate`, `focalPoint` and `transformBase` configure the editor: they do nothing. Its suggested ratios aren't shown.
- **A field without transforms can't have the `crop` rule, nor `ratios`.** Both ask for crops that the backend wouldn't keep. `lintDefinition()` reports them, and `laravel-panneau` throws when a field combines them.
- **A `media` field can say it too.** It has no editor, so nothing changes in its form, but clients send no `transform` for it.

## Consequences

- **`@panneau/protocol`:** `transforms` on fields, in the types, the JSON Schema and `docs/protocol.md`; `lintDefinition()` reports the `crop` rule and `ratios` next to `"transforms": false`.
- **`@panneau/media`:** `ImageOptions` and `ImageField` take `transforms`, which `getImageOptions()` reads from the field. Without transforms, the field has no Edit action, no editor, no crop step and no constraints, and drops the `transform` of the values it sends.
- **`laravel-panneau`:** `transforms(false)` writes `"transforms": false` in the definition of the field. `crop()` and `ratios()` throw a `LogicException` next to it, in either order. `rotate()`, `focalPoint()` and `transformBase()` are left out of the definition.
- Definitions without `transforms` don't change.
