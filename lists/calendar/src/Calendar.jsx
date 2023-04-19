/* eslint-disable react/jsx-props-no-spreading */
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
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedDate, useIntl } from 'react-intl';

import { PropTypes as PanneauPropTypes } from '@panneau/core';
// import FormActions from '@panneau/element-item-actions';
// import Loading from '@panneau/element-loading';
import Button from '@panneau/element-button';
import Icon from '@panneau/element-icon';

import styles from './styles.module.scss';

const propTypes = {
    mode: PropTypes.string,
    resource: PanneauPropTypes.resource.isRequired,
    component: PropTypes.func,
    items: PanneauPropTypes.items,
    itemDateField: PropTypes.string,
    loading: PropTypes.bool,
    // onQueryChange: PropTypes.func,
    filter: PropTypes.shape({
        dates: PropTypes.arrayOf(PropTypes.string),
    }),
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.any,
    multiple: PropTypes.bool,
    onDateChange: PropTypes.func,
    onPeriodChange: PropTypes.func,
    initialDate: PropTypes.string,
    className: PropTypes.string,
};

const defaultProps = {
    mode: 'monthly',
    component: null,
    items: [],
    itemDateField: 'date',
    filter: null,
    value: null,
    multiple: false,
    onDateChange: null,
    onPeriodChange: null,
    initialDate: null,
    loading: false,
    className: null,
};

const CalendarList = ({
    mode,
    resource,
    component,
    items,
    itemDateField,
    loading,
    value,
    multiple,
    onDateChange,
    onPeriodChange,
    initialDate,
    className,
    // onQueryChange,
}) => {
    const intl = useIntl();
    const [monthIdx, setMonthIdx] = useState(0);
    const [weekIdx, setWeekIdx] = useState(0);

    const currentDate = new Date();
    const currentYear = currentDate.getUTCFullYear();
    const currentMonth = currentDate.getUTCMonth();
    const currentDayOfTheMonth = currentDate.getDate();

    const dates = (items || [])
        .map((it) => (it !== null && it[itemDateField] ? it[itemDateField] : null))
        .filter((d) => d !== null);

    const parsedInitialDate = initialDate !== null ? parseISO(initialDate) : null;
    const partialInitialDate = parsedInitialDate !== null ? toDate(parsedInitialDate) : new Date();
    const finalInitialDate =
        mode === 'weekly' ? startOfWeek(partialInitialDate) : partialInitialDate;
    const activeDate =
        mode === 'weekly'
            ? addWeeks(finalInitialDate, weekIdx)
            : addMonths(finalInitialDate, monthIdx);

    const activeYear = activeDate.getFullYear();
    const activeMonth = activeDate.getUTCMonth();
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
        [],
    );

    const datesArray = [];
    if (mode === 'weekly') {
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < 7; i++) {
            const dte = addDays(activeWeekStart, i);
            datesArray.push(dte);
        }
    } else {
        const firstDayOfActualMonth = new Date(activeYear, activeMonth, 1).getDay();
        const dayBeforeDiff = firstDayOfActualMonth === 0 ? 6 : firstDayOfActualMonth;
        const gridMax = 35;
        // eslint-disable-next-line no-plusplus
        for (let i = 1 - dayBeforeDiff; i <= gridMax; i++) {
            datesArray.push(new Date(activeYear, activeMonth, i));
        }
    }

    const onClickPeriodChange = useCallback(
        (e, previous) => {
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
        (e, newDate) => {
            e.preventDefault();
            if (!multiple) {
                onDateChange(newDate ? null : newDate);
                return;
            }
            const valuesUpdate = [...dates];
            if (!valuesUpdate.includes(newDate)) {
                onDateChange([newDate]);
            } else {
                const filteredOptions = valuesUpdate.filter((oldDate) => oldDate !== newDate);
                onDateChange(filteredOptions);
            }
        },
        [dates, onDateChange, multiple, value],
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
            parseInt(year, 10) === parseInt(activeYear, 10) &&
            parseInt(month, 10) === parseInt(activeMonth, 10) + 1 // yes this is incredibly stupid
        ) {
            return true;
        }
        return acc;
    }, false);

    return (
        <div
            className={classNames([
                styles.container,
                {
                    [className]: className !== null,
                },
            ])}
        >
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
                            key={`day-${d.getTime}-${i + 1}`}
                            className={classNames([styles.calendarBox, styles.headerBox])}
                        >
                            {d}
                        </div>
                    ))}
                    {datesArray.map((d, i) => {
                        const dTime = format(d, 'yyyy-MM-dd');

                        const isCurrentYear = d.getUTCFullYear() === currentYear;
                        const isCurrentMonth = d.getUTCMonth() === currentMonth;
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
                                    [styles.active]: dates.includes(dTime),
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
                                {d.getUTCMonth() !== activeMonth && mode === 'monthly' ? '' : inner}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

CalendarList.propTypes = propTypes;
CalendarList.defaultProps = defaultProps;

export default CalendarList;
