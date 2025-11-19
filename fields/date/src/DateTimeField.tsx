/* eslint-disable react/jsx-props-no-spreading */
// import { PropTypes as PanneauPropTypes } from '@panneau/core';
import format from 'date-fns/format';
import formatISO from 'date-fns/formatISO';
import parse from 'date-fns/parse';
import parseISO from 'date-fns/parseISO';
import isObject from 'lodash-es/isObject';
import React, { useCallback, useEffect, useState } from 'react';
// import classNames from 'classnames';
import DatePicker, { registerLocale } from 'react-datepicker';
import { defineMessage, useIntl } from 'react-intl';

import type { ControlSize, Message } from '@panneau/core/types';
import { isMessage, loadPackage } from '@panneau/core/utils';
import TextField from '@panneau/field-text';

import styles from './styles.module.css';
// We import this one but customized - needs to be improved with bootstrap themes
import 'react-datepicker/dist/react-datepicker.css';

import './styles/datepicker.global.scss';

// This package has fucked exports, no default
const FinalDatePicker =
    isObject(DatePicker) && DatePicker.default ? DatePicker.default : DatePicker;

interface DateTimeFieldProps {
    name?: string | null;
    value?: string | null;
    errors?: unknown;
    size?: ControlSize;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string | Message | null;
    format?: string | null;
    dateFormat?: string;
    withoutDate?: boolean;
    withoutTime?: boolean;
    timeFormat?: string;
    timeCaption?: Message | string | null;
    timeIntervals?: number;
    className?: string | null;
    onChange?: ((value: string | null) => void) | null;
}

function DateTimeField({
    name = null,
    value = null,
    errors = null,
    size = null,
    required = false,
    disabled = false,
    placeholder = null,
    format: fnsFormat = null,
    withoutDate = false,
    withoutTime = false,
    dateFormat = 'yyyy-MM-dd HH:mm:ss',
    timeFormat = 'HH:mm',
    timeCaption: initialTimeCaption = null,
    timeIntervals = 15,
    onChange = null,
    className = null,
}: DateTimeFieldProps) {
    const { locale, formatMessage } = useIntl();
    const timeCaption =
        initialTimeCaption ||
        defineMessage({
            defaultMessage: 'Time',
            description: 'DateTimeField time caption',
        });

    // The internal value of this field must be a Date object
    const parseDate = useCallback(
        (date: string | Date) => {
            if (date instanceof Date) {
                return date;
            }
            if (fnsFormat) {
                return parse(date, fnsFormat, new Date());
            }
            return parseISO(date);
        },
        [fnsFormat],
    );

    const formatDate = useCallback(
        (date: Date) => {
            if (fnsFormat !== null) {
                return format(date, fnsFormat);
            }
            return formatISO(date);
        },
        [fnsFormat],
    );

    const [dateValue, setDateValue] = useState<Date | null>(
        value !== null ? parseDate(value) : null,
    );
    const [loadedLocale, setLoadedLocale] = useState<string | null>(null);
    const onDateChange = useCallback(
        (newDate: Date | null) => {
            setDateValue(newDate);
            const strValue = newDate !== null ? formatDate(newDate) : null;
            if (onChange !== null) {
                onChange(strValue);
            }
        },
        [setDateValue, formatDate, onChange],
    );

    useEffect(() => {
        const localeName = `${locale}-CA`;
        const loader =
            locale === 'fr'
                ? loadPackage('date-fns/locale/fr-CA', () => import('date-fns/locale/fr-CA'))
                : loadPackage('date-fns/locale/en-CA', () => import('date-fns/locale/en-CA'));
        loader.then(({ default: localePackage }) => {
            registerLocale(localeName, localePackage);
            setLoadedLocale(localeName);
        });
    }, [locale, setLoadedLocale]);

    useEffect(() => {
        setDateValue(value !== null ? parseDate(value) : null);
    }, [value, setDateValue, parseDate]);

    const TextFieldComponent = (
        <TextField
            name={name}
            size={size}
            errors={errors}
            required={required}
            className={className}
            disabled={disabled}
            nativeOnChange
        />
    );

    return (
        <div className={styles.container}>
            <FinalDatePicker
                selected={dateValue}
                onChange={onDateChange}
                showTimeSelect={!withoutTime}
                showTimeSelectOnly={withoutDate}
                disabled={disabled}
                customInput={TextFieldComponent}
                placeholderText={isMessage(placeholder) ? formatMessage(placeholder) : placeholder}
                dateFormat={dateFormat}
                locale={loadedLocale}
                timeFormat={timeFormat}
                timeCaption={isMessage(timeCaption) ? formatMessage(timeCaption) : timeCaption}
                timeIntervals={timeIntervals}
                popperClassName={styles.popper}
            />
        </div>
    );
}

export default DateTimeField;
