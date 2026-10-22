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
 * The `image` field of the protocol: a `media` field for images, with the editor. Its value is a
 * `MediaReference`, as for `media`.
 */
export interface ImageFieldDefinition {
    name: string;
    type: 'image';
    /** As for `media`: one library, a list of them, or every library when left out. */
    resource?: string | readonly string[];
    multiple?: boolean;
    /** Defaults to `["image/*"]`. */
    accept?: readonly string[];
    crop?: {
        /** The ratios offered, as `width:height`: `["16:9", "1:1"]`. */
        ratios?: readonly string[];
        /** Whether a crop must have one of `ratios`. Otherwise they are only presets. */
        enforceRatios?: boolean;
        /** Whether each image needs a crop for this use. */
        required?: boolean;
    };
    /** Whether the editor offers rotation and flips. Defaults to true. */
    rotate?: boolean;
    /** Whether the editor offers the focal point. Defaults to true. */
    focalPoint?: boolean;
    /**
     * What a transform for one use starts from. `choose` lets the user pick in the editor.
     * Defaults to `media`.
     */
    transformBase?: TransformBase | 'choose';
}

/** A reference in an `image` value: which base its transform is relative to, when it has one. */
export interface ImageReference extends MediaReference {
    transformBase?: TransformBase;
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
    value: MediaTransform | null;
    base?: TransformBase;
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
    onApply: (transform: MediaTransform | null, base: TransformBase) => void;
}

/** What a tool reads and changes. */
export interface ImageEditorToolContext {
    image: EditedImage;
    transform: MediaTransform;
    setTransform: (transform: MediaTransform) => void;
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
    validate?: (transform: MediaTransform) => string | null;
}
