/* eslint-disable react/jsx-props-no-spreading */
// import { PropTypes as PanneauPropTypes } from '@panneau/core';
import format from 'date-fns/format';
import formatISO from 'date-fns/formatISO';
import parse from 'date-fns/parse';
import parseISO from 'date-fns/parseISO';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
// import classNames from 'classnames';
import DatePicker, { registerLocale } from 'react-datepicker';
import { defineMessage, useIntl } from 'react-intl';

import { isMessage, loadPackage } from '@panneau/core/utils';
import TextField from '@panneau/field-text';

import styles from './styles.module.scss';
import './styles/datepicker.global.scss';

// We import this one but customized - needs to be improved with bootstrap themes
import 'react-datepicker/dist/react-datepicker.css';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
    errors: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    size: PropTypes.oneOf(['sm', 'lg']),
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    format: PropTypes.string, // The actual date format, see https://date-fns.org/v2.22.1/docs/format
    dateFormat: PropTypes.string, // Format for react-datepicker
    withoutDate: PropTypes.bool, // Format for react-datepicker
    withoutTime: PropTypes.bool,
    timeFormat: PropTypes.string,
    timeCaption: PropTypes.any, // eslint-disable-line react/forbid-prop-types
    timeIntervals: PropTypes.number,
    className: PropTypes.string,
    onChange: PropTypes.func,
};

const defaultProps = {
    name: null,
    value: null,
    errors: null,
    size: null,
    required: false,
    disabled: false,
    placeholder: null,
    format: null,
    withoutDate: false,
    withoutTime: false,
    dateFormat: 'yyyy-MM-dd HH:mm:ss',
    timeFormat: 'HH:mm',
    timeCaption: defineMessage({
        defaultMessage: 'Time',
        description: 'DateTimeField time caption',
    }),
    timeIntervals: 15,
    className: null,
    onChange: null,
};

const DateTimeField = ({
    name,
    value,
    errors,
    size,
    required,
    disabled,
    placeholder,
    format: fnsFormat,
    withoutDate,
    withoutTime,
    dateFormat,
    timeFormat,
    timeCaption,
    timeIntervals,
    onChange,
    className,
}) => {
    const { locale, formatMessage } = useIntl();

    // The internal value of this field must be a Date object
    const parseDate = useCallback(
        (date) => {
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
        (date) => {
            if (fnsFormat !== null) {
                return format(date, fnsFormat);
            }
            return formatISO(date);
        },
        [fnsFormat],
    );

    const [dateValue, setDateValue] = useState(value !== null ? parseDate(value) : null);
    const [loadedLocale, setLoadedLocale] = useState(null);
    const onDateChange = useCallback(
        (newDate) => {
            setDateValue(newDate);
            const strValue = newDate !== null ? formatDate(newDate, dateFormat) : null;
            if (onChange !== null) {
                onChange(strValue);
            }
        },
        [setDateValue, dateFormat, onChange],
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
            <DatePicker
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
};

DateTimeField.propTypes = propTypes;
DateTimeField.defaultProps = defaultProps;

export default DateTimeField;
