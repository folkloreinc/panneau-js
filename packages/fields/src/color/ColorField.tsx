import { usePanneauIntl } from '@panneau/ui';

import { cx } from '../shared/cx';
import { getFieldProps, isString } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps } from '../shared/types';
import { TextField, type TextFieldProps } from '../text/TextField';
import styles from './ColorField.module.css';

export type ColorFieldProps = Omit<TextFieldProps, 'type' | 'prefix' | 'maxLength'>;

/**
 * Normalizes a hexadecimal color: `#` prefix, lowercase, and 3 digits expanded to 6. Returns the
 * text as is when it isn't a hexadecimal color.
 */
export function normalizeColor(value: string): string {
    const trimmed = value.trim().toLowerCase();
    const digits = trimmed.replace(/^#/, '');
    if (/^[0-9a-f]{3}$/.test(digits)) {
        return `#${[...digits].map((digit) => digit + digit).join('')}`;
    }
    if (/^[0-9a-f]{6}$/.test(digits) || /^[0-9a-f]{8}$/.test(digits)) {
        return `#${digits}`;
    }
    return trimmed;
}

/**
 * A color as a hexadecimal value (`#1d4ed8`): typed, or picked with the browser's color picker.
 * The value is normalized on blur.
 */
export function ColorField({
    value,
    onChange,
    onBlur,
    disabled,
    readOnly,
    inputClassName,
    ...props
}: ColorFieldProps) {
    const intl = usePanneauIntl();
    const valid = value !== null && value !== undefined && /^#[0-9a-f]{6}$/i.test(value);
    return (
        <TextField
            autoComplete="off"
            {...props}
            value={value}
            onChange={onChange}
            disabled={disabled}
            readOnly={readOnly}
            inputClassName={cx(styles.input, inputClassName)}
            onBlur={() => {
                if (value !== null && value !== undefined) {
                    const next = normalizeColor(value);
                    if (next !== value) {
                        onChange?.(next === '' ? null : next);
                    }
                }
                onBlur?.();
            }}
            prefix={
                <span
                    className={styles.swatch}
                    style={{ backgroundColor: valid ? value : 'transparent' }}
                >
                    <input
                        type="color"
                        className={styles.picker}
                        value={valid ? value.toLowerCase() : '#000000'}
                        onChange={(event) => onChange?.(event.target.value)}
                        disabled={disabled === true || readOnly === true}
                        aria-label={intl.formatMessage(messages.pickColor)}
                    />
                </span>
            }
        />
    );
}

/** The `color` type. */
export function ColorFieldEntry(props: FieldEntryProps) {
    return (
        <ColorField
            {...getFieldProps(props)}
            value={isString(props.value) ? props.value : null}
            onChange={props.onChange}
        />
    );
}
