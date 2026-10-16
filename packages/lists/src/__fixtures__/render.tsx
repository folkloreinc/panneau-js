import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { IntlProvider } from 'react-intl';

import { PanneauRoot } from '@panneau/ui';

/** Renders inside a PanneauRoot, in English or with the messages of a locale. */
export function renderList(
    ui: ReactElement,
    { locale, messages }: { locale?: string; messages?: Record<string, string> } = {},
) {
    const root = <PanneauRoot>{ui}</PanneauRoot>;
    return render(
        locale !== undefined ? (
            <IntlProvider locale={locale} messages={messages}>
                {root}
            </IntlProvider>
        ) : (
            root
        ),
    );
}
