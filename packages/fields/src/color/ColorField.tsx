import { Select, type SelectOption, usePanneauIntl } from '@panneau/ui';

import { cx } from '../shared/cx';
import { getFieldProps, isString } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps } from '../shared/types';
import { TextField, type TextFieldProps } from '../text/TextField';
import styles from './ColorField.module.css';
import { type ColorPaletteEntry, getColorPalette, getSwatchColor } from './palette';

export interface ColorFieldProps extends Omit<TextFieldProps, 'type' | 'prefix' | 'maxLength'> {
    /**
     * The colors to pick from (decision 0059). With a palette, the field only offers its colors,
     * and the value is the `value` of one of them.
     */
    palette?: readonly ColorPaletteEntry[] | null;
}

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
    palette,
    ...props
}: ColorFieldProps) {
    const intl = usePanneauIntl();
    if (palette !== undefined && palette !== null && palette.length > 0) {
        return (
            <PaletteSelect
                {...props}
                palette={palette}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
                readOnly={readOnly}
            />
        );
    }
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

/** The swatch of a color, decorative: an empty box when it has no color to draw. */
function Swatch({ color }: { color: string | null }) {
    return (
        <span
            className={styles.paletteSwatch}
            style={color !== null ? { backgroundColor: color } : undefined}
        />
    );
}

/**
 * The colors of a palette, as a select whose options show their swatches. It can be emptied
 * unless the field is required. A value outside the palette, kept from before, shows as it is.
 */
function PaletteSelect({
    palette,
    value,
    onChange,
    onBlur,
    disabled,
    readOnly,
    required,
    label,
    description,
    errors,
    name,
    id,
    autoFocus,
    placeholder,
    className,
    labelClassName,
    descriptionClassName,
    errorsClassName,
    controlClassName,
    ...props
}: Omit<ColorFieldProps, 'palette' | 'inputClassName'> & {
    palette: readonly ColorPaletteEntry[];
}) {
    const intl = usePanneauIntl();
    const current = value !== null && value !== undefined && value !== '' ? value : null;
    const entries =
        current !== null && !palette.some((entry) => entry.value === current)
            ? [...palette, { value: current }]
            : palette;
    const options = entries.map((entry): SelectOption => ({
        value: entry.value,
        label: entry.label ?? entry.value,
        prefix: <Swatch color={getSwatchColor(entry)} />,
    }));
    return (
        <Select
            options={options}
            value={current}
            onChange={(next) => onChange?.(typeof next === 'string' ? next : null)}
            label={label}
            description={description}
            errors={errors ?? []}
            isRequired={required}
            isDisabled={disabled === true || readOnly === true}
            placeholder={placeholder ?? intl.formatMessage(messages.pickColor)}
            className={className}
            labelClassName={labelClassName}
            descriptionClassName={descriptionClassName}
            errorsClassName={errorsClassName}
            {...(props['aria-label'] !== undefined ? { 'aria-label': props['aria-label'] } : {})}
            {...(name !== undefined ? { name } : {})}
            {...(id !== undefined ? { id } : {})}
            {...(autoFocus !== undefined ? { autoFocus } : {})}
            {...(onBlur !== undefined ? { onBlur } : {})}
            {...(controlClassName !== undefined ? { triggerClassName: controlClassName } : {})}
        />
    );
}

/** The `color` type: `settings.palette`, the colors to pick from. */
export function ColorFieldEntry(props: FieldEntryProps) {
    const palette = getColorPalette(props.field);
    return (
        <ColorField
            {...getFieldProps(props)}
            value={isString(props.value) ? props.value : null}
            onChange={props.onChange}
            {...(palette !== null ? { palette } : {})}
        />
    );
}
