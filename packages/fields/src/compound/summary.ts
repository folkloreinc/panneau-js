// The summary of a compound field and the helpers of its layout, apart from the field itself:
// lists and details summarize values without loading the repeater that renders the field.
import type { ReactNode } from 'react';

import type { Field } from '@panneau/protocol';

import type { FieldEntry } from '../shared/types';

/** What a compound field's summary is given. */
export interface CompoundSummaryContext {
    /** The compound field, as the definition describes it. */
    field: Field;
    /** The locale of the interface. */
    locale: string;
}

/**
 * A short text for one value of a compound field: its object, or an item of its list. `null` when
 * there is nothing to say.
 */
export type CompoundSummary = (
    value: Readonly<Record<string, unknown>>,
    context: CompoundSummaryContext,
) => string | null;

/** What lays out the sub-fields of one value of a compound field. */
export interface CompoundLayoutProps {
    /** The rendered sub-fields, by name. Those the definition doesn't have are missing. */
    parts: Readonly<Record<string, ReactNode>>;
    /** The value: the object, or the item of the list. */
    value: Readonly<Record<string, unknown>>;
    /** The compound field. */
    field: Field;
}

export interface CompoundFieldOptions {
    /**
     * Lays out the sub-fields of one value. Without it, they flow as in a group. Sub-fields that
     * the layout doesn't place aren't shown: `restParts()` gives them.
     */
    layout?: (props: CompoundLayoutProps) => ReactNode;
    /**
     * Summarizes one value: the title of an item in the form, and the value in lists and details,
     * where the items of a list are joined.
     */
    summarize?: CompoundSummary;
}

/** The entry of a compound field type, with its summary for lists and details. */
export type CompoundFieldEntry = FieldEntry & { summarize?: CompoundSummary };

/** The rendered sub-fields that aren't in `names`, in the order of the definition. */
export function restParts(
    parts: Readonly<Record<string, ReactNode>>,
    names: readonly string[],
): ReactNode[] {
    return Object.entries(parts)
        .filter(([name]) => !names.includes(name))
        .map(([, part]) => part);
}

export function isObject(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Summarizes the value of a compound field with its entry's `summarize`: one text, or the texts of
 * its items joined by commas. `null` without a summary, or when there is nothing to say.
 */
export function summarizeCompound(
    entry: unknown,
    value: unknown,
    context: CompoundSummaryContext,
): string | null {
    const summarize =
        typeof entry === 'function' && 'summarize' in entry
            ? (entry.summarize as CompoundSummary | undefined)
            : undefined;
    if (summarize === undefined) {
        return null;
    }
    const values = Array.isArray(value) ? value.filter(isObject) : isObject(value) ? [value] : [];
    const texts = values.flatMap((item) => {
        const text = summarize(item, context);
        return text !== null && text !== '' ? [text] : [];
    });
    return texts.length > 0 ? texts.join(', ') : null;
}
