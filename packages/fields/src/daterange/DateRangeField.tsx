import {
    type DateValue,
    getLocalTimeZone,
    now,
    toCalendarDate,
    toCalendarDateTime,
    toZoned,
} from '@internationalized/date';

import { DateRangePicker, Switch, usePanneauIntl } from '@panneau/ui';

import { CodeComboBox } from '../shared/CodeComboBox';
import { fromDateTime, toCalendarDate as parseDay, toDateTime } from '../shared/dates';
import { getFieldProps } from '../shared/entry';
import { messages } from '../shared/messages';
import type { FieldEntryProps, FieldProps } from '../shared/types';
import styles from './DateRangeField.module.css';
import {
    type DateRangeFieldValue,
    getDateRangeSettings,
    getTimeZones,
    isDateRangeValue,
} from './range';

export interface DateRangeFieldProps extends FieldProps<DateRangeFieldValue> {
    /** The bounds are date-times. Without it, days. */
    time?: boolean;
    /** With `time`: an "All day" switch, whose ranges have days as bounds. */
    allDay?: boolean;
    /**
     * The time zone the date-times are shown and typed in, when the value has none. Defaults to
     * the browser's.
     */
    timeZone?: string | null;
    /** With `time`: a menu of time zones, whose choice is kept in the value. */
    chooseTimeZone?: boolean;
    /** Defaults to the locale's. */
    hourCycle?: 12 | 24;
    controlClassName?: string;
}

/** A bound of the picker as a value: a day, or a date-time in UTC (or without an offset). */
function fromBound(bound: DateValue | null, days: boolean): string | null {
    if (bound === null) {
        return null;
    }
    if (days || !('hour' in bound)) {
        return toCalendarDate(bound).toString();
    }
    return fromDateTime(bound);
}

/**
 * A start and an end, checked together (decision 0053): days, or date-times with `time`, in one
 * control with one calendar for both bounds. The value is `{ start, end }`, with `allDay` for an
 * all-day range and the `timeZone` the user chose, or `null` once both bounds are empty.
 *
 * Date-times are shown and typed in the zone of the value, then `timeZone`, then the browser's,
 * and written in UTC. A range typed halfway keeps its empty bound as `null`: the `daterange` rule
 * refuses it unless that bound is open.
 */
export function DateRangeField({
    value,
    onChange,
    onBlur,
    time = false,
    allDay: offersAllDay = false,
    timeZone: fieldZone,
    chooseTimeZone = false,
    hourCycle,
    disabled,
    readOnly,
    required,
    ...props
}: DateRangeFieldProps) {
    const intl = usePanneauIntl();
    const current = isDateRangeValue(value) ? value : null;
    const isAllDay = time && offersAllDay && current?.allDay === true;
    const days = !time || isAllDay;
    const local = getLocalTimeZone();
    const zone = current?.timeZone ?? fieldZone ?? local;
    const chosenZone = chooseTimeZone ? (current?.timeZone ?? fieldZone ?? local) : null;

    const toBound = (bound: string | null | undefined): DateValue | null =>
        days ? parseDay(bound) : toDateTime(bound, zone);

    const emit = (next: {
        start: string | null;
        end: string | null;
        allDay?: boolean;
        timeZone?: string | null;
    }) => {
        if (next.start === null && next.end === null) {
            onChange?.(null);
            return;
        }
        const nextZone = next.timeZone !== undefined ? next.timeZone : chosenZone;
        const nextAllDay = next.allDay ?? isAllDay;
        onChange?.({
            start: next.start,
            end: next.end,
            ...(time && offersAllDay && nextAllDay ? { allDay: true } : {}),
            ...(chooseTimeZone && nextZone !== null ? { timeZone: nextZone } : {}),
        });
    };

    /** The bounds as date-times at the start and the end of their days, or as days. */
    const toggleAllDay = (on: boolean) => {
        if (current === null) {
            return;
        }
        const convert = (bound: string | null, edge: 'start' | 'end'): string | null => {
            if (bound === null) {
                return null;
            }
            if (on) {
                const date = toDateTime(bound, zone);
                return date !== null ? toCalendarDate(date).toString() : null;
            }
            const day = parseDay(bound);
            if (day === null) {
                return null;
            }
            const zoned = toZoned(day, zone).set(
                edge === 'start' ? { hour: 9, minute: 0 } : { hour: 17, minute: 0 },
            );
            return fromDateTime(zoned);
        };
        emit({
            start: convert(current.start, 'start'),
            end: convert(current.end, 'end'),
            allDay: on,
        });
    };

    /** The same wall-clock times in another zone: a range typed in the wrong zone, corrected. */
    const changeZone = (next: string | null) => {
        if (next === null || current === null || days) {
            if (current !== null && next !== null) {
                emit({ start: current.start, end: current.end, timeZone: next });
            }
            return;
        }
        const move = (bound: string | null) => {
            const date = toDateTime(bound, zone);
            return date !== null && 'timeZone' in date
                ? fromDateTime(toZoned(toCalendarDateTime(date), next))
                : bound;
        };
        emit({ start: move(current.start), end: move(current.end), timeZone: next });
    };

    const allDaySwitch =
        time && offersAllDay ? (
            <Switch
                isSelected={isAllDay}
                isDisabled={disabled === true || readOnly === true || current === null}
                onChange={toggleAllDay}
            >
                {intl.formatMessage(messages.allDay)}
            </Switch>
        ) : undefined;

    return (
        <div className={styles.field}>
            <DateRangePicker
                {...props}
                value={
                    current !== null
                        ? { start: toBound(current.start), end: toBound(current.end) }
                        : null
                }
                onChange={(next) =>
                    emit({ start: fromBound(next.start, days), end: fromBound(next.end, days) })
                }
                {...(onBlur !== undefined ? { onBlur } : {})}
                granularity={days ? 'day' : 'minute'}
                // Typed from empty, a date-time is in the zone of the field, and written in UTC.
                {...(!days
                    ? {
                          placeholderValue: now(zone).set({
                              hour: 9,
                              minute: 0,
                              second: 0,
                              millisecond: 0,
                          }),
                      }
                    : {})}
                {...(hourCycle !== undefined ? { hourCycle } : {})}
                hideTimeZone={zone === local}
                {...(allDaySwitch !== undefined ? { end: allDaySwitch } : {})}
                isRequired={required}
                isDisabled={disabled}
                isReadOnly={readOnly}
            />
            {chooseTimeZone && time ? (
                <CodeComboBox
                    label={intl.formatMessage(messages.timeZone)}
                    choices={getTimeZones().map((code) => ({
                        code,
                        name: code.replaceAll('_', ' ').replaceAll('/', ' / '),
                    }))}
                    value={chosenZone}
                    onChange={changeZone}
                    disabled={disabled}
                    readOnly={readOnly}
                    emptyMessage={intl.formatMessage(messages.noTimeZones)}
                    className={styles.timeZone}
                />
            ) : null}
        </div>
    );
}

/** The `daterange` type: settings `time`, `allDay`, `open`, `timeZone` and `chooseTimeZone`. */
export function DateRangeFieldEntry(props: FieldEntryProps) {
    const settings = getDateRangeSettings(props.field.settings);
    return (
        <DateRangeField
            {...getFieldProps(props)}
            value={isDateRangeValue(props.value) ? props.value : null}
            onChange={props.onChange}
            time={settings.time}
            allDay={settings.allDay}
            timeZone={settings.timeZone}
            chooseTimeZone={settings.chooseTimeZone}
        />
    );
}
