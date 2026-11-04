import { type CalendarDate, toCalendarDate } from '@internationalized/date';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Fragment, type ReactNode, useId } from 'react';
import {
    Button,
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarHeaderCell,
    DateField,
    DateInput,
    DateSegment,
    type DateValue,
    Dialog,
    DialogTrigger,
    Heading,
    RangeCalendar,
} from 'react-aria-components';

import datePickerStyles from '../date-picker/DatePicker.module.css';
import fieldStyles from '../field/Field.module.css';
import type { FieldChromeProps } from '../field/FieldParts';
import { Icon } from '../icon/Icon';
import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { PopoverSurface } from '../popover/Popover';
import popoverStyles from '../popover/Popover.module.css';
import { cx } from '../utils/cx';
import styles from './DateRangePicker.module.css';

/** The bounds of a range, each `null` while it is empty. */
export interface DateRangePickerValue {
    start: DateValue | null;
    end: DateValue | null;
}

export interface DateRangePickerProps extends FieldChromeProps {
    /** The bounds, as `@internationalized/date` objects. */
    value?: DateRangePickerValue | null;
    /** Called with the bounds as they change: either can be `null` while the other is typed. */
    onChange?: (value: DateRangePickerValue) => void;
    onBlur?: () => void;
    /** `day` for dates, `minute` or `second` for dates and times. */
    granularity?: 'day' | 'hour' | 'minute' | 'second';
    /** The first value of an empty bound: its time and its time zone. */
    placeholderValue?: DateValue;
    hourCycle?: 12 | 24;
    hideTimeZone?: boolean;
    minValue?: DateValue;
    maxValue?: DateValue;
    isRequired?: boolean;
    isDisabled?: boolean;
    isReadOnly?: boolean;
    autoFocus?: boolean;
    /** Accessible label, without a visible one. */
    'aria-label'?: string;
    /** Content at the end of the control, before the calendar: an "All day" switch, a time zone. */
    end?: ReactNode;
    controlClassName?: string;
    popoverClassName?: string;
}

/** A day of the calendar as a bound: the day of the bound, its time and zone kept, if any. */
function withDay(
    day: CalendarDate,
    bound: DateValue | null,
    placeholder: DateValue | undefined,
    hasTime: boolean,
): DateValue {
    const base = bound ?? (hasTime ? placeholder : undefined);
    if (base === undefined || !('hour' in base)) {
        return day;
    }
    return base.set({ year: day.year, month: day.month, day: day.day });
}

/**
 * A range of dates, or of dates and times: the start and the end, typed segment by segment in the
 * order of the locale, and one calendar that picks both in two clicks. Unlike a date range picker
 * of React Aria, either bound can stay empty, for a range open at one end. Values are
 * `@internationalized/date` objects.
 */
export function DateRangePicker({
    label,
    description,
    errors = [],
    value,
    onChange,
    onBlur,
    granularity = 'day',
    placeholderValue,
    hourCycle,
    hideTimeZone,
    minValue,
    maxValue,
    isRequired,
    isDisabled,
    isReadOnly,
    autoFocus,
    end: endContent,
    className,
    labelClassName,
    descriptionClassName,
    errorsClassName,
    controlClassName,
    popoverClassName,
    ...props
}: DateRangePickerProps) {
    const intl = usePanneauIntl();
    const id = useId();
    const invalid = errors.length > 0;
    const hasTime = granularity !== 'day';
    const start = value?.start ?? null;
    const end = value?.end ?? null;
    const hasLabel = label !== undefined && label !== null;
    const describedBy = [
        description !== undefined && description !== null ? `${id}-description` : null,
        invalid ? `${id}-errors` : null,
    ]
        .filter((part) => part !== null)
        .join(' ');
    const bound = (which: 'start' | 'end') => {
        const current = which === 'start' ? start : end;
        return (
            <DateField
                aria-label={intl.formatMessage(
                    which === 'start' ? messages.rangeStart : messages.rangeEnd,
                )}
                {...(describedBy !== '' ? { 'aria-describedby': describedBy } : {})}
                value={current}
                onChange={(next) => onChange?.({ start, end, [which]: next })}
                onBlur={() => onBlur?.()}
                granularity={granularity}
                {...(placeholderValue !== undefined ? { placeholderValue } : {})}
                {...(hourCycle !== undefined ? { hourCycle } : {})}
                {...(hideTimeZone !== undefined ? { hideTimeZone } : {})}
                {...(minValue !== undefined ? { minValue } : {})}
                {...(maxValue !== undefined ? { maxValue } : {})}
                isRequired={isRequired}
                isDisabled={isDisabled}
                isReadOnly={isReadOnly}
                isInvalid={invalid}
                validationBehavior="aria"
                autoFocus={which === 'start' ? autoFocus : undefined}
                className={styles.bound}
            >
                <DateInput className={datePickerStyles.input}>
                    {(segment) => (
                        <DateSegment segment={segment} className={datePickerStyles.segment} />
                    )}
                </DateInput>
            </DateField>
        );
    };
    return (
        <div
            role="group"
            aria-labelledby={hasLabel ? `${id}-label` : undefined}
            aria-label={hasLabel ? undefined : props['aria-label']}
            className={cx('panneau-date-range-picker', fieldStyles.field, className)}
        >
            {hasLabel ? (
                <span id={`${id}-label`} className={cx(fieldStyles.label, labelClassName)}>
                    {label}
                    {isRequired === true ? (
                        <span className={fieldStyles.required} aria-hidden="true">
                            *
                        </span>
                    ) : null}
                </span>
            ) : null}
            <div
                className={cx(
                    fieldStyles.control,
                    datePickerStyles.control,
                    styles.control,
                    controlClassName,
                )}
                data-invalid={invalid || undefined}
                data-disabled={isDisabled || undefined}
                data-readonly={isReadOnly || undefined}
            >
                <div className={styles.bounds}>
                    {bound('start')}
                    <span className={styles.dash} aria-hidden="true">
                        –
                    </span>
                    {bound('end')}
                </div>
                {endContent !== undefined && endContent !== null ? (
                    <div className={styles.end}>{endContent}</div>
                ) : null}
                {isReadOnly !== true ? (
                    <DialogTrigger>
                        <Button
                            aria-label={intl.formatMessage(messages.calendar)}
                            isDisabled={isDisabled}
                            className={datePickerStyles.button}
                        >
                            <Icon icon={CalendarDays} />
                        </Button>
                        <PopoverSurface
                            className={cx(datePickerStyles.popover, popoverClassName)}
                            placement="bottom end"
                        >
                            <Dialog
                                className={popoverStyles.dialog}
                                aria-label={intl.formatMessage(messages.calendar)}
                            >
                                {({ close }) => (
                                    <RangeCalendar
                                        className={datePickerStyles.calendar}
                                        value={
                                            start !== null && end !== null
                                                ? {
                                                      start: toCalendarDate(start),
                                                      end: toCalendarDate(end),
                                                  }
                                                : null
                                        }
                                        {...(start !== null || end !== null
                                            ? {
                                                  defaultFocusedValue: toCalendarDate(
                                                      (start ?? end) as DateValue,
                                                  ),
                                              }
                                            : {})}
                                        {...(minValue !== undefined
                                            ? { minValue: toCalendarDate(minValue) }
                                            : {})}
                                        {...(maxValue !== undefined
                                            ? { maxValue: toCalendarDate(maxValue) }
                                            : {})}
                                        onChange={(range) => {
                                            onChange?.({
                                                start: withDay(
                                                    range.start,
                                                    start,
                                                    placeholderValue,
                                                    hasTime,
                                                ),
                                                end: withDay(
                                                    range.end,
                                                    end,
                                                    placeholderValue,
                                                    hasTime,
                                                ),
                                            });
                                            close();
                                        }}
                                    >
                                        <header className={datePickerStyles.header}>
                                            <Button
                                                slot="previous"
                                                className={datePickerStyles.navButton}
                                            >
                                                <Icon icon={ChevronLeft} />
                                            </Button>
                                            <Heading className={datePickerStyles.heading} />
                                            <Button
                                                slot="next"
                                                className={datePickerStyles.navButton}
                                            >
                                                <Icon icon={ChevronRight} />
                                            </Button>
                                        </header>
                                        <CalendarGrid className={datePickerStyles.grid}>
                                            <CalendarGridHeader>
                                                {(day) => (
                                                    <CalendarHeaderCell
                                                        className={datePickerStyles.weekday}
                                                    >
                                                        {day}
                                                    </CalendarHeaderCell>
                                                )}
                                            </CalendarGridHeader>
                                            <CalendarGridBody>
                                                {(date) => (
                                                    <CalendarCell
                                                        date={date}
                                                        className={cx(
                                                            datePickerStyles.cell,
                                                            styles.cell,
                                                        )}
                                                    />
                                                )}
                                            </CalendarGridBody>
                                        </CalendarGrid>
                                    </RangeCalendar>
                                )}
                            </Dialog>
                        </PopoverSurface>
                    </DialogTrigger>
                ) : null}
            </div>
            {description !== undefined && description !== null ? (
                <div
                    id={`${id}-description`}
                    className={cx(fieldStyles.description, descriptionClassName)}
                >
                    {description}
                </div>
            ) : null}
            {invalid ? (
                <div id={`${id}-errors`} className={cx(fieldStyles.errors, errorsClassName)}>
                    {errors.map((error, index) => (
                        <Fragment key={index}>
                            {index > 0 ? ' ' : null}
                            <span className={fieldStyles.error}>{error}</span>
                        </Fragment>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
