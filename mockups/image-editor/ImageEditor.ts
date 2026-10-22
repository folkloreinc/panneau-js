/**
 * A sketch of the API that the mockups suggest, for review: the image editor, its tools, and the
 * `image` field of the protocol. Nothing here is built or published.
 */
import type { ReactNode } from 'react';

import type { MediaReference, MediaTransform } from '@panneau/protocol';
import type { IconComponent } from '@panneau/ui';

/** What a transform for one use starts from (#100, answer 4). */
export type TransformBase =
    /** Over the media's own transform, from its library: a photo straightened there stays so. */
    | 'media'
    /** From the original file: the media's own transform doesn't apply. */
    | 'original';

/**
 * A transform for one use: the protocol's `MediaTransform`, which says its base (answer 2).
 *
 * - Without `base`, it starts from the original, as every transform does today.
 * - With `base: "media"`, its crop is in pixels of the media's own version, and `baseTransform` is
 *   the media's transform it was made on. When the media's transform is no longer the same, the
 *   field and the editor ask to check the crop (answer 3), and renderers clamp it meanwhile.
 * - A tool can add its own keys (answer 8). Renderers ignore the keys they don't know.
 */
export interface ImageTransform extends MediaTransform {
    base?: TransformBase;
    baseTransform?: MediaTransform;
}

/**
 * The `image` field of the protocol: a `media` field for images, with the editor. Its value is a
 * `MediaReference` whose `transform` is an `ImageTransform`.
 *
 * Its constraints are a portable rule, which the backend checks (answer 5):
 * `{ "rule": "crop", "value": { "ratios": ["16:9", "1:1"], "required": true } }`.
 *
 * - `ratios`: a crop must have one of them. A crop matches a ratio when its height is within one
 *   pixel of its width divided by the ratio.
 * - `required`: each image needs a crop for this use. The editor proposes one (answer 4): the
 *   largest of the first ratio, around the focal point.
 */
export interface ImageFieldDefinition {
    name: string;
    type: 'image';
    /** As for `media`: one library, a list of them, or every library when left out. */
    resource?: string | readonly string[];
    multiple?: boolean;
    /** Defaults to `["image/*"]`. */
    accept?: readonly string[];
    /** Ratios the editor suggests, as `width:height`, when the `crop` rule doesn't enforce any. */
    ratios?: readonly string[];
    /** Whether the editor offers rotation and flips. Defaults to true. */
    rotate?: boolean;
    /** Whether the editor offers the focal point. Defaults to true. */
    focalPoint?: boolean;
    /**
     * What a transform for one use starts from (answer 1): fixed by the field, or `choose` to let
     * the user pick in the editor. Defaults to `media`.
     */
    transformBase?: TransformBase | 'choose';
    rules?: readonly { rule: string; value?: unknown; message?: string }[];
}

/** A reference in an `image` value. */
export interface ImageReference extends MediaReference {
    transform?: ImageTransform | null;
}

/** The image being edited. */
export interface EditedImage {
    label: string;
    /** The original file, which the editor draws. */
    url: string;
    width: number;
    height: number;
    /** The media's own transform, from its library. */
    mediaTransform?: MediaTransform | null;
}

export interface ImageEditorProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    image: EditedImage;
    /** The transform being edited: for one use, or the media's own. */
    value: ImageTransform | null;
    /** Shows "Start from: Library version / Original file". */
    canChooseBase?: boolean;
    /** Defaults to crop, rotate and focal point. A product adds its own. */
    tools?: readonly ImageEditorTool[];
    ratios?: readonly string[];
    enforceRatios?: boolean;
    cropRequired?: boolean;
    /** "Edit image", "Crop for this use". */
    title?: string;
    /** "Apply", "Use this crop". */
    applyLabel?: string;
    /** Shows "Back to the library", when the editor is a step after the picker. */
    onBack?: () => void;
    onApply: (transform: ImageTransform | null) => void;
}

/** What a tool reads and changes. */
export interface ImageEditorToolContext {
    image: EditedImage;
    transform: ImageTransform;
    setTransform: (transform: ImageTransform) => void;
}

/**
 * A tool of the editor: crop, rotate and focal point first, and later others (answer 3). A tool has
 * a panel of options, can draw over the image, and can say why the transform can't be applied.
 */
export interface ImageEditorTool {
    id: string;
    label: string;
    icon: IconComponent;
    renderPanel: (context: ImageEditorToolContext) => ReactNode;
    /** Drawn over the image, in the coordinates of the view (rotated and flipped). */
    renderOverlay?: (context: ImageEditorToolContext) => ReactNode;
    /** Why the transform can't be applied, or null. */
    validate?: (transform: ImageTransform) => string | null;
}
