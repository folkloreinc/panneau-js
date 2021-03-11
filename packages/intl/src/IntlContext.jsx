import React, { useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { IntlProvider as BaseIntlProvider, IntlContext } from 'react-intl';

import IntlManager from './IntlManager';
import defaultManager from './manager';

const defaultLocales = ['en', 'fr'];

export const LocalesContext = React.createContext(defaultLocales);

export const useLocales = () => useContext(LocalesContext);

export const useOtherLocales = () => {
    const locales = useLocales();
    const { locale } = useContext(IntlContext);
    const otherLocales = useMemo(() => locales.filter(it => it !== locale), [locales, locale]);
    return otherLocales;
}

const propTypes = {
    intlManager: PropTypes.instanceOf(IntlManager),
    locale: PropTypes.string,
    locales: PropTypes.arrayOf(PropTypes.string),
    extraMessages: PropTypes.objectOf(PropTypes.string),
    children: PropTypes.node,
};

const defaultProps = {
    intlManager: defaultManager,
    locale: null,
    locales: null,
    extraMessages: null,
    children: null,
};

export const IntlProvider = ({ intlManager, locale, locales, children, extraMessages }) => {
    const previousLocales = useLocales();
    const { locale: previousLocale = null, messages: previousMessages = null } =
        useContext(IntlContext) || {};
    const messages = useMemo(() => {
        const currentMessages = intlManager.getMessages(locale);
        if (process.env.NODE_ENV === 'development') {
            if (currentMessages === null) {
                console.warn(`IntlProvider: ${locale} is not added.`);
            }
        }
        return {
            ...currentMessages,
            ...extraMessages,
            ...(previousLocale === locale ? previousMessages : null),
        };
    }, [locale, previousLocale, previousMessages, extraMessages]);
    return (
        <BaseIntlProvider locale={locale} messages={messages}>
            <LocalesContext.Provider value={locales || previousLocales}>{children}</LocalesContext.Provider>
        </BaseIntlProvider>
    );
};

IntlProvider.propTypes = propTypes;
IntlProvider.defaultProps = defaultProps;
