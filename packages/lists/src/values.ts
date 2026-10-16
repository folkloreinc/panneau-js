import type { Field, Option } from '@panneau/protocol';

import type { ListColumn, ListItem } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * The value of a localized field in a locale: the locale (`fr-CA`), its language (`fr`), then the
 * first filled locale. Other values are returned as they are.
 */
export function getLocalizedValue(value: unknown, locale: string): unknown {
    if (!isRecord(value)) {
        return value;
    }
    const language = locale.split('-')[0] ?? locale;
    const filled = (candidate: unknown) =>
        candidate !== undefined && candidate !== null && candidate !== '';
    if (filled(value[locale])) {
        return value[locale];
    }
    if (filled(value[language])) {
        return value[language];
    }
    return Object.values(value).find(filled) ?? null;
}

/** Whether a field's values are keyed by locale. */
export function isLocalized(field: Field | null | undefined): boolean {
    return field?.localized === true;
}

/** The value of a column for an item: `item[id]`, in the locale for a localized field. */
export function getColumnValue(item: ListItem, column: ListColumn, locale: string): unknown {
    const value = item[column.field?.name ?? column.id];
    return isLocalized(column.field) ? getLocalizedValue(value, locale) : value;
}

/**
 * A value as plain text: strings and numbers as they are, references by their label, localized
 * values in the locale, lists joined with commas. For labels of items and for search.
 */
export function toText(value: unknown, locale: string): string {
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (Array.isArray(value)) {
        return value
            .map((entry) => toText(entry, locale))
            .filter((text) => text !== '')
            .join(', ');
    }
    if (isRecord(value)) {
        if (typeof value.label === 'string') {
            return value.label;
        }
        return toText(getLocalizedValue(value, locale), locale);
    }
    return '';
}

/** The options of a field, or none. */
export function getFieldOptions(field: Field | null | undefined): readonly Option[] {
    return field?.options ?? [];
}

/** The label of an option value, matched as a string (values from the URL are strings). */
export function getOptionLabel(options: readonly Option[], value: unknown): string | null {
    const option = options.find((candidate) => String(candidate.value) === String(value));
    return option?.label ?? null;
}
