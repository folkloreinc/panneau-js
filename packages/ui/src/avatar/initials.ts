import { CHART_CATEGORICAL_COUNT } from '../theme/chartColors';

function firstGrapheme(word: string, segmenter: Intl.Segmenter): string {
    for (const { segment } of segmenter.segment(word)) {
        return segment;
    }
    return '';
}

/**
 * The initials of a name: the first letter of its first and last words, by graphemes, so that an
 * accented letter or an emoji stays whole, in upper case for the locale.
 */
export function getInitials(name: string, locale?: string): string {
    const words = name
        .trim()
        .split(/\s+/u)
        .map((word) => word.replace(/^[^\p{L}\p{N}\p{Extended_Pictographic}]+/u, ''))
        .filter((word) => word !== '');
    const first = words[0];
    if (first === undefined) {
        return '';
    }
    const segmenter = new Intl.Segmenter(locale, { granularity: 'grapheme' });
    const last = words.length > 1 ? words[words.length - 1] : undefined;
    return (
        firstGrapheme(first, segmenter) + (last !== undefined ? firstGrapheme(last, segmenter) : '')
    ).toLocaleUpperCase(locale);
}

/**
 * The index of a name's categorical chart color (0 to 7): a hash (FNV-1a) of the name, so that the
 * same name always has the same color.
 */
export function getNameColorIndex(name: string): number {
    let hash = 0x811c9dc5;
    for (const character of name.trim().toLowerCase()) {
        hash ^= character.codePointAt(0) ?? 0;
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0) % CHART_CATEGORICAL_COUNT;
}
