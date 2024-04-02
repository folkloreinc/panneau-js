import formatDate from 'date-fns/format';
import parse from 'date-fns/parse';
import parseISO from 'date-fns/parseISO';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { loadPackage } from '@panneau/core/utils';

const propTypes = {
    value: PropTypes.string,
    placeholder: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    format: PropTypes.string,
    parseFormat: PropTypes.string,
    locale: PropTypes.string,
    localeLoaders: PropTypes.objectOf(PropTypes.func),
};

const defaultProps = {
    value: null,
    placeholder: null,
    format: 'yyyy-MM-dd',
    parseFormat: null,
    locale: null,
    localeLoaders: {
        fr: () => loadPackage('date-fns/locale/fr-CA', () => import('date-fns/locale/fr-CA')),
        de: () => loadPackage('date-fns/locale/de', () => import('date-fns/locale/de')),
        ja: () => loadPackage('date-fns/locale/ja', () => import('date-fns/locale/ja')),
        es: () => loadPackage('date-fns/locale/es', () => import('date-fns/locale/es')),
        en: () => loadPackage('date-fns/locale/en-US', () => import('date-fns/locale/en-US')),
    },
};

const DateDisplay = ({ value, placeholder, format, parseFormat, locale, localeLoaders }) => {
    const { locale: defaultLocale } = useIntl();
    const finalLocale = locale || defaultLocale;
    const [localePackage, setLocalePackage] = useState(null);
    useEffect(() => {
        if (typeof localeLoaders[finalLocale] !== 'undefined') {
            localeLoaders[finalLocale]().then(({ default: newLocalePackage }) =>
                setLocalePackage(newLocalePackage),
            );
        }
    }, [finalLocale, localeLoaders]);

    const date = useMemo(() => {
        if (value === null) {
            return null;
        }
        let newDate = null;
        try {
            const parsed =
                parseFormat !== null ? parse(value, parseFormat, new Date()) : parseISO(value);
            newDate = parsed
                ? formatDate(
                      parsed,
                      format,
                      localePackage !== null ? { locale: localePackage } : {},
                  )
                : null;
        } catch {
            console.error('An error occured parsing or formatting date');
            newDate = value !== null ? value : null;
        }
        return newDate;
    }, [localePackage, value, format, parseFormat]);

    return <div>{date || placeholder}</div>;
};

DateDisplay.propTypes = propTypes;
DateDisplay.defaultProps = defaultProps;

export default DateDisplay;
