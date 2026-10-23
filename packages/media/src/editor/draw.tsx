import type { ReactNode } from 'react';

import type { MediaTransform } from '@panneau/protocol';
import { matchesRatio } from '@panneau/protocol/runtime';

import { type Rect, type Size, cropInView, sameEdits, svgTransform } from './geometry';
import type { EditedImage, TransformBase } from './types';

export const viewBox = (rect: Rect) =>
    `${String(rect.x)} ${String(rect.y)} ${String(rect.width)} ${String(rect.height)}`;

/** The media's own transform, or null when it has no edits. */
export function ownTransform(image: EditedImage): MediaTransform | null {
    const own = image.mediaTransform;
    return own !== null && own !== undefined && !sameEdits(own, {}) ? own : null;
}

/**
 * The image a transform applies to, drawn in its own pixels: the original, or the media's version
 * (its own crop, rotation and flips), drawn in a nested viewport.
 */
export function drawBase(
    image: EditedImage,
    base: TransformBase,
): { size: Size; drawing: ReactNode } {
    const original = <image href={image.url} width={image.width} height={image.height} />;
    const own = ownTransform(image);
    if (base !== 'media' || own === null) {
        return { size: { width: image.width, height: image.height }, drawing: original };
    }
    const version = cropInView(image, own);
    return {
        size: { width: version.width, height: version.height },
        drawing: (
            <svg width={version.width} height={version.height} viewBox={viewBox(version)}>
                <g transform={svgTransform(image, own)}>{original}</g>
            </svg>
        ),
    };
}

/**
 * How an image is rendered for one use: with its transform for this use, from its base, or as its
 * library renders it without one.
 */
export function renderedImage(
    image: EditedImage,
    transform: MediaTransform | null | undefined,
): { crop: Rect; drawing: ReactNode } {
    const { base: _base, baseTransform: _baseTransform, ...edits } = transform ?? {};
    const base: TransformBase =
        transform === null || transform === undefined || transform.base === 'media'
            ? 'media'
            : 'original';
    const { size, drawing } = drawBase(image, base);
    return {
        crop: cropInView(size, edits),
        drawing: <g transform={svgTransform(size, edits)}>{drawing}</g>,
    };
}

export interface TransformedImageProps {
    image: EditedImage;
    transform?: MediaTransform | null;
    /** Its text alternative: empty for a decorative image. */
    alt: string;
    /** `slice` fills its box, as a thumbnail does. */
    fit?: 'meet' | 'slice';
    className?: string;
}

/** An image as it is rendered for one use, computed in the browser (decision 0031). */
export function TransformedImage({
    image,
    transform,
    alt,
    fit = 'meet',
    className,
}: TransformedImageProps) {
    const { crop, drawing } = renderedImage(image, transform);
    return (
        <svg
            {...(alt === '' ? { 'aria-hidden': true } : { role: 'img', 'aria-label': alt })}
            viewBox={viewBox(crop)}
            preserveAspectRatio={`xMidYMid ${fit}`}
            className={className}
        >
            {drawing}
        </svg>
    );
}

/** A ratio as text: `16:9`, or `1.85:1` when it isn't a common one. */
export function ratioLabel(width: number, height: number): string {
    const common = ['1:1', '16:9', '9:16', '4:3', '3:4', '3:2', '2:3', '4:5', '5:4', '21:9'];
    return (
        common.find((ratio) => matchesRatio(width, height, ratio)) ??
        `${(width / height).toFixed(2)}:1`
    );
}
