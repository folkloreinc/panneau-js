import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { Field } from '@panneau/protocol';

import { renderField } from '../__fixtures__/render';
import { summarizeCompound } from '../compound/compound';
import { DefinitionField } from '../shared/DefinitionField';
import { builtInFields } from '../shared/builtIn';
import { SessionsFieldEntry } from './SessionsField';

const sessions: Field = {
    name: 'sessions',
    type: 'sessions',
    label: 'Sessions',
    multiple: true,
    fields: [
        { name: 'dates', type: 'daterange', label: 'Dates' },
        { name: 'venue', type: 'relation', resource: 'venues', label: 'Venue' },
        { name: 'tickets', type: 'url', label: 'Tickets' },
    ],
};

describe('SessionsFieldEntry', () => {
    it('summarizes a session by its dates and venue', () => {
        expect(
            summarizeCompound(
                SessionsFieldEntry,
                [
                    {
                        dates: { start: '2026-11-04', end: '2026-11-06' },
                        venue: { id: '1', label: 'Salle Wilfrid-Pelletier' },
                    },
                    { venue: { id: '2', label: 'Studio' } },
                ],
                { field: sessions, locale: 'en' },
            ),
        ).toMatch(/^Nov 4\s–\s6, 2026 · Salle Wilfrid-Pelletier, Studio$/);
    });

    it('renders the fields a site adds after the dates and the venue', async () => {
        renderField(
            <DefinitionField
                field={sessions}
                path="sessions"
                value={[{ tickets: 'https://example.com' }]}
                onChange={() => undefined}
            />,
            { components: { ...builtInFields, sessions: SessionsFieldEntry } },
        );
        expect(screen.getByRole('group', { name: 'Sessions' })).toBeInTheDocument();
        // Items start collapsed (decision 0068).
        await userEvent.click(screen.getByRole('button', { expanded: false }));
        expect(screen.getByRole('textbox', { name: 'Tickets' })).toHaveAttribute(
            'name',
            'sessions.0.tickets',
        );
    });
});
