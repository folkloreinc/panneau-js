import { TextArea } from '@panneau/ui';

import { getFieldProps, getRuleNumber, getSetting, isNumber, isString } from '../shared/entry';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import { useCountedDescription } from '../text/TextField';

export interface TextAreaFieldProps extends FieldProps<string> {
    placeholder?: string;
    /** Shows a count of characters against this maximum. It doesn't stop typing. */
    maxLength?: number;
    /** Visible lines. Defaults to 4. */
    rows?: number;
    textAreaClassName?: string;
}

/** A text of several lines. An empty text is `null`. */
export function TextAreaField({
    value,
    onChange,
    description,
    maxLength,
    disabled,
    readOnly,
    required,
    ...props
}: TextAreaFieldProps) {
    const shownDescription = useCountedDescription(description, value, maxLength);
    return (
        <TextArea
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

/** The `textarea` type: setting `rows`, and a character count from the `max` rule. */
export function TextAreaFieldEntry(props: FieldEntryProps) {
    const max = getRuleNumber(props.field, 'max');
    const rows = getSetting(props.field, 'rows', isNumber);
    return (
        <TextAreaField
            {...getFieldProps(props)}
            value={isString(props.value) ? props.value : null}
            onChange={props.onChange}
            {...(max !== undefined ? { maxLength: max } : {})}
            {...(rows !== undefined ? { rows } : {})}
        />
    );
}
