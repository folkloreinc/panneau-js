import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { IntlProvider } from 'react-intl';

import { PanneauRoot } from '@panneau/ui';
import { lucideIconLoader } from '@panneau/ui/named-icons';

/** Renders inside a PanneauRoot, in English or with the messages of a locale. */
export function renderList(
    ui: ReactElement,
    { locale, messages }: { locale?: string; messages?: Record<string, string> } = {},
) {
    const root = <PanneauRoot iconLoader={lucideIconLoader}>{ui}</PanneauRoot>;
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
