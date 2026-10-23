import type { Option } from '@panneau/protocol';
import { type TagSuggestion, TagsInput } from '@panneau/ui';

import { getFieldProps, getSetting, isString } from '../shared/entry';
import type { FieldEntryProps, FieldProps } from '../shared/types';

export interface TagsFieldProps extends FieldProps<string[]> {
    placeholder?: string;
    /** Tags offered as the user types. */
    suggestions?: readonly TagSuggestion[];
    /** Whether tags outside the suggestions are allowed. Defaults to true. */
    allowCustom?: boolean;
}

/** A list of words, typed or picked among suggestions. An empty list is `null`. */
export function TagsField({ disabled, readOnly, required, ...props }: TagsFieldProps) {
    return (
        <TagsInput {...props} isDisabled={disabled} isReadOnly={readOnly} isRequired={required} />
    );
}

/** The options of a field as suggestions: their values as strings. */
function toSuggestions(options: readonly Option[]): TagSuggestion[] {
    return options.map((option) => ({ value: String(option.value), label: option.label }));
}

/**
 * The `tags` type: its `options` as suggestions, and setting `allowCustom` (true by default)
 * for tags outside them.
 */
export function TagsFieldEntry(props: FieldEntryProps) {
    const { field } = props;
    const allowCustom = getSetting(
        field,
        'allowCustom',
        (value): value is boolean => typeof value === 'boolean',
    );
    const value = Array.isArray(props.value) ? props.value.filter(isString) : null;
    return (
        <TagsField
            {...getFieldProps(props)}
            value={value !== null && value.length > 0 ? value : null}
            onChange={props.onChange}
            suggestions={toSuggestions(field.options ?? [])}
            {...(allowCustom !== undefined ? { allowCustom } : {})}
        />
    );
}
