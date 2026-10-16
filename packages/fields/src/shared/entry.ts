import type { Field, Rule } from '@panneau/protocol';

import type { FieldEntryProps, FieldProps } from './types';

/** The rule of a field with this name, if any. */
export function findRule(field: Field, rule: Rule['rule']): Rule | undefined {
    return field.rules?.find((candidate) => candidate.rule === rule);
}

/** The number of a `min` or `max` rule of a field, if any. */
export function getRuleNumber(field: Field, rule: 'min' | 'max'): number | undefined {
    const found = findRule(field, rule);
    return found !== undefined && 'value' in found && typeof found.value === 'number'
        ? found.value
        : undefined;
}

/** Whether a field has the `required` rule. */
export function isRequired(field: Field): boolean {
    return findRule(field, 'required') !== undefined;
}

/** A setting of a field (`settings.<name>`), when it has the expected type. */
export function getSetting<T>(field: Field, name: string, guard: (value: unknown) => value is T) {
    const value = field.settings?.[name];
    return guard(value) ? value : undefined;
}

export const isString = (value: unknown): value is string => typeof value === 'string';
export const isNumber = (value: unknown): value is number =>
    typeof value === 'number' && !Number.isNaN(value);

/**
 * The props that every field takes, from a registry entry's props: label (the field's name
 * without one), help, required mark, read-only, errors and handlers. Plugins use it to write their
 * own entries.
 */
export function getFieldProps(
    props: FieldEntryProps,
): Omit<FieldProps<never>, 'value' | 'onChange'> & { placeholder?: string } {
    const { field } = props;
    return {
        name: props.path,
        // A field always has a label: its name when the definition gives none.
        label: field.label ?? field.name,
        description: field.help,
        ...(field.placeholder !== undefined ? { placeholder: field.placeholder } : {}),
        required: isRequired(field),
        readOnly: props.readOnly === true || field.readOnly === true,
        disabled: props.disabled === true,
        errors: props.errors ?? [],
        ...(props.onBlur !== undefined ? { onBlur: props.onBlur } : {}),
        ...(props.className !== undefined ? { className: props.className } : {}),
    };
}

/** The value as a string, or `null`. */
export function asString(value: unknown): string | null {
    return typeof value === 'string' ? value : null;
}
