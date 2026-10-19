import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    DatePicker as AriaDatePicker,
    type DatePickerProps as AriaDatePickerProps,
    Button,
    Calendar,
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarHeaderCell,
    DateInput,
    DateSegment,
    type DateValue,
    Dialog,
    Group,
    Heading,
} from 'react-aria-components';

import {
    type FieldChromeProps,
    FieldDescription,
    FieldErrors,
    FieldLabel,
    fieldStyles,
} from '../field/FieldParts';
import { Icon } from '../icon/Icon';
import { PopoverSurface } from '../popover/Popover';
import popoverStyles from '../popover/Popover.module.css';
import { cx } from '../utils/cx';
import styles from './DatePicker.module.css';

export interface DatePickerProps
    extends
        Omit<
            AriaDatePickerProps<DateValue>,
            'className' | 'style' | 'children' | 'isInvalid' | 'validate'
        >,
        FieldChromeProps {
    controlClassName?: string;
    popoverClassName?: string;
}

/**
 * A date, or a date and time with `granularity="minute"`, typed segment by segment in the order of
 * the locale, or picked in a calendar. Values are `@internationalized/date` objects.
 */
export function DatePicker({
    label,
    description,
    errors = [],
    isRequired,
    isReadOnly,
    className,
    labelClassName,
    descriptionClassName,
    errorsClassName,
    controlClassName,
    popoverClassName,
    ...props
}: DatePickerProps) {
    const invalid = errors.length > 0;
    return (
        <AriaDatePicker
            {...props}
            isRequired={isRequired}
            isReadOnly={isReadOnly}
            isInvalid={invalid}
            validationBehavior="aria"
            className={cx('panneau-date-picker', fieldStyles.field, className)}
        >
            <FieldLabel isRequired={isRequired} className={labelClassName}>
                {label}
            </FieldLabel>
            <Group
                className={cx(fieldStyles.control, styles.control, controlClassName)}
                data-readonly={isReadOnly || undefined}
            >
                <DateInput className={styles.input}>
                    {(segment) => <DateSegment segment={segment} className={styles.segment} />}
                </DateInput>
                {isReadOnly !== true ? (
                    <Button className={styles.button}>
                        <Icon icon={CalendarDays} />
                    </Button>
                ) : null}
            </Group>
            <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
            <FieldErrors errors={errors} className={errorsClassName} />
            <PopoverSurface className={popoverClassName}>
                <Dialog className={popoverStyles.dialog}>
                    <Calendar className={styles.calendar}>
                        <header className={styles.header}>
                            <Button slot="previous" className={styles.button}>
                                <Icon icon={ChevronLeft} />
                            </Button>
                            <Heading className={styles.heading} />
                            <Button slot="next" className={styles.button}>
                                <Icon icon={ChevronRight} />
                            </Button>
                        </header>
                        <CalendarGrid className={styles.grid}>
                            <CalendarGridHeader>
                                {(day) => (
                                    <CalendarHeaderCell className={styles.weekday}>
                                        {day}
                                    </CalendarHeaderCell>
                                )}
                            </CalendarGridHeader>
                            <CalendarGridBody>
                                {(date) => <CalendarCell date={date} className={styles.cell} />}
                            </CalendarGridBody>
                        </CalendarGrid>
                    </Calendar>
                </Dialog>
            </PopoverSurface>
        </AriaDatePicker>
    );
}
