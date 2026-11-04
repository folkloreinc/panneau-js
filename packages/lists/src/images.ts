import { isRecord } from './values';

/** The types of images that browsers show. A HEIC or TIFF original needs a thumbnail. */
const WEB_IMAGE_TYPES = new Set([
    'image/apng',
    'image/avif',
    'image/bmp',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'image/webp',
]);

/**
 * Whether the URL of a media or a file is an image to show, from its `type` (a media's URL is
 * the file to show) or its `mime` (a file's URL is its original), when it says.
 */
function isImage(source: Record<string, unknown>): boolean {
    if (typeof source.type === 'string') {
        return source.type === 'image';
    }
    if (typeof source.mime === 'string') {
        return WEB_IMAGE_TYPES.has(source.mime.toLowerCase());
    }
    return true;
}

/**
 * The URL of an image value: a media reference or a media (its thumbnail, or the URL of an
 * image), a stored file (the URL of an image that browsers show), or a URL. `null` for anything
 * else, such as a PDF without a thumbnail.
 */
export function getImageUrl(value: unknown): string | null {
    const first: unknown = Array.isArray(value) ? value[0] : value;
    if (typeof first === 'string') {
        return first !== '' ? first : null;
    }
    if (!isRecord(first)) {
        return null;
    }
    const source = isRecord(first.media) ? first.media : first;
    const url = source.thumbnailUrl ?? (isImage(source) ? source.url : null);
    return typeof url === 'string' && url !== '' ? url : null;
}
