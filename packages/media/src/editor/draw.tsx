import { type ReactNode, useEffect, useState } from 'react';

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
 * (its own crop, rotation and flips), drawn in a nested viewport. `href` draws another file in
 * place of the original, such as its thumbnail: it is stretched to the original's size, so that
 * the edits, which are in the original's pixels, stay the same.
 */
export function drawBase(
    image: EditedImage,
    base: TransformBase,
    href: string = image.url,
): { size: Size; drawing: ReactNode } {
    const original = (
        <image
            href={href}
            width={image.width}
            height={image.height}
            {...(href !== image.url ? { preserveAspectRatio: 'none' } : {})}
        />
    );
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
    href?: string,
): { crop: Rect; drawing: ReactNode } {
    const { base: _base, baseTransform: _baseTransform, ...edits } = transform ?? {};
    const base: TransformBase =
        transform === null || transform === undefined || transform.base === 'media'
            ? 'media'
            : 'original';
    const { size, drawing } = drawBase(image, base, href);
    return {
        crop: cropInView(size, edits),
        drawing: <g transform={svgTransform(size, edits)}>{drawing}</g>,
    };
}

export interface TransformedImageProps {
    image: EditedImage;
    transform?: MediaTransform | null;
    /**
     * A smaller copy of the whole original, such as its thumbnail, drawn instead of it: the
     * original is only loaded when this one doesn't load, or doesn't have its proportions.
     */
    previewUrl?: string | null;
    /** Its text alternative: empty for a decorative image. */
    alt: string;
    /** `slice` fills its box, as a thumbnail does. */
    fit?: 'meet' | 'slice';
    className?: string;
    /** The class of a frame drawn around the image itself, inside the margins of `meet`. */
    frameClassName?: string;
}

/**
 * Whether an image of `width` × `height` has the proportions of the original, give or take the
 * rounding of its pixels.
 */
export function hasProportionsOf(image: Size, width: number, height: number): boolean {
    if (width <= 0 || height <= 0) {
        return false;
    }
    const expected = (width * image.height) / image.width;
    return Math.abs(height - expected) <= Math.max(1, expected * 0.01);
}

/**
 * The file to draw for an image: its preview, unless it fails to load or doesn't have the
 * proportions of the original (a square thumbnail, or one of the media's version), since the
 * edits are in the original's pixels.
 */
function useDrawnUrl(image: EditedImage, previewUrl: string | null | undefined): string {
    const [unusable, setUnusable] = useState<string | null>(null);
    const { url, width, height } = image;
    useEffect(() => {
        if (typeof previewUrl !== 'string' || previewUrl === url) {
            return undefined;
        }
        const probe = new Image();
        probe.onload = () => {
            if (!hasProportionsOf({ width, height }, probe.naturalWidth, probe.naturalHeight)) {
                setUnusable(previewUrl);
            }
        };
        probe.onerror = () => {
            setUnusable(previewUrl);
        };
        probe.src = previewUrl;
        return () => {
            probe.onload = null;
            probe.onerror = null;
        };
    }, [url, width, height, previewUrl]);
    return typeof previewUrl === 'string' && previewUrl !== unusable ? previewUrl : url;
}

/** An image as it is rendered for one use, computed in the browser (decision 0031). */
export function TransformedImage({
    image,
    transform,
    previewUrl,
    alt,
    fit = 'meet',
    className,
    frameClassName,
}: TransformedImageProps) {
    const href = useDrawnUrl(image, previewUrl);
    const { crop, drawing } = renderedImage(image, transform, href);
    return (
        <svg
            {...(alt === '' ? { 'aria-hidden': true } : { role: 'img', 'aria-label': alt })}
            viewBox={viewBox(crop)}
            preserveAspectRatio={`xMidYMid ${fit}`}
            className={className}
        >
            {drawing}
            {frameClassName !== undefined ? (
                <rect
                    x={crop.x}
                    y={crop.y}
                    width={crop.width}
                    height={crop.height}
                    className={frameClassName}
                />
            ) : null}
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
