import { getFieldProps, isString } from '../shared/entry';
import type { FieldEntryProps } from '../shared/types';
import { TextField, type TextFieldProps } from '../text/TextField';

export type TelFieldProps = Omit<TextFieldProps, 'type' | 'inputMode'>;

/**
 * A phone number, as typed, with the phone keyboard on phones. Spaces around it are removed on
 * blur. A `pattern` rule constrains its format when a project needs one.
 */
export function TelField({ value, onChange, onBlur, ...props }: TelFieldProps) {
    return (
        <TextField
            autoComplete="tel"
            {...props}
            type="tel"
            inputMode="tel"
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

/** The `tel` type. */
export function TelFieldEntry(props: FieldEntryProps) {
    return (
        <TelField
            {...getFieldProps(props)}
            value={isString(props.value) ? props.value : null}
            onChange={props.onChange}
        />
    );
}
