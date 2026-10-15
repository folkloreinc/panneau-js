import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PanneauProvider, definePlugin } from '@panneau/core';

import { Form } from './Form';
import { renderForm } from './__fixtures__/render';

describe('field error boundaries', () => {
    it('keeps a broken field from breaking the form', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        let broken = true;
        const plugin = definePlugin({
            id: 'broken',
            fields: {
                map: () => {
                    if (broken) {
                        throw new Error('No map');
                    }
                    return <p>Map</p>;
                },
            },
        });
        renderForm(
            <PanneauProvider plugins={[plugin]}>
                <Form
                    fields={[
                        { name: 'place', type: 'map', label: 'Place' },
                        { name: 'title', type: 'text', label: 'Title' },
                    ]}
                />
            </PanneauProvider>,
        );
        expect(screen.getByText('The field “Place” can’t be displayed.')).toBeInTheDocument();
        await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), 'Still works');
        expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Still works');
        broken = false;
        await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
        expect(screen.getByText('Map')).toBeInTheDocument();
    });
});
