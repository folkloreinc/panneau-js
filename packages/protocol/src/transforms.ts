import type { MediaTransform } from './schemas/api';
import { isRecord } from './values';

/** The ratio of `width:height` (`16:9` gives 1.777…), or null when it isn't one. */
export function parseRatio(ratio: string): number | null {
    const match = /^([1-9][0-9]*):([1-9][0-9]*)$/.exec(ratio);
    return match === null ? null : Number(match[1]) / Number(match[2]);
}

/**
 * Whether a size has a ratio (decision 0031): its height is within one pixel of its width divided
 * by the ratio, since crops are in whole pixels.
 */
export function matchesRatio(width: number, height: number, ratio: number | string): boolean {
    const value = typeof ratio === 'number' ? ratio : parseRatio(ratio);
    return value !== null && value > 0 && Math.abs(width / value - height) <= 1;
}

/**
 * The size of the crop of a transform as it is rendered: a quarter turn swaps its width and its
 * height. Null without a crop.
 */
export function renderedCropSize(
    transform: Pick<MediaTransform, 'crop' | 'rotate'>,
): { width: number; height: number } | null {
    const crop = transform.crop;
    if (!isRecord(crop) || typeof crop.width !== 'number' || typeof crop.height !== 'number') {
        return null;
    }
    return transform.rotate === 90 || transform.rotate === 270
        ? { width: crop.height, height: crop.width }
        : { width: crop.width, height: crop.height };
}
