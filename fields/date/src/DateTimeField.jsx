/* eslint-disable react/jsx-props-no-spreading */
// import { PropTypes as PanneauPropTypes } from '@panneau/core';
import { isMessage } from '@panneau/core/utils';
import TextField from '@panneau/field-text';
import formatDate from 'date-fns/format';
import parse from 'date-fns/parseISO';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
// import classNames from 'classnames';
import DatePicker, { registerLocale } from 'react-datepicker';
import { defineMessage, useIntl } from 'react-intl';

import styles from './styles.module.scss';
import './styles/datepicker.global.scss';

const propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
    errors: PropTypes.any, // eslint-disable-line
    size: PropTypes.oneOf(['sm', 'lg']),
    required: PropTypes.bool,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    dateFormat: PropTypes.string,
    withoutDate: PropTypes.bool,
    withoutTime: PropTypes.bool,
    timeFormat: PropTypes.string,
    timeCaption: PropTypes.any, // eslint-disable-line
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
    dateFormat: 'yyyy-MM-dd HH:mm:ss',
    withoutDate: false,
    withoutTime: false,
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
    dateFormat,
    withoutDate,
    withoutTime,
    timeFormat,
    timeCaption,
    timeIntervals,
    onChange,
    className,
}) => {
    const { locale, formatMessage } = useIntl();
    const [dateValue, setDateValue] = useState(value !== null ? parse(value) : null);
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
            locale === 'fr' ? import('date-fns/locale/fr-CA') : import('date-fns/locale/en-CA');
        loader.then(({ default: localePackage }) => {
            registerLocale(localeName, localePackage);
            setLoadedLocale(localeName);
        });
    }, [locale, setLoadedLocale]);

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
            />
        </div>
    );
};

DateTimeField.propTypes = propTypes;
DateTimeField.defaultProps = defaultProps;

export default DateTimeField;
