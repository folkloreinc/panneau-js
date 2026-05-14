import { ReactNode, use, useMemo } from 'react';
import { IntlProvider as BaseIntlProvider, IntlConfig, IntlContext } from 'react-intl';

import { LocalesProvider, useLocales } from '@panneau/core/contexts';

import IntlManager from './IntlManager';
import defaultManager from './manager';

interface IntlProviderProps extends Omit<IntlConfig, 'locale' | 'messages'> {
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
    ...props
}: IntlProviderProps) {
    const previousLocales = useLocales();
    const { locale: previousLocale = null, messages: previousMessages = null } =
        use(IntlContext) || {};
    const managerMessages = intlManager !== null ? intlManager.getMessages(locale) : null;
    const messages = useMemo(() => {
        if (process.env.NODE_ENV === 'development') {
            if (managerMessages === null) {
                console.warn(`IntlProvider: ${locale} is not added.`);
            }
        }
        return {
            ...(previousLocale === locale || locale === null ? previousMessages : null),
            ...managerMessages,
            ...extraMessages,
        };
    }, [managerMessages, locale, previousLocale, previousMessages, extraMessages]);
    return (
        <BaseIntlProvider locale={locale || previousLocale} messages={messages} {...props}>
            <LocalesProvider locales={locales || previousLocales}>{children}</LocalesProvider>
        </BaseIntlProvider>
    );
}

export default IntlProvider;
