import React, { useState, useEffect } from 'react';
import isObject from 'lodash/isObject';
import IntlProvider from '../../packages/intl/src/IntlProvider';

const withIntlProvider = (Story, { parameters: { intl = null } }) => {
    const enabled = isObject(intl) || intl === true;
    const { locale = 'en', messages = {} } = isObject(intl) ? intl : {};
    const [localeLoaded, setLocaleLoaded] = useState(true);

    useEffect(() => {
        let canceled = false;
        if (enabled) {
            import(`../../packages/intl/locale/${locale}`).then(() => {
                if (!canceled) {
                    setLocaleLoaded(true);
                }
            });
        }
        return () => {
            canceled = true;
        };
    }, [locale]);

    if (!enabled) {
        return (
            <Story />
        );
    }
    return localeLoaded ? (
        <IntlProvider locale={locale} messages={messages}>
            <Story />
        </IntlProvider>
    ) : null;
};

export default withIntlProvider;
