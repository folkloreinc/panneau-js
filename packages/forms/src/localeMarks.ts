import { type FormState, selectVisible } from '@panneau/core';
import { isRequired } from '@panneau/fields';
import type { Field } from '@panneau/protocol';
import { getNestedShape, getValue, isFilled } from '@panneau/protocol/runtime';

/** The fields of an item of a repeater: its own, or those of the item's block type. */
function itemFields(field: Field, item: unknown): readonly Field[] {
    if (field.fields !== undefined) {
        return field.fields;
    }
    const type =
        item !== null && typeof item === 'object' ? (item as { type?: unknown }).type : undefined;
    return field.types?.find((candidate) => candidate.id === type)?.fields ?? [];
}

/** What the language switch of a form says of a locale. */
export interface LocaleMarks {
    /** A value in this locale has errors. */
    invalid: boolean;
    /** A required localized field that shows is empty in this locale. */
    missing: boolean;
}

function visit(
    state: FormState,
    fields: readonly Field[],
    parentPath: string,
    locales: readonly string[],
    marks: Map<string, LocaleMarks>,
    errorPaths: readonly string[],
): void {
    fields.forEach((field) => {
        if (!selectVisible(state, field, parentPath)) {
            return;
        }
        const path = parentPath === '' ? field.name : `${parentPath}.${field.name}`;
        const value = getValue(state.values, path);
        if (field.localized === true) {
            const record =
                value !== null && typeof value === 'object' && !Array.isArray(value)
                    ? (value as Record<string, unknown>)
                    : {};
            const required = isRequired(field);
            locales.forEach((locale) => {
                const mark = marks.get(locale);
                if (mark === undefined) {
                    return;
                }
                const localePath = `${path}.${locale}`;
                if (
                    errorPaths.some(
                        (error) => error === localePath || error.startsWith(`${localePath}.`),
                    )
                ) {
                    mark.invalid = true;
                }
                if (required && !isFilled(record[locale])) {
                    mark.missing = true;
                }
            });
            return;
        }
        const shape = getNestedShape(field);
        if (shape === 'group') {
            visit(state, field.fields ?? [], path, locales, marks, errorPaths);
        } else if (shape === 'repeater' && Array.isArray(value)) {
            value.forEach((item: unknown, index) => {
                visit(
                    state,
                    itemFields(field, item),
                    `${path}.${index}`,
                    locales,
                    marks,
                    errorPaths,
                );
            });
        }
    });
}

/**
 * The marks of each locale for the language switch of a form, from its state: the locales with
 * errors, and those where a required localized field is empty.
 */
export function getLocaleMarks(
    state: FormState,
    fields: readonly Field[],
    locales: readonly string[],
): Record<string, LocaleMarks> {
    const marks = new Map(
        locales.map((locale): [string, LocaleMarks] => [
            locale,
            { invalid: false, missing: false },
        ]),
    );
    visit(state, fields, '', locales, marks, Object.keys(state.errors));
    return Object.fromEntries(marks);
}
