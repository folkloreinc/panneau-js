import { ReactNode, useContext, useMemo } from 'react';
import { IntlProvider as BaseIntlProvider, IntlContext } from 'react-intl';

import { LocalesProvider, useLocales } from '@panneau/core/contexts';

import IntlManager from './IntlManager';
import defaultManager from './manager';

interface IntlProviderProps {
    intlManager?: IntlManager;
    locale?: string | null;
    locales?: string[] | null;
    extraMessages?: Record<string, string> | null;
    children?: ReactNode;
}

function IntlProvider({
    intlManager = defaultManager,
    locale = null,
    locales = null,
    children = null,
    extraMessages = null,
}: IntlProviderProps) {
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
}

export default IntlProvider;
