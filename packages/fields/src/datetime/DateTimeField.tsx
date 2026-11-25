import { getLocalTimeZone, now } from '@internationalized/date';

import { DatePicker } from '@panneau/ui';

import { TimeZoneLabel } from '../shared/TimeZoneLabel';
import { fromDateTime, toDateTime } from '../shared/dates';
import { getFieldProps, getSetting, isString } from '../shared/entry';
import type { FieldEntryProps, FieldProps } from '../shared/types';

export interface DateTimeFieldProps extends FieldProps<string> {
    /**
     * Time zone the date and time are shown and typed in, for values with an offset. Defaults to
     * the browser's.
     */
    timeZone?: string;
    /** Shows seconds. */
    withSeconds?: boolean;
    /** Defaults to the locale's. */
    hourCycle?: 12 | 24;
    controlClassName?: string;
}

/**
 * A date and a time as an ISO string. Values with an offset (`2026-10-15T13:30:00Z`) are shown in
 * the time zone of the browser, or `timeZone`, and written back in UTC: the control names that
 * zone, with its offset at that date (`Eastern Time (UTC−4)`). Values without one
 * (`2026-10-15T09:30:00`) are kept without one, and have no zone.
 */
export function DateTimeField({
    value,
    onChange,
    timeZone = getLocalTimeZone(),
    withSeconds = false,
    disabled,
    readOnly,
    required,
    ...props
}: DateTimeFieldProps) {
    const current = toDateTime(value, timeZone);
    // A value without an offset is a wall time, in no zone
    const zoned = current === null || 'timeZone' in current;
    return (
        <DatePicker
            {...props}
            granularity={withSeconds ? 'second' : 'minute'}
            hideTimeZone
            value={current}
            {...(zoned
                ? {
                      hint: (
                          <TimeZoneLabel
                              zone={timeZone}
                              date={
                                  current !== null && 'timeZone' in current
                                      ? current.toDate()
                                      : null
                              }
                          />
                      ),
                  }
                : {})}
            onChange={(next) => {
                if (next === null) {
                    onChange?.(null);
                    return;
                }
                if ('hour' in next) {
                    onChange?.(fromDateTime(next));
                }
            }}
            // Typed from empty, a value is in the field's time zone, and written in UTC.
            placeholderValue={current ?? now(timeZone).set({ second: 0, millisecond: 0 })}
            isDisabled={disabled}
            isReadOnly={readOnly}
            isRequired={required}
        />
    );
}

/** The `datetime` type: setting `timeZone`. */
export function DateTimeFieldEntry(props: FieldEntryProps) {
    const timeZone = getSetting(props.field, 'timeZone', isString);
    return (
        <DateTimeField
            {...getFieldProps(props)}
            value={isString(props.value) ? props.value : null}
            onChange={props.onChange}
            {...(timeZone !== undefined ? { timeZone } : {})}
        />
    );
}
