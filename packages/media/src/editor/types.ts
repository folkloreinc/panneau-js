import type { ReactNode } from 'react';

import type { MediaTransform } from '@panneau/protocol';
import type { IconComponent } from '@panneau/ui';

import type { Point, Rect, Size } from './geometry';

/**
 * What a transform for one use starts from (decision 0031): the media's own transform, or the
 * original file.
 */
export type TransformBase = 'media' | 'original';

/** The image the editor edits. */
export interface EditedImage {
    /** Its name, for assistive technologies: "harbour at dawn". */
    label: string;
    /** The original file, which the editor draws. */
    url: string;
    /** The size of the upright original, in pixels. */
    width: number;
    height: number;
    /** The media's own transform, from its library: a transform for one use can apply over it. */
    mediaTransform?: MediaTransform | null;
}

/** What a tool reads and changes. */
export interface ImageEditorToolContext {
    image: EditedImage;
    /** The edits being made, relative to `size`. */
    transform: MediaTransform;
    setTransform: (update: (transform: MediaTransform) => MediaTransform) => void;
    /** The size of the image the edits apply to: the original, or the media's version. */
    size: Size;
    /** The image as it will be rendered (rotated and flipped), in its pixels. */
    view: Size;
    /** The crop, in the view: the whole view without one. */
    crop: Rect;
    /** How many units of the view one pixel of the screen is, for marks of a constant size. */
    unit: number;
    /** The image as the view shows it, to draw in an SVG in the coordinates of the view. */
    drawing: ReactNode;
    /** The point of the view under a pointer. */
    pointToView: (event: { clientX: number; clientY: number }) => Point;
    /** The ratios the field offers, as `width:height`. */
    ratios: readonly string[];
    /** Whether a crop must have one of `ratios`. */
    enforceRatios: boolean;
    /** The tool's own state, kept while the editor is open. */
    state: unknown;
    setState: (state: unknown) => void;
    /** The id of the text that says how to use the tool's overlay with a keyboard. */
    hintId: string;
}

/**
 * A tool of the editor: crop, rotate and focal point first, and others that a product adds. A tool
 * has a panel of options, can draw over the image, and can say why the edits can't be applied.
 */
export interface ImageEditorTool {
    id: string;
    label: string;
    icon: IconComponent;
    /** Its options, in the side panel. */
    renderPanel: (context: ImageEditorToolContext) => ReactNode;
    /** Drawn over the image, in an SVG in the coordinates of the view. */
    renderOverlay?: (context: ImageEditorToolContext) => ReactNode;
    /** Under the image: how to use the overlay, with a pointer and a keyboard. */
    hint?: string;
    /** Why the edits can't be applied, or null. */
    validate?: (transform: MediaTransform) => string | null;
}

export interface ImageEditorProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    image: EditedImage;
    /**
     * The transform being edited, as a value keeps it: with its `base`, and its `baseTransform`
     * over the media's version. Null for a new one.
     */
    value: MediaTransform | null;
    /** The base of a new transform. Defaults to `media` when the image has its own transform. */
    base?: TransformBase;
    /** Shows "Start from: Library version / Original file", when the image has its own transform. */
    canChooseBase?: boolean;
    /** Defaults to crop, rotate and focal point. */
    tools?: readonly ImageEditorTool[];
    /** The ratios the field offers, as `width:height`. Without, common ones. */
    ratios?: readonly string[];
    /** Whether a crop must have one of `ratios` (the `crop` rule). */
    enforceRatios?: boolean;
    /** Whether the image needs a crop (the `crop` rule): the editor proposes one. */
    cropRequired?: boolean;
    /** "Edit image" by default. */
    title?: string;
    /** "Apply" by default. */
    applyLabel?: string;
    /** Shows "Back to the library", when the editor is a step after the picker. */
    onBack?: () => void;
    /** Called with the new transform, or null when it has no edits, then the editor closes. */
    onApply: (transform: MediaTransform | null) => void;
}
