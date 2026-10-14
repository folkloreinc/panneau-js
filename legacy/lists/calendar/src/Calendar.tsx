import classNames from 'classnames';
import {
    addDays,
    addMonths,
    addWeeks,
    compareAsc,
    compareDesc,
    endOfWeek,
    format,
    parseISO,
    startOfWeek,
    toDate,
} from 'date-fns';
import type { ComponentType, MouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedDate, useIntl } from 'react-intl';

import type { Item, Resource } from '@panneau/core';
import Button from '@panneau/element-button';
import Icon from '@panneau/element-icon';

import styles from './styles.module.css';

interface CalendarListProps {
    mode?: string;
    resource: Resource;
    component?: ComponentType | null;
    items?: Item[] | null;
    itemDateField?: string;
    loading?: boolean;
    value?: unknown;
    multiple?: boolean;
    onDateChange?: ((date: string | string[] | null) => void) | null;
    onPeriodChange?: ((date: Date) => void) | null;
    initialDate?: string | null;
    className?: string | null;
}

const DEFAULT_ITEMS: Item[] = [];

function CalendarList({
    mode = 'monthly',
    resource: _resource,
    component: _component = null,
    items = DEFAULT_ITEMS,
    itemDateField = 'date',
    loading: _loading = false,
    value = null,
    multiple = false,
    onDateChange = null,
    onPeriodChange = null,
    initialDate = null,
    className = null,
    // onQueryChange
}: CalendarListProps) {
    const intl = useIntl();
    const [monthIdx, setMonthIdx] = useState(0);
    const [weekIdx, setWeekIdx] = useState(0);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDayOfTheMonth = currentDate.getDate();

    const dates = (items || [])
        .map((it) => (it !== null && it[itemDateField] ? it[itemDateField] : null))
        .filter((d) => d !== null) as string[];

    const selectedDates = useMemo<string[]>(() => {
        if (value === null || typeof value === 'undefined') {
            return [];
        }
        return (Array.isArray(value) ? value : [value]).filter(
            (d): d is string => typeof d === 'string',
        );
    }, [value]);

    const activeDate = useMemo(() => {
        const parsedInitialDate = initialDate !== null ? parseISO(initialDate) : null;
        const partialInitialDate =
            parsedInitialDate !== null ? toDate(parsedInitialDate) : new Date();
        const finalInitialDate =
            mode === 'weekly' ? startOfWeek(partialInitialDate) : partialInitialDate;
        return mode === 'weekly'
            ? addWeeks(finalInitialDate, weekIdx)
            : addMonths(finalInitialDate, monthIdx);
    }, [initialDate, mode, weekIdx, monthIdx]);

    const activeYear = activeDate.getFullYear();
    const activeMonth = activeDate.getMonth();
    const activeWeekStart = startOfWeek(activeDate);
    const activeWeekEnd = endOfWeek(activeDate);

    const days = useMemo(
        () => [
            intl.formatMessage({
                defaultMessage: 'S',
                description: 'Sunday letter',
            }),
            intl.formatMessage({
                defaultMessage: 'M',
                description: 'Monday letter',
            }),
            intl.formatMessage({
                defaultMessage: 'T',
                description: 'Tuesday letter',
            }),
            intl.formatMessage({
                defaultMessage: 'W',
                description: 'Wednesday letter',
            }),
            intl.formatMessage({
                defaultMessage: 'T',
                description: 'Thursday letter',
            }),
            intl.formatMessage({
                defaultMessage: 'F',
                description: 'Friday letter',
            }),
            intl.formatMessage({
                defaultMessage: 'S',
                description: 'Saturday letter',
            }),
        ],
        [intl],
    );

    const datesArray: Date[] = [];
    if (mode === 'weekly') {
        for (let i = 0; i < 7; i++) {
            const dte = addDays(activeWeekStart, i);
            datesArray.push(dte);
        }
    } else {
        // Header starts on Sunday, so the offset is the weekday index (0 = Sunday)
        const dayBeforeDiff = new Date(activeYear, activeMonth, 1).getDay();
        const gridMax = 35;

        for (let i = 1 - dayBeforeDiff; i <= gridMax; i++) {
            datesArray.push(new Date(activeYear, activeMonth, i));
        }
    }

    const onClickPeriodChange = useCallback(
        (e: MouseEvent, previous?: boolean) => {
            e.preventDefault();
            if (mode === 'weekly') {
                if (previous) {
                    setWeekIdx(weekIdx - 1);
                } else {
                    setWeekIdx(weekIdx + 1);
                }
            } else if (previous) {
                setMonthIdx(monthIdx - 1);
            } else {
                setMonthIdx(monthIdx + 1);
            }
        },
        [mode, monthIdx, setMonthIdx, weekIdx, setWeekIdx],
    );

    useEffect(() => {
        if (onPeriodChange !== null) {
            onPeriodChange(activeDate);
        }
    }, [activeDate, onPeriodChange]);

    const onSelectDate = useCallback(
        (e: MouseEvent, newDate: string) => {
            e.preventDefault();
            if (!multiple) {
                onDateChange?.(selectedDates.includes(newDate) ? null : newDate);
                return;
            }
            if (!selectedDates.includes(newDate)) {
                onDateChange?.([...selectedDates, newDate]);
            } else {
                onDateChange?.(selectedDates.filter((oldDate) => oldDate !== newDate));
            }
        },
        [selectedDates, onDateChange, multiple],
    );

    const weekHasDates = dates.reduce((acc, dte) => {
        const parseDte = dte !== null ? parseISO(dte) : null;
        if (
            parseDte !== null &&
            compareAsc(parseDte, activeWeekStart) >= 0 &&
            compareDesc(parseDte, activeWeekEnd) >= 0
        ) {
            return true;
        }
        return acc;
    }, false);

    const monthHasDates = dates.reduce((acc, dte) => {
        const splitDate = dte.split(/\s*-\s*/g);
        const [year = null, month = null] = splitDate || [];
        if (
            parseInt(year!, 10) === parseInt(String(activeYear), 10) &&
            parseInt(month!, 10) === parseInt(String(activeMonth), 10) + 1 // yes this is incredibly stupid
        ) {
            return true;
        }
        return acc;
    }, false);

    return (
        <div className={classNames([styles.container, className])}>
            <div className={styles.inner}>
                <div className={styles.calendarHeader}>
                    <Button className={styles.arrow} onClick={(e) => onClickPeriodChange(e, true)}>
                        <Icon name="arrow-left" />
                    </Button>
                    {mode === 'weekly' ? (
                        <div className={styles.activePeriod}>
                            {weekHasDates ? (
                                <span className={styles.activePeriodWithDates}>
                                    <FormattedDate
                                        value={activeDate}
                                        day="numeric"
                                        month="long"
                                        year="numeric"
                                    />
                                </span>
                            ) : (
                                <FormattedDate
                                    value={activeDate}
                                    day="numeric"
                                    month="long"
                                    year="numeric"
                                />
                            )}
                        </div>
                    ) : (
                        <div className={styles.activePeriod}>
                            {monthHasDates ? (
                                <span className={styles.activePeriodWithDates}>
                                    <FormattedDate value={activeDate} month="long" year="numeric" />
                                </span>
                            ) : (
                                <FormattedDate value={activeDate} month="long" year="numeric" />
                            )}
                        </div>
                    )}

                    <Button
                        className={classNames([styles.arrow, styles.right])}
                        onClick={onClickPeriodChange}
                    >
                        <Icon name="arrow-right" />
                    </Button>
                </div>
                <div className={styles.calendarGrid}>
                    {days.map((d, i) => (
                        <div
                            key={`day-${i + 1}`}
                            className={classNames([styles.calendarBox, styles.headerBox])}
                        >
                            {d}
                        </div>
                    ))}
                    {datesArray.map((d, i) => {
                        const dTime = format(d, 'yyyy-MM-dd');

                        const isCurrentYear = d.getFullYear() === currentYear;
                        const isCurrentMonth = d.getMonth() === currentMonth;
                        const isToday =
                            isCurrentYear && isCurrentMonth && d.getDate() === currentDayOfTheMonth;
                        const eventTime = d.getTime();
                        const todayTime = currentDate.getTime();
                        const isPast = eventTime < todayTime && !isToday;
                        const hasItem = dates.includes(dTime);

                        const inner = hasItem ? (
                            <Button
                                onClick={(e) => onSelectDate(e, dTime)}
                                className={classNames(styles.day, styles.dayButton, {
                                    [styles.isToday]: isToday,
                                    [styles.isPast]: isPast,
                                    [styles.active]: selectedDates.includes(dTime),
                                })}
                            >
                                {format(d, 'd')}
                            </Button>
                        ) : (
                            <div
                                className={classNames(styles.day, {
                                    [styles.isToday]: isToday,
                                })}
                            >
                                {format(d, 'd')}
                            </div>
                        );
                        return (
                            <div key={`date-${d.getTime}-${i + 1}`} className={styles.calendarBox}>
                                {d.getMonth() !== activeMonth && mode === 'monthly' ? '' : inner}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default CalendarList;
