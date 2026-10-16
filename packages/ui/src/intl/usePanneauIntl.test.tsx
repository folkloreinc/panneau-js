import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { describe, expect, it } from 'vitest';

import { fr } from '@panneau/intl';

import { messages } from './messages';
import { usePanneauIntl } from './usePanneauIntl';

function Close() {
    const intl = usePanneauIntl();
    return <span>{intl.formatMessage(messages.close)}</span>;
}

describe('usePanneauIntl', () => {
    it('falls back to English without a provider', () => {
        render(<Close />);
        expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('uses the closest IntlProvider', () => {
        render(
            <IntlProvider locale="fr" messages={fr}>
                <Close />
            </IntlProvider>,
        );
        expect(screen.getByText('Fermer')).toBeInTheDocument();
    });
});
