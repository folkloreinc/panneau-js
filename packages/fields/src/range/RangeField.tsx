import type { ReactNode } from 'react';

import { Slider } from '@panneau/ui';

import { getFieldProps, getRuleNumber, getSetting, isNumber, isString } from '../shared/entry';
import type { FieldEntryProps, FieldProps } from '../shared/types';

export interface RangeFieldProps extends FieldProps<number> {
    /** The start of the slider. Defaults to 0. */
    min?: number;
    /** The end of the slider. Defaults to 100. */
    max?: number;
    /** Step of the slider and of the arrow keys. Defaults to 1. */
    step?: number;
    /** Format of the number shown, for the locale. */
    formatOptions?: Intl.NumberFormatOptions;
    /** Content after the number: a unit. */
    suffix?: ReactNode;
}

/** A number on a slider. It is `null` until the slider is moved. */
export function RangeField({
    value,
    onChange,
    onBlur,
    min = 0,
    max = 100,
    disabled,
    readOnly,
    required,
    autoFocus: _autoFocus,
    id: _id,
    ...props
}: RangeFieldProps) {
    return (
        <Slider
            {...props}
            value={value ?? null}
            onChange={(next) => onChange?.(next)}
            onChangeEnd={() => onBlur?.()}
            minValue={min}
            maxValue={max}
            isDisabled={disabled === true || readOnly === true}
            isRequired={required}
        />
    );
}

/**
 * The `range` type: its ends from the `min` and `max` rules (0 and 100 without them), and
 * settings `step`, `decimals` and `suffix`, as for `number`.
 */
export function RangeFieldEntry(props: FieldEntryProps) {
    const { field } = props;
    const min = getRuleNumber(field, 'min');
    const max = getRuleNumber(field, 'max');
    const step = getSetting(field, 'step', isNumber);
    const decimals = getSetting(field, 'decimals', isNumber);
    const suffix = getSetting(field, 'suffix', isString);
    const { placeholder: _placeholder, ...fieldProps } = getFieldProps(props);
    return (
        <RangeField
            {...fieldProps}
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
