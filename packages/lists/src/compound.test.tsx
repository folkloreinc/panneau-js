import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PanneauProvider, definePlugin } from '@panneau/core';
import { creditsPlugin } from '@panneau/fields/credits';
import type { Field } from '@panneau/protocol';

import { ItemDetails } from './ItemDetails';
import { renderList } from './__fixtures__/render';

const credits: Field = {
    name: 'credits',
    type: 'credits',
    label: 'Credits',
    multiple: true,
    fields: [
        { name: 'person', type: 'relation', resource: 'people' },
        { name: 'name', type: 'text' },
    ],
};

const item = {
    id: '1',
    credits: [{ person: { id: '1', label: 'Ada Lovelace' } }, { name: 'Jane Doe' }],
};

describe('compound fields in lists and details', () => {
    it('show the summary of their plugin', () => {
        renderList(
            <PanneauProvider plugins={[definePlugin(creditsPlugin)]}>
                <ItemDetails
                    item={item}
                    columns={[
                        { id: 'credits', label: 'Credits', field: credits, display: 'credits' },
                    ]}
                />
            </PanneauProvider>,
        );
        expect(screen.getByRole('definition')).toHaveTextContent('Ada Lovelace, Jane Doe');
    });

    it('show their value as text without it', () => {
        renderList(
            <PanneauProvider>
                <ItemDetails
                    item={item}
                    columns={[
                        { id: 'credits', label: 'Credits', field: credits, display: 'credits' },
                    ]}
                />
            </PanneauProvider>,
        );
        expect(screen.getByRole('definition')).toHaveTextContent('Ada Lovelace');
    });
});
