/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useIntl } from 'react-intl';

const defaultLocales: string[] = ['en', 'fr'];

interface LocalesContextValue {
    locales: string[];
}

export const LocalesContext = React.createContext<LocalesContextValue>({ locales: defaultLocales });

export const useLocales = (): LocalesContextValue => {
    const context = useContext(LocalesContext);
    return context;
};

export const useOtherLocales = (): string[] => {
    const { locales } = useLocales();
    const { locale } = useIntl();
    const otherLocales = useMemo(() => locales.filter((it) => it !== locale), [locales, locale]);
    return otherLocales;
};

const DEFAULT_LOCALES: string[] = [];

interface LocalesProviderProps {
    locales?: string[];
    children: ReactNode;
}

function LocalesProvider({ locales = DEFAULT_LOCALES, children }: LocalesProviderProps) {
    const value = useMemo(() => ({ locales }), [locales]);
    return <LocalesContext.Provider value={value}>{children}</LocalesContext.Provider>;
}

export { LocalesProvider };
export default LocalesContext;
