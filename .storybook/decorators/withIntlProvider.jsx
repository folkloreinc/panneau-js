import React from 'react';
import isObject from 'lodash/isObject';
import { IntlProvider } from 'react-intl';

const withIntlProvider = (Story, { parameters: { intl = null } }) => {
    const enabled = isObject(intl) || intl === true;
    const { locale = 'en', messages = {} } = isObject(intl) ? intl : {};
    return enabled ? (
        <IntlProvider locale={locale} messages={messages}>
            <Story />
        </IntlProvider>
    ) : (
        <Story />
    );
};

export default withIntlProvider;
