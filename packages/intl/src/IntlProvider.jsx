import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { IntlProvider as BaseIntlProvider, useIntl } from 'react-intl';
import { useLocales, LocalesProvider } from '@panneau/core/contexts';

import IntlManager from './IntlManager';
import defaultManager from './manager';

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

const IntlProvider = ({ intlManager, locale, locales, children, extraMessages }) => {
    const previousLocales = useLocales();
    const { locale: previousLocale = null, messages: previousMessages = null } =
        useIntl() || {};
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
            <LocalesProvider locales={locales || previousLocales}>{children}</LocalesProvider>
        </BaseIntlProvider>
    );
};

IntlProvider.propTypes = propTypes;
IntlProvider.defaultProps = defaultProps;

export default IntlProvider;
