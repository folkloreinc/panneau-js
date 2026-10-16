import { DatePicker } from '@panneau/ui';

import { toCalendarDate } from '../shared/dates';
import { getFieldProps, isString } from '../shared/entry';
import type { FieldEntryProps, FieldProps } from '../shared/types';

export interface DateFieldProps extends FieldProps<string> {
    /** Earliest date (`2026-01-01`). */
    min?: string;
    /** Latest date. */
    max?: string;
    controlClassName?: string;
}

/**
 * A date as an ISO string (`2026-10-15`), typed in the order of the locale or picked in a
 * calendar.
 */
export function DateField({
    value,
    onChange,
    min,
    max,
    disabled,
    readOnly,
    required,
    ...props
}: DateFieldProps) {
    const minValue = toCalendarDate(min);
    const maxValue = toCalendarDate(max);
    return (
        <DatePicker
            {...props}
            granularity="day"
            value={toCalendarDate(value)}
            onChange={(date) => onChange?.(date === null ? null : date.toString().slice(0, 10))}
            {...(minValue !== null ? { minValue } : {})}
            {...(maxValue !== null ? { maxValue } : {})}
            isDisabled={disabled}
            isReadOnly={readOnly}
            isRequired={required}
        />
    );
}

/** The `date` type. */
export function DateFieldEntry(props: FieldEntryProps) {
    return (
        <DateField
            {...getFieldProps(props)}
            value={isString(props.value) ? props.value : null}
            onChange={props.onChange}
        />
    );
}
