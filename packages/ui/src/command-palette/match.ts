import type { IconComponent } from '../icon/Icon';

/** An item of a `CommandPalette`: a link to follow, or an action to run. */
export interface CommandPaletteItem {
    /** Unique in the palette. */
    id: string;
    label: string;
    /** A second line, such as the subtitle of an item or what an action does. */
    description?: string;
    /** More words it is found by, never shown. */
    keywords?: readonly string[];
    icon?: IconComponent;
    /** An image instead of an icon, such as the thumbnail of an item. */
    imageUrl?: string;
    /** A path or URL to go to, through the app's `RouterProvider`. */
    href?: string;
    /** Runs when the item is chosen, after which the palette closes. */
    onAction?: () => void;
    /** The palette stays open after `onAction`, such as an item that narrows the search. */
    keepsOpen?: boolean;
}

/** A titled group of items. */
export interface CommandPaletteGroup {
    id: string;
    label: string;
    items: readonly CommandPaletteItem[];
    /**
     * The items already match the query, such as results of a server: they are shown as they are,
     * after the groups that the palette matches itself.
     */
    matched?: boolean;
}

/** Lower case, without accents. */
function fold(text: string, locale?: string): string {
    return text
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .toLocaleLowerCase(locale);
}

/** Lower case, without accents: `Été` and `ete` are the same. */
export function normalizeSearch(text: string, locale?: string): string {
    return fold(text, locale).trim();
}

/**
 * How well an item matches a query, lower being better, or `null` when it doesn't: every word of
 * the query must be in its label, description or keywords. A label that starts with the query
 * comes first, then a label with a word that starts with it, then a label that contains it.
 */
function score(item: CommandPaletteItem, query: string, words: string[], locale?: string) {
    const label = normalizeSearch(item.label, locale);
    const text = normalizeSearch(
        [item.label, item.description ?? '', ...(item.keywords ?? [])].join(' '),
        locale,
    );
    if (!words.every((word) => text.includes(word))) {
        return null;
    }
    if (label.startsWith(query)) {
        return 0;
    }
    if (label.split(/\s+/).some((word) => word.startsWith(query))) {
        return 1;
    }
    return label.includes(query) ? 2 : 3;
}

/**
 * The groups of a palette for a query: the items that match it, ranked, in non-empty groups. Groups
 * that are already `matched` keep their items, after the others. Without a query, every item.
 */
export function matchCommands(
    groups: readonly CommandPaletteGroup[],
    query: string,
    locale?: string,
): CommandPaletteGroup[] {
    const normalized = normalizeSearch(query, locale);
    const words = normalized.split(/\s+/).filter((word) => word !== '');
    const local = groups.filter((group) => group.matched !== true);
    const remote = groups.filter((group) => group.matched === true);
    const matched =
        words.length === 0
            ? local
            : local.map((group) => ({
                  ...group,
                  items: group.items
                      .map((item, index) => ({
                          item,
                          index,
                          rank: score(item, normalized, words, locale),
                      }))
                      .filter(
                          (entry): entry is typeof entry & { rank: number } => entry.rank !== null,
                      )
                      .sort((a, b) => a.rank - b.rank || a.index - b.index)
                      .map(({ item }) => item),
              }));
    return [...matched, ...remote].filter((group) => group.items.length > 0);
}

/** A part of a label, and whether it matches a word of the query. */
export interface LabelPart {
    text: string;
    match: boolean;
}

/**
 * A label in parts, for highlighting what matches a query: the first match of each word of the
 * query, ignoring case and accents, as `matchCommands()` does. Matches that overlap or touch are
 * one part. Without a query or a match, the label is one part.
 */
export function splitMatches(label: string, query: string, locale?: string): LabelPart[] {
    // The label normalized one character at a time, with where each normalized character comes from
    let normalized = '';
    const starts: number[] = [];
    const ends: number[] = [];
    let offset = 0;
    for (const character of label) {
        const piece = fold(character, locale);
        for (let index = 0; index < piece.length; index += 1) {
            starts.push(offset);
            ends.push(offset + character.length);
        }
        normalized += piece;
        offset += character.length;
    }
    const ranges = normalizeSearch(query, locale)
        .split(/\s+/)
        .filter((word) => word !== '')
        .flatMap((word): [number, number][] => {
            const index = normalized.indexOf(word);
            const start = starts[index];
            const end = ends[index + word.length - 1];
            return index === -1 || start === undefined || end === undefined ? [] : [[start, end]];
        })
        .sort((a, b) => a[0] - b[0]);
    const parts: LabelPart[] = [];
    let cursor = 0;
    ranges.forEach(([start, end]) => {
        // Accents written apart from their letter belong to it
        let last = end;
        while (last < label.length && fold(label.charAt(last), locale) === '') {
            last += 1;
        }
        const previous = parts.at(-1);
        if (previous?.match === true && start <= cursor) {
            previous.text += label.slice(cursor, last);
        } else {
            if (start > cursor) {
                parts.push({ text: label.slice(cursor, start), match: false });
            }
            parts.push({ text: label.slice(Math.max(start, cursor), last), match: true });
        }
        cursor = Math.max(cursor, last);
    });
    if (cursor < label.length) {
        parts.push({ text: label.slice(cursor), match: false });
    }
    return parts.filter((part) => part.text !== '');
}
