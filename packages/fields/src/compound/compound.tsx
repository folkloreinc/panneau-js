import type { ReactNode } from 'react';

import type { Field } from '@panneau/protocol';
import { getNestedShape } from '@panneau/protocol/runtime';
import { usePanneauIntl } from '@panneau/ui';

import { GroupField, type GroupValue } from '../group/GroupField';
import { RepeaterField, type RepeaterItem } from '../repeater/RepeaterField';
import { getFieldProps, getRuleNumber } from '../shared/entry';
import type { FieldEntry, FieldEntryProps } from '../shared/types';

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

function isObject(value: unknown): value is Record<string, unknown> {
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

/**
 * Makes the entry of a compound field type (decision 0065): a type of a plugin that carries its
 * sub-fields in `fields`. Its value is an object of them, or a list of objects with `multiple`,
 * rendered as a `group` or a `repeater` with the layout and the summary given. The definition
 * decides the sub-fields: the layout places those it knows by name. The README of
 * `@panneau/fields` has an example.
 */
export function defineCompoundField(options: CompoundFieldOptions = {}): CompoundFieldEntry {
    const { layout, summarize } = options;

    function CompoundField(props: FieldEntryProps) {
        const intl = usePanneauIntl();
        const { field, value } = props;
        const fields = field.fields ?? [];
        const context = { field, locale: intl.locale };
        const renderFields =
            layout !== undefined
                ? (parts: Readonly<Record<string, ReactNode>>, item: Record<string, unknown>) =>
                      layout({ parts, value: item, field })
                : undefined;
        if (getNestedShape(field) === 'repeater') {
            const min = getRuleNumber(field, 'min');
            const max = getRuleNumber(field, 'max');
            return (
                <RepeaterField
                    {...getFieldProps(props)}
                    path={props.path}
                    fields={fields}
                    value={Array.isArray(value) ? value.filter(isObject) : null}
                    onChange={props.onChange}
                    {...(renderFields !== undefined ? { renderFields } : {})}
                    {...(summarize !== undefined
                        ? { itemTitle: (item: RepeaterItem) => summarize(item, context) }
                        : {})}
                    {...(min !== undefined ? { min } : {})}
                    {...(max !== undefined ? { max } : {})}
                    {...(props.invalidPaths !== undefined
                        ? { invalidPaths: props.invalidPaths }
                        : {})}
                />
            );
        }
        return (
            <GroupField
                {...getFieldProps(props)}
                fields={fields}
                path={props.path}
                value={isObject(value) ? (value as GroupValue) : null}
                onChange={props.onChange}
                {...(renderFields !== undefined ? { renderFields } : {})}
            />
        );
    }

    return Object.assign(CompoundField, summarize !== undefined ? { summarize } : {});
}
