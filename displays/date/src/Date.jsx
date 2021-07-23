import formatDate from 'date-fns/format';
import { de, enUS, es, frCA, ja } from 'date-fns/locale';
import parse from 'date-fns/parse';
import parseISO from 'date-fns/parseISO';
import PropTypes from 'prop-types';
import React from 'react';
import { useIntl } from 'react-intl';

const formats = {
    fr: frCA,
    de,
    ja,
    es,
    en: enUS,
};

const propTypes = {
    value: PropTypes.string,
    format: PropTypes.string,
    parseFormat: PropTypes.string,
    locale: PropTypes.string,
};

const defaultProps = {
    value: null,
    format: 'yyyy-MM-dd',
    parseFormat: null,
    locale: null,
};

const DateDisplay = ({ value, format, parseFormat, locale }) => {
    const { locale: defaultLocale } = useIntl();
    const finalLocale = locale || defaultLocale;
    const options =
        finalLocale !== null && typeof formats[finalLocale] !== 'undefined'
            ? { locale: formats[finalLocale] }
            : {};
    let date = null;

    try {
        const parsed =
            parseFormat !== null ? parse(value, parseFormat, new Date()) : parseISO(value);
        date = parsed ? formatDate(parsed, format, options) : null;
    } catch {
        console.error('An error occured parsing or formatting date');
        date = value !== null ? value : null;
    }

    return <div>{date !== null ? date : null}</div>;
};

DateDisplay.propTypes = propTypes;
DateDisplay.defaultProps = defaultProps;

export default DateDisplay;
