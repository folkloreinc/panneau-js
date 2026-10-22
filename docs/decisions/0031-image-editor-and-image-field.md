# 0031: An image editor with tools, and an `image` field

- Status: accepted
- Date: 2026-10-22
- Issue: [#100](https://github.com/folkloreinc/panneau-js/issues/100)
- Amends: [0010](0010-media.md), for the base of a transform for one use
- Mockups: [#102](https://github.com/folkloreinc/panneau-js/pull/102), in `mockups/image-editor/`, with their screenshots in [`docs/mockups/image-editor/`](../mockups/image-editor/) and [`docs/mockups/image-field/`](../mockups/image-field/)

## Context

[0010](0010-media.md) made image editing non-destructive: crop, rotation, flip and focal point are a `transform` on the media, or on the field value when the edit is for one use. The protocol has its shape (`MediaTransform`), and `laravel-panneau` validates it, but nothing in Panneau edits it. [0027](0027-media-picker.md) left "crop and transform for one use" to the `media` field's flow.

Two cases need more than the shape:

- **A required crop.** A cover must be 16:9 or 1:1, and every image needs one.
- **A media that its library already edits.** A photo stored sideways is turned upright once in the library. Then, a crop for one use can apply over the library's version, or start from the original file.

The UX was agreed on mockups, in #102.

## Decision

- **An image editor in `@panneau/media`.** It has its own entry point which, like the picker's, loads neither `@panneau/data` nor `@panneau/core`, so a product can use it on its own. It takes an image (URL, width, height, and the media's own transform) and a transform, and returns the new transform.
    - **The image is shown as it will be rendered,** rotated and flipped. The editor converts between that view and the pixels of the protocol.
    - **Tools.** Crop, rotate (with flips) and focal point are the first ones. A tool has a panel of options, can draw over the image, and can say why the transform can't be applied yet (`validate`). A product can add its own tools.
    - **Crop:** a frame with handles and thirds, ratios, and numeric inputs (X, Y, width, height). A crop with a fixed ratio is fitted again to that ratio when the image is rotated.
    - **Focal point:** it shows the automatic crops it gives.
    - **Keyboard:** the crop frame and the focal point can be focused. Arrow keys move them, and Shift + arrow keys resize the frame.
    - **Layout:** a large dialog, and a full-screen sheet on phones, with the image on top and the tools under it. It is built only from `@panneau/ui` and the `--panneau-*` tokens.
- **An `image` field, which extends the `media` field.** It is a `media` field for images, with the editor, and not a second system.
    - Its value is a `MediaReference`, as for `media`. It uses the same libraries (one, a list, or every library), the same picker and the same uploads.
    - It accepts `image/*` by default.
    - Each image has an Edit action, which opens the editor for this use.
    - The field shows the image as rendered, computed in the browser from the original and the transforms.
    - When the field requires a crop, the editor opens as the step right after a pick in the picker, with "Back to the library". It doesn't open after an upload.
    - Its options are:
        - `ratios`, the ratios the editor suggests;
        - `rotate` and `focalPoint`, which offer those tools (true by default);
        - `transformBase` (see below).
- **Constraints are a portable rule, `crop`,** which the backend checks:

    ```json
    { "rule": "crop", "value": { "ratios": ["16:9", "1:1"], "required": true } }
    ```

    - `ratios`: a crop must have one of them. A crop has a ratio when its height is within one pixel of its width divided by the ratio, since crops are in whole pixels.
    - `required`: each image needs a crop for this use. The editor proposes one: the largest crop of the first ratio, around the focal point. Without ratios, the editor's Apply waits for a crop.
    - A missing required crop is an error of the field.

- **A transform for one use says its base.** This amends 0010.
    - **Without `base`,** the transform starts from the original file, as every transform does today.
    - **With `base: "media"`,** it applies over the media's own transform. Its crop is in pixels of the media's version.
    - **`baseTransform`** is the media's transform it was made on. When the media's transform is no longer the same, the field shows "Library version changed: check the crop" and Edit leads, without blocking the form, and the editor asks to check the crop. Meanwhile, renderers clamp the crop to the image.
    - **Who chooses.** The field's `transformBase` fixes the base (`media` or `original`), or lets the user choose it in the editor (`choose`). It defaults to `media`.
- **The media's own transform comes with it.** A reference's `media` (`MediaInfo`) carries `transform`: the media's own transform. The field needs it to draw the image as rendered, and to compare it with `baseTransform`.
- **Tools can add their own keys to a transform.** `MediaTransform` stays a loose object, and renderers ignore the keys they don't know.

## Consequences

- **`@panneau/protocol`:**
    - the `image` field type, with its options;
    - the `crop` rule;
    - `base` and `baseTransform` in `MediaTransform`;
    - `transform` in `MediaInfo`.

    `lintDefinition()` and `docs/protocol.md` follow.

- **`@panneau/media`:**
    - the editor's entry point and its tools;
    - the `image` field, registered next to `media`;
    - their messages, in `@panneau/intl`.
- **`laravel-panneau`:**
    - `Fields\Image extends Media`;
    - the `crop` rule;
    - `base` and `baseTransform` in `MediaTransform`;
    - the media's own transform in references.
- **`laravel-image`:** it applies a transform with `base: "media"` over the media's own transform, and clamps a crop that falls outside the image.
- **Not decided here:**
    - editing the media's own transform, from the picker's details or a library's pages;
    - a video's poster frame;
    - straightening by any angle, which the protocol doesn't have (only quarter turns).
- Once the editor and the field are built, their mockups are deleted.
