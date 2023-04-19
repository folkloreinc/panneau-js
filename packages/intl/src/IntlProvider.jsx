import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';
import { IntlProvider as BaseIntlProvider, IntlContext } from 'react-intl';

import { LocalesProvider, useLocales } from '@panneau/core/contexts';

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
        useContext(IntlContext) || {};
    const managerMessages = intlManager !== null ? intlManager.getMessages(locale) : null;
    const messages = useMemo(() => {
        if (process.env.NODE_ENV === 'development') {
            if (managerMessages === null) {
                console.warn(`IntlProvider: ${locale} is not added.`);
            }
        }
        return {
            ...(previousLocale === locale ? previousMessages : null),
            ...managerMessages,
            ...extraMessages,
        };
    }, [managerMessages, locale, previousLocale, previousMessages, extraMessages]);
    return (
        <BaseIntlProvider locale={locale} messages={messages}>
            <LocalesProvider locales={locales || previousLocales}>{children}</LocalesProvider>
        </BaseIntlProvider>
    );
};

IntlProvider.propTypes = propTypes;
IntlProvider.defaultProps = defaultProps;

export default IntlProvider;
