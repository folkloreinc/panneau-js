import formatDate from 'date-fns/format';
import { de, enUS, es, fr, jp } from 'date-fns/locale';
import parse from 'date-fns/parse';
import parseISO from 'date-fns/parseISO';
import PropTypes from 'prop-types';
import React from 'react';

const formats = {
    fr,
    de,
    jp,
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
    const options =
        locale !== null && typeof formats[locale] !== 'undefined'
            ? { locale: formats[locale] }
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
