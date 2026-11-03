import { isRecord } from './values';

/**
 * The URL of an image value: a media reference (its thumbnail, or its URL), a stored file, or a
 * URL. `null` for anything else.
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
    const url = source.thumbnailUrl ?? source.url;
    return typeof url === 'string' && url !== '' ? url : null;
}
