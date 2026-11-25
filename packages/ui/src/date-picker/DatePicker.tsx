import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { type ReactNode, use, useId } from 'react';
import {
    DatePicker as AriaDatePicker,
    type DatePickerProps as AriaDatePickerProps,
    Button,
    ButtonContext,
    Calendar,
    CalendarCell,
    CalendarGrid,
    CalendarGridBody,
    CalendarGridHeader,
    CalendarHeaderCell,
    DateInput,
    DatePickerStateContext,
    DateSegment,
    type DateValue,
    Dialog,
    Group,
    Heading,
} from 'react-aria-components';

import { Button as PanneauButton } from '../button/Button';
import {
    type FieldChromeProps,
    FieldDescription,
    FieldErrors,
    FieldLabel,
    fieldStyles,
} from '../field/FieldParts';
import { Icon } from '../icon/Icon';
import { messages } from '../intl/messages';
import { usePanneauIntl } from '../intl/usePanneauIntl';
import { PopoverSurface } from '../popover/Popover';
import popoverStyles from '../popover/Popover.module.css';
import { TimeInput } from '../time-input/TimeInput';
import { cx } from '../utils/cx';
import styles from './DatePicker.module.css';

/** The time of a date and time, under the calendar: the calendar alone can't set it. */
function CalendarTime() {
    const intl = usePanneauIntl();
    const state = use(DatePickerStateContext);
    if (state === null || !state.hasTime) {
        return null;
    }
    const granularity = state.granularity === 'day' ? 'minute' : state.granularity;
    return (
        <TimeInput
            label={intl.formatMessage(messages.time)}
            value={state.timeValue}
            onChange={(value) => {
                if (value !== null) {
                    state.setTimeValue(value);
                }
            }}
            granularity={granularity}
            className={styles.time}
        />
    );
}

/** A button under a date picker that fills it with a date: today, a week after the start. */
export interface DatePickerShortcut {
    label: ReactNode;
    /** The date it fills in. `null` disables the button: a date that can't be worked out yet. */
    value: DateValue | null;
}

/** The shortcuts of a date picker, under its control. */
function DatePickerShortcuts({
    shortcuts,
    isDisabled,
}: {
    shortcuts: readonly DatePickerShortcut[];
    isDisabled: boolean;
}) {
    const intl = usePanneauIntl();
    const state = use(DatePickerStateContext);
    if (shortcuts.length === 0 || state === null) {
        return null;
    }
    // The date picker gives its context to the buttons inside it, for the one that opens the
    // calendar: the shortcuts are buttons of their own
    return (
        <ButtonContext value={null}>
            <div
                role="group"
                aria-label={intl.formatMessage(messages.dateShortcuts)}
                className={styles.shortcuts}
            >
                {shortcuts.map((shortcut, index) => {
                    const { value } = shortcut;
                    return (
                        <PanneauButton
                            key={index}
                            size="sm"
                            appearance="subtle"
                            isDisabled={isDisabled || value === null}
                            onPress={() => {
                                if (value !== null) {
                                    state.setValue(value);
                                }
                            }}
                        >
                            {shortcut.label}
                        </PanneauButton>
                    );
                })}
            </div>
        </ButtonContext>
    );
}

export interface DatePickerProps
    extends
        Omit<
            AriaDatePickerProps<DateValue>,
            'className' | 'style' | 'children' | 'isInvalid' | 'validate'
        >,
        FieldChromeProps {
    controlClassName?: string;
    popoverClassName?: string;
    /**
     * Buttons under the control that fill it with a date, such as today, or a date worked out from
     * other values of the form.
     */
    shortcuts?: readonly DatePickerShortcut[];
    /** Content at the end of the control, before the calendar button. */
    end?: ReactNode;
    /**
     * A line under the control, styled as its description and before it, which describes the
     * control: the time zone of its date-times. It keeps the control on one line.
     */
    hint?: ReactNode;
}

/**
 * A date, or a date and time with `granularity="minute"`, typed segment by segment in the order of
 * the locale, or picked in a calendar. With a time, the calendar has a field for it, and stays
 * open after a day is picked. Values are `@internationalized/date` objects.
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
    shortcuts = [],
    end,
    hint,
    ...props
}: DatePickerProps) {
    const hintId = useId();
    const hasHint = hint !== undefined && hint !== null;
    const describedBy = [props['aria-describedby'], hasHint ? hintId : undefined]
        .filter((part) => part !== undefined && part !== '')
        .join(' ');
    const invalid = errors.length > 0;
    const hasTime =
        props.granularity === 'hour' ||
        props.granularity === 'minute' ||
        props.granularity === 'second';
    return (
        <AriaDatePicker
            shouldCloseOnSelect={!hasTime}
            {...props}
            {...(describedBy !== '' ? { 'aria-describedby': describedBy } : {})}
            isRequired={isRequired}
            isReadOnly={isReadOnly}
            isInvalid={invalid}
            validationBehavior="aria"
            className={cx(
                'panneau-date-picker',
                fieldStyles.field,
                end !== undefined && end !== null && styles.withEnd,
                className,
            )}
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
                {end !== undefined && end !== null ? <div className={styles.end}>{end}</div> : null}
                {isReadOnly !== true ? (
                    <Button className={styles.button}>
                        <Icon icon={CalendarDays} />
                    </Button>
                ) : null}
            </Group>
            {hasHint ? (
                <div id={hintId} className={fieldStyles.description}>
                    {hint}
                </div>
            ) : null}
            <DatePickerShortcuts
                shortcuts={shortcuts}
                isDisabled={props.isDisabled === true || isReadOnly === true}
            />
            <FieldDescription className={descriptionClassName}>{description}</FieldDescription>
            <FieldErrors errors={errors} className={errorsClassName} />
            <PopoverSurface className={cx(styles.popover, popoverClassName)}>
                <Dialog className={popoverStyles.dialog}>
                    <Calendar className={styles.calendar}>
                        <header className={styles.header}>
                            <Button slot="previous" className={styles.navButton}>
                                <Icon icon={ChevronLeft} />
                            </Button>
                            <Heading className={styles.heading} />
                            <Button slot="next" className={styles.navButton}>
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
                    <CalendarTime />
                </Dialog>
            </PopoverSurface>
        </AriaDatePicker>
    );
}
