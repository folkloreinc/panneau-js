import { getFieldProps, isString } from '../shared/entry';
import type { FieldEntryProps } from '../shared/types';
import { TextField, type TextFieldProps } from '../text/TextField';

export type EmailFieldProps = Omit<TextFieldProps, 'type' | 'inputMode'>;

/** An email address, with the email keyboard on phones. Spaces around it are removed on blur. */
export function EmailField({ value, onChange, onBlur, ...props }: EmailFieldProps) {
    return (
        <TextField
            autoComplete="off"
            {...props}
            type="email"
            inputMode="email"
            value={value}
            onChange={onChange}
            onBlur={() => {
                const trimmed = value?.trim() ?? null;
                if (trimmed !== value) {
                    onChange?.(trimmed === '' ? null : trimmed);
                }
                onBlur?.();
            }}
        />
    );
}

/** The `email` type. */
export function EmailFieldEntry(props: FieldEntryProps) {
    return (
        <EmailField
            {...getFieldProps(props)}
            value={isString(props.value) ? props.value : null}
            onChange={props.onChange}
        />
    );
}
