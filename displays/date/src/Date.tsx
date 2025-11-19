import formatDate from 'date-fns/format';
import parse from 'date-fns/parse';
import parseISO from 'date-fns/parseISO';
import React, { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { loadPackage } from '@panneau/core/utils';

interface DateDisplayProps {
    value?: string | null;
    placeholder?: React.ReactNode | null;
    format?: string;
    parseFormat?: string | null;
    locale?: string | null;
    localeLoaders?: Record<string, () => Promise<{ default: unknown }>>;
}

const DEFAULT_LOADERS = {
    fr: () => loadPackage('date-fns/locale/fr-CA', () => import('date-fns/locale/fr-CA')),
    de: () => loadPackage('date-fns/locale/de', () => import('date-fns/locale/de')),
    ja: () => loadPackage('date-fns/locale/ja', () => import('date-fns/locale/ja')),
    es: () => loadPackage('date-fns/locale/es', () => import('date-fns/locale/es')),
    en: () => loadPackage('date-fns/locale/en-US', () => import('date-fns/locale/en-US')),
};

function DateDisplay({
    value = null,
    placeholder = null,
    format = 'yyyy-MM-dd',
    parseFormat = null,
    locale = null,
    localeLoaders = DEFAULT_LOADERS,
}: DateDisplayProps) {
    const { locale: defaultLocale } = useIntl();
    const finalLocale = locale || defaultLocale;
    const [localePackage, setLocalePackage] = useState<unknown>(null);
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
}

export default DateDisplay;
