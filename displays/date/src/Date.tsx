import { format as formatDate } from 'date-fns/format';
import type { Locale } from 'date-fns/locale';
import { parse } from 'date-fns/parse';
import { parseISO } from 'date-fns/parseISO';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { loadPackage, parseDateOnly } from '@panneau/core/utils';

interface DateDisplayProps {
    value?: string | null;
    placeholder?: ReactNode | null;
    format?: string;
    parseFormat?: string | null;
    locale?: string | null;
    localeLoaders?: Record<string, () => Promise<{ default: Locale }>>;
}

// date-fns locale typings only declare named exports, so expose them as `default`.
// The module itself is cached by loadPackage since other loaders (ex: DateTimeField) share
// the same cache key and expect the module namespace.
const DEFAULT_LOADERS: Record<string, () => Promise<{ default: Locale }>> = {
    fr: () =>
        loadPackage('date-fns/locale/fr-CA', () => import('date-fns/locale/fr-CA')).then(
            ({ frCA }) => ({
                default: frCA,
            }),
        ),
    de: () =>
        loadPackage('date-fns/locale/de', () => import('date-fns/locale/de')).then(({ de }) => ({
            default: de,
        })),
    ja: () =>
        loadPackage('date-fns/locale/ja', () => import('date-fns/locale/ja')).then(({ ja }) => ({
            default: ja,
        })),
    es: () =>
        loadPackage('date-fns/locale/es', () => import('date-fns/locale/es')).then(({ es }) => ({
            default: es,
        })),
    en: () =>
        loadPackage('date-fns/locale/en-US', () => import('date-fns/locale/en-US')).then(
            ({ enUS }) => ({
                default: enUS,
            }),
        ),
};

// A format without time tokens (ignoring quoted text) displays a calendar day
const isDateOnlyFormat = (format: string): boolean =>
    !/[HhkKmsSaBbp]/.test(format.replace(/'[^']*'/g, ''));

function formatValue(
    value: string,
    format: string,
    parseFormat: string | null,
    localePackage: Locale | null,
): string | null {
    try {
        // Read a date-only value as is, so it doesn't move to the previous day in the
        // browser timezone (ex: 2026-10-01T00:00:00Z is 2026-09-30 in Montreal)
        const dateOnly =
            parseFormat === null && isDateOnlyFormat(format) ? parseDateOnly(value) : null;
        const parsed =
            dateOnly ??
            (parseFormat !== null ? parse(value, parseFormat, new Date()) : parseISO(value));
        return formatDate(parsed, format, localePackage !== null ? { locale: localePackage } : {});
    } catch {
        console.error('An error occured parsing or formatting date');
        return value;
    }
}

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
    const [localePackage, setLocalePackage] = useState<Locale | null>(null);
    useEffect(() => {
        if (typeof localeLoaders[finalLocale] !== 'undefined') {
            localeLoaders[finalLocale]().then(({ default: newLocalePackage }) =>
                setLocalePackage(newLocalePackage),
            );
        }
    }, [finalLocale, localeLoaders]);

    const date = useMemo(
        () => (value !== null ? formatValue(value, format, parseFormat, localePackage) : null),
        [localePackage, value, format, parseFormat],
    );

    return <div>{date || placeholder}</div>;
}

export default DateDisplay;
