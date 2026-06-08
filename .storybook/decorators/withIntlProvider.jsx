import isObject from 'lodash/isObject';
import { useEffect, useState } from 'react';

import IntlProvider from '../../packages/intl/src/IntlProvider';

function withIntlProvider(Story, { parameters: { intl = null } }) {
    const enabled = isObject(intl) || intl === true;
    const { locale = 'en', messages = {} } = isObject(intl) ? intl : {};
    const [localeLoaded, setLocaleLoaded] = useState(true);
    const [packageMessages, setPackageMessages] = useState(messages);

    useEffect(() => {
        let canceled = false;
        if (enabled) {
            import(`../../packages/intl/locale/${locale}.json`).then((newMessages) => {
                if (!canceled) {
                    setPackageMessages(newMessages || {});
                    setLocaleLoaded(true);
                }
            });
        }
        return () => {
            canceled = true;
        };
    }, [locale, setPackageMessages]);

    if (!enabled) {
        return <Story />;
    }

    return localeLoaded ? (
        <IntlProvider locale={locale} extraMessages={packageMessages}>
            <Story />
        </IntlProvider>
    ) : null;
}

export default withIntlProvider;
