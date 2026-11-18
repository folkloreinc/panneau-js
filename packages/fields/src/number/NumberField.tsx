import type { ReactNode } from 'react';

import { NumberInput, RadioGroup, usePanneauIntl } from '@panneau/ui';

import { getFieldProps, getRuleNumber, getSetting, isNumber, isString } from '../shared/entry';
import type { FieldEntryProps, FieldProps } from '../shared/types';

export interface NumberFieldProps extends FieldProps<number> {
    placeholder?: string;
    min?: number;
    max?: number;
    /** Step of the steppers and arrow keys. Defaults to 1. */
    step?: number;
    /** Format of the number, for the locale: decimals, percent, currency. */
    formatOptions?: Intl.NumberFormatOptions;
    /** Content after the number: a unit. */
    suffix?: ReactNode;
    controlClassName?: string;
    inputClassName?: string;
    /**
     * `input` (default): a field to type the number in. `scale`: every whole number from `min` to
     * `max` (1 to 5 by default, by `step`) as joined buttons in one row, for a rating.
     */
    widget?: 'input' | 'scale';
    /** What `min` means, under the first button of a scale: "Not at all". */
    minLabel?: ReactNode;
    /** What `max` means, under the last button of a scale: "Completely". */
    maxLabel?: ReactNode;
}

/** The most buttons a scale shows: beyond, a field to type the number in is easier. */
const MAX_SCALE_STEPS = 11;

/** The values of a scale, from min to max by step: null when there would be too many. */
function getScaleValues(min: number, max: number, step: number): number[] | null {
    if (step <= 0 || max < min || (max - min) / step + 1 > MAX_SCALE_STEPS) {
        return null;
    }
    const values: number[] = [];
    for (let index = 0; min + index * step <= max; index += 1) {
        values.push(min + index * step);
    }
    return values;
}

/**
 * A number, formatted for the locale, typed in a field or picked on a scale (`widget="scale"`). An
 * empty field is `null`.
 */
export function NumberField({
    value,
    onChange,
    min,
    max,
    disabled,
    readOnly,
    required,
    widget = 'input',
    minLabel,
    maxLabel,
    ...props
}: NumberFieldProps) {
    const intl = usePanneauIntl();
    const scale = widget === 'scale' ? getScaleValues(min ?? 1, max ?? 5, props.step ?? 1) : null;
    if (scale !== null) {
        const {
            label,
            description,
            errors,
            name,
            id,
            autoFocus,
            className,
            labelClassName,
            descriptionClassName,
            errorsClassName,
            onBlur,
            formatOptions,
            'aria-label': ariaLabel,
        } = props;
        const format = new Intl.NumberFormat(intl.locale, formatOptions);
        return (
            <RadioGroup
                appearance="scale"
                orientation="horizontal"
                options={scale.map((step) => ({
                    value: step,
                    label: format.format(step),
                }))}
                value={value ?? null}
                onChange={(next) => onChange?.(Number(next))}
                startLabel={minLabel}
                endLabel={maxLabel}
                isDisabled={disabled}
                isReadOnly={readOnly}
                isRequired={required}
                {...(label !== undefined ? { label } : {})}
                {...(description !== undefined ? { description } : {})}
                {...(errors !== undefined ? { errors } : {})}
                {...(name !== undefined ? { name } : {})}
                {...(id !== undefined ? { id } : {})}
                {...(autoFocus !== undefined ? { autoFocus } : {})}
                {...(className !== undefined ? { className } : {})}
                {...(labelClassName !== undefined ? { labelClassName } : {})}
                {...(descriptionClassName !== undefined ? { descriptionClassName } : {})}
                {...(errorsClassName !== undefined ? { errorsClassName } : {})}
                {...(onBlur !== undefined ? { onBlur } : {})}
                {...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {})}
            />
        );
    }
    return (
        <NumberInput
            {...props}
            value={value ?? null}
            onChange={(next) => onChange?.(next)}
            minValue={min}
            maxValue={max}
            isDisabled={disabled}
            isReadOnly={readOnly}
            isRequired={required}
        />
    );
}

/**
 * The `number` type: `min` and `max` from its rules, and settings `step`, `decimals` (the most
 * digits after the decimal point), `suffix`, and `widget` (`scale`) with `minLabel` and `maxLabel`.
 */
export function NumberFieldEntry(props: FieldEntryProps) {
    const { field } = props;
    const min = getRuleNumber(field, 'min');
    const max = getRuleNumber(field, 'max');
    const step = getSetting(field, 'step', isNumber);
    const decimals = getSetting(field, 'decimals', isNumber);
    const suffix = getSetting(field, 'suffix', isString);
    const widget = getSetting(field, 'widget', isString);
    const minLabel = getSetting(field, 'minLabel', isString);
    const maxLabel = getSetting(field, 'maxLabel', isString);
    return (
        <NumberField
            {...getFieldProps(props)}
            value={isNumber(props.value) ? props.value : null}
            onChange={props.onChange}
            {...(min !== undefined ? { min } : {})}
            {...(max !== undefined ? { max } : {})}
            {...(step !== undefined ? { step } : {})}
            {...(decimals !== undefined
                ? { formatOptions: { maximumFractionDigits: decimals } }
                : {})}
            {...(suffix !== undefined ? { suffix } : {})}
            {...(widget === 'scale' ? { widget } : {})}
            {...(minLabel !== undefined ? { minLabel } : {})}
            {...(maxLabel !== undefined ? { maxLabel } : {})}
        />
    );
}
