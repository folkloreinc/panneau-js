import isObject from 'lodash/isObject';

import IntlProvider from '../../packages/intl/src/IntlProvider';

// The translations are registered in ../intl.js
function withIntlProvider(Story, { parameters: { intl = null } }) {
    const enabled = isObject(intl) || intl === true;
    const { locale = 'en', messages = null } = isObject(intl) ? intl : {};

    if (!enabled) {
        return <Story />;
    }

    return (
        <IntlProvider locale={locale} extraMessages={messages}>
            <Story />
        </IntlProvider>
    );
}

export default withIntlProvider;
