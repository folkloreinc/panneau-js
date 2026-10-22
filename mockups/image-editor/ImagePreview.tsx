import type { ReactNode } from 'react';

import type { TransformBase } from './ImageEditor';
import type { MockImage } from './fixtures';
import { type Rect, type Size, type Transform, cropInView, svgTransform } from './geometry';

/** The image a transform for one use applies to: the original, or the media's own version. */
export interface Base {
    size: Size;
    /** The base, drawn in its own pixels. */
    content: ReactNode;
}

export function baseOf(image: MockImage, base: TransformBase): Base {
    const original = <image href={image.url} width={image.width} height={image.height} />;
    const own = image.mediaTransform;
    if (base === 'original' || own === undefined) {
        return { size: { width: image.width, height: image.height }, content: original };
    }
    // The media's own version: its crop, rotated and flipped, as a nested viewport.
    const crop = cropInView(image, own);
    return {
        size: { width: crop.width, height: crop.height },
        content: (
            <svg
                width={crop.width}
                height={crop.height}
                viewBox={`${String(crop.x)} ${String(crop.y)} ${String(crop.width)} ${String(crop.height)}`}
            >
                <g transform={svgTransform(image, own)}>{original}</g>
            </svg>
        ),
    };
}

const box = (rect: Rect) =>
    `${String(rect.x)} ${String(rect.y)} ${String(rect.width)} ${String(rect.height)}`;

export interface ImagePreviewProps {
    image: MockImage;
    base?: TransformBase;
    transform?: Transform;
    /** The part of the view shown: the crop by default. */
    region?: Rect;
    /** `slice` fills its box, as a thumbnail does. */
    fit?: 'meet' | 'slice';
    label: string;
    className?: string;
}

/** An image with a transform for one use, as a renderer would give it: computed in the browser. */
export function ImagePreview({
    image,
    base = 'media',
    transform = {},
    region,
    fit = 'meet',
    label,
    className,
}: ImagePreviewProps) {
    const { size, content } = baseOf(image, base);
    return (
        <svg
            role="img"
            aria-label={label}
            className={className}
            viewBox={box(region ?? cropInView(size, transform))}
            preserveAspectRatio={`xMidYMid ${fit}`}
        >
            <g transform={svgTransform(size, transform)}>{content}</g>
        </svg>
    );
}
