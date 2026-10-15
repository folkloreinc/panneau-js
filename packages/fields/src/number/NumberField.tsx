import type { ReactNode } from 'react';

import { NumberInput } from '@panneau/ui';

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
}

/** A number, formatted for the locale. An empty field is `null`. */
export function NumberField({
    value,
    onChange,
    min,
    max,
    disabled,
    readOnly,
    required,
    ...props
}: NumberFieldProps) {
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
 * digits after the decimal point) and `suffix`.
 */
export function NumberFieldEntry(props: FieldEntryProps) {
    const { field } = props;
    const min = getRuleNumber(field, 'min');
    const max = getRuleNumber(field, 'max');
    const step = getSetting(field, 'step', isNumber);
    const decimals = getSetting(field, 'decimals', isNumber);
    const suffix = getSetting(field, 'suffix', isString);
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
        />
    );
}
