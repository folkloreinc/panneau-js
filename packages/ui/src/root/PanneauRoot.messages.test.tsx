import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type * as Intl from '@panneau/intl';
import { uiMessages } from '@panneau/intl';

import { usePanneauIntl } from '../intl/usePanneauIntl';
import { PanneauRoot } from './PanneauRoot';

// Panneau's messages as an app sees them on its first load: French still has to load.
const catalogs = vi.hoisted(() => ({ loaded: new Map<string, Record<string, string>>() }));
vi.mock('@panneau/intl', async (importOriginal) => ({
    ...(await importOriginal<typeof Intl>()),
    getLoadedPanneauMessages: (locale: string) =>
        locale.startsWith('fr') ? catalogs.loaded.get('fr') : {},
    loadPanneauMessages: async () => {
        await Promise.resolve();
        const fr = { 'panneau.ui.close': 'Fermer' };
        catalogs.loaded.set('fr', fr);
        return fr;
    },
}));

function Close() {
    const intl = usePanneauIntl();
    return <p>{intl.formatMessage(uiMessages.close)}</p>;
}

describe('PanneauRoot', () => {
    it('renders in English while the messages of its locale load, then in its locale (#346)', async () => {
        render(
            <PanneauRoot locale="fr-CA">
                <Close />
            </PanneauRoot>,
        );
        expect(screen.getByText('Close')).toBeInTheDocument();
        expect(await screen.findByText('Fermer')).toBeInTheDocument();
    });
});
