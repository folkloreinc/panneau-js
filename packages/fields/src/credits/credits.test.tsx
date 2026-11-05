import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Field } from '@panneau/protocol';

import { renderField } from '../__fixtures__/render';
import { summarizeCompound } from '../compound/compound';
import { DefinitionField } from '../shared/DefinitionField';
import { builtInFields } from '../shared/builtIn';
import { CreditsFieldEntry } from './CreditsField';
import { formatCredit } from './credits';

const credits: Field = {
    name: 'credits',
    type: 'credits',
    label: 'Credits',
    multiple: true,
    fields: [
        { name: 'person', type: 'relation', resource: 'people', label: 'Person' },
        { name: 'name', type: 'text', label: 'Name' },
        { name: 'roles', type: 'relation', resource: 'roles', multiple: true, label: 'Roles' },
        { name: 'featured', type: 'boolean', label: 'Featured' },
        { name: 'note', type: 'text', label: 'Note' },
    ],
};

describe('formatCredit', () => {
    it('names the person or the free name, with the roles', () => {
        expect(
            formatCredit(
                {
                    person: { id: '1', label: 'Ada Lovelace' },
                    roles: [
                        { id: '1', label: 'Director' },
                        { id: '2', label: 'Writer' },
                    ],
                },
                'en',
            ),
        ).toBe('Ada Lovelace (Director, Writer)');
        expect(formatCredit({ name: 'Jane Doe' }, 'en')).toBe('Jane Doe');
        expect(
            formatCredit({ name: 'Jane Doe', roles: { fr: 'Musique', en: 'Music' } }, 'fr'),
        ).toBe('Jane Doe (Musique)');
        expect(formatCredit({ roles: 'Music' }, 'en')).toBe('Music');
        expect(formatCredit({}, 'en')).toBeNull();
    });
});

describe('CreditsFieldEntry', () => {
    it('renders each credit with its parts, titled by the credit', () => {
        renderField(
            <DefinitionField
                field={credits}
                path="credits"
                value={[{ name: 'Jane Doe', roles: [{ id: '3', label: 'Music' }], note: 'Guest' }]}
                onChange={() => undefined}
            />,
            { components: { ...builtInFields, credits: CreditsFieldEntry } },
        );
        expect(screen.getAllByRole('listitem')[0]).toHaveAccessibleName(/^1\s*Jane Doe \(Music\)$/);
        expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute(
            'name',
            'credits.0.name',
        );
        expect(screen.getByRole('checkbox', { name: 'Featured' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Note' })).toHaveValue('Guest');
    });

    it('summarizes the credits for lists', () => {
        expect(
            summarizeCompound(
                CreditsFieldEntry,
                [{ person: { id: '1', label: 'Ada Lovelace' } }, { name: 'Jane Doe' }],
                { field: credits, locale: 'en' },
            ),
        ).toBe('Ada Lovelace, Jane Doe');
    });
});
