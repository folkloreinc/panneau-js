import type { ReactNode } from 'react';

import { TextInput, usePanneauIntl } from '@panneau/ui';

import { getFieldProps, getRuleNumber, getSetting, isString } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps, FieldProps } from '../shared/types';

export interface TextFieldProps extends FieldProps<string> {
    placeholder?: string;
    /** Shows a count of characters against this maximum. It doesn't stop typing. */
    maxLength?: number;
    /** Content before the text, inside the control. */
    prefix?: ReactNode;
    /** Content after the text, inside the control. */
    suffix?: ReactNode;
    /** Type of the input. Defaults to `text`. */
    type?: 'text' | 'email' | 'url' | 'tel' | 'password' | 'search';
    inputMode?: 'text' | 'email' | 'url' | 'tel' | 'search' | 'numeric' | 'decimal' | 'none';
    autoComplete?: string;
    controlClassName?: string;
    inputClassName?: string;
}

/** The description of a text field, with its character count. */
export function useCountedDescription(
    description: ReactNode,
    value: string | null | undefined,
    maxLength: number | undefined,
): ReactNode {
    const intl = usePanneauIntl();
    if (maxLength === undefined) {
        return description;
    }
    const count = intl.formatMessage(messages.characterCount, {
        count: (value ?? '').length,
        max: maxLength,
    });
    if (description === undefined || description === null) {
        return count;
    }
    return (
        <>
            {description} <span>{count}</span>
        </>
    );
}

/** A single-line text. An empty text is `null`. */
export function TextField({
    value,
    onChange,
    description,
    maxLength,
    disabled,
    readOnly,
    required,
    ...props
}: TextFieldProps) {
    const shownDescription = useCountedDescription(description, value, maxLength);
    return (
        <TextInput
            {...props}
            value={value ?? ''}
            onChange={(next) => onChange?.(next === '' ? null : next)}
            description={shownDescription}
            isDisabled={disabled}
            isReadOnly={readOnly}
            isRequired={required}
        />
    );
}

/** The `text` type: settings `prefix` and `suffix`, and a character count from the `max` rule. */
export function TextFieldEntry(props: FieldEntryProps) {
    const { field } = props;
    const prefix = getSetting(field, 'prefix', isString);
    const suffix = getSetting(field, 'suffix', isString);
    const max = getRuleNumber(field, 'max');
    return (
        <TextField
            {...getFieldProps(props)}
            value={isString(props.value) ? props.value : null}
            onChange={props.onChange}
            {...(max !== undefined ? { maxLength: max } : {})}
            {...(prefix !== undefined ? { prefix } : {})}
            {...(suffix !== undefined ? { suffix } : {})}
        />
    );
}
