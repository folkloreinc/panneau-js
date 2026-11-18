import type { ReactNode } from 'react';

import { DatePicker } from '@panneau/ui';

import { toCalendarDate } from '../shared/dates';
import { getFieldProps, isString } from '../shared/entry';
import type { FieldEntryProps, FieldProps } from '../shared/types';

/** A button under a date field that fills it with a date. */
export interface DateShortcut {
    label: ReactNode;
    /**
     * The date it fills in, as an ISO string (`2026-10-15`). `null` disables the button: a date
     * that can't be worked out yet, such as a week after a start that isn't set.
     */
    value: string | null;
}

export interface DateFieldProps extends FieldProps<string> {
    /** Earliest date (`2026-01-01`). */
    min?: string;
    /** Latest date. */
    max?: string;
    controlClassName?: string;
    /**
     * Buttons under the field that fill it with a date: today, yesterday, or a date the app works
     * out from the other values of the form (a year after the start).
     */
    shortcuts?: readonly DateShortcut[];
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
    shortcuts,
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
            {...(shortcuts !== undefined
                ? {
                      shortcuts: shortcuts.map((shortcut) => ({
                          label: shortcut.label,
                          value: toCalendarDate(shortcut.value),
                      })),
                  }
                : {})}
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
