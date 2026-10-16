import { TimeInput } from '@panneau/ui';

import { fromTime, toTime } from '../shared/dates';
import { getFieldProps, isString } from '../shared/entry';
import type { FieldEntryProps, FieldProps } from '../shared/types';

export interface TimeFieldProps extends FieldProps<string> {
    /** Shows and writes seconds (`09:30:15`). */
    withSeconds?: boolean;
    /** Defaults to the locale's. */
    hourCycle?: 12 | 24;
    controlClassName?: string;
}

/** A time of day as a string, `09:30` (or `09:30:15` with seconds). */
export function TimeField({
    value,
    onChange,
    withSeconds = false,
    disabled,
    readOnly,
    required,
    ...props
}: TimeFieldProps) {
    return (
        <TimeInput
            {...props}
            granularity={withSeconds ? 'second' : 'minute'}
            value={toTime(value)}
            onChange={(next) => onChange?.(next === null ? null : fromTime(next, withSeconds))}
            isDisabled={disabled}
            isReadOnly={readOnly}
            isRequired={required}
        />
    );
}

/** The `time` type: setting `withSeconds`. */
export function TimeFieldEntry(props: FieldEntryProps) {
    return (
        <TimeField
            {...getFieldProps(props)}
            value={isString(props.value) ? props.value : null}
            onChange={props.onChange}
            withSeconds={props.field.settings?.withSeconds === true}
        />
    );
}
