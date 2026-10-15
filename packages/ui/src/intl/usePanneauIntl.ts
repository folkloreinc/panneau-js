import { use } from 'react';
import { IntlContext, type IntlShape, createIntl, createIntlCache } from 'react-intl';

let fallback: IntlShape | null = null;

/**
 * The react-intl object of the closest `IntlProvider`. Without a provider, an English one with the
 * default messages, so that Panneau components also render outside of an internationalized app.
 */
export function usePanneauIntl(): IntlShape {
    const intl = use(IntlContext) as IntlShape | null | undefined;
    if (intl !== null && intl !== undefined) {
        return intl;
    }
    fallback ??= createIntl({ locale: 'en', defaultLocale: 'en', messages: {} }, createIntlCache());
    return fallback;
}
