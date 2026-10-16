import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Field, Item } from '@panneau/protocol';

import { Form } from './Form';
import { problemError, renderForm } from './__fixtures__/render';

const FIELDS: Field[] = [
    { name: 'title', type: 'text', label: 'Title' },
    { name: 'featured', type: 'boolean', label: 'Featured' },
    {
        name: 'tags',
        type: 'relation',
        label: 'Tags',
        resource: 'tags',
        multiple: true,
    },
];

const CURRENT: Item = {
    id: '1',
    version: '3',
    abilities: {},
    title: 'Their title',
    featured: true,
    tags: [{ id: '9', label: 'News' }],
};

describe('version conflicts', () => {
    it('shows what changed, and loads the current version', async () => {
        const onSubmit = vi.fn(async () => {
            throw problemError({ status: 412, current: CURRENT });
        });
        renderForm(
            <Form
                fields={FIELDS}
                values={{ title: 'Old', featured: false, tags: null }}
                version="2"
                onSubmit={onSubmit}
            />,
        );
        await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), '!');
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        const dialog = await screen.findByRole('alertdialog', {
            name: 'Someone else saved this item',
        });
        expect(onSubmit).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ version: '2', mode: 'update' }),
        );
        const changes = within(dialog)
            .getAllByRole('term')
            .map((term) => term.textContent);
        expect(changes).toEqual(['Title', 'Featured', 'Tags']);
        expect(dialog).toHaveTextContent('YoursOld!');
        expect(dialog).toHaveTextContent('CurrentTheir title');
        expect(dialog).toHaveTextContent('CurrentNews');
        await userEvent.click(
            within(dialog).getByRole('button', { name: 'Load the current version' }),
        );
        await waitFor(() =>
            expect(
                screen.queryByRole('alertdialog', { name: 'Someone else saved this item' }),
            ).not.toBeInTheDocument(),
        );
        expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue('Their title');
        expect(screen.getByRole('checkbox', { name: 'Featured' })).toBeChecked();
    });

    it('saves the local values over the current version', async () => {
        const onSubmit = vi
            .fn()
            .mockRejectedValueOnce(problemError({ status: 412, current: CURRENT }))
            .mockResolvedValueOnce({ ...CURRENT, version: '4', title: 'Mine' });
        renderForm(
            <Form fields={FIELDS} values={{ title: 'Mine' }} version="2" onSubmit={onSubmit} />,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        await userEvent.click(await screen.findByRole('button', { name: 'Save mine anyway' }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
        expect(onSubmit).toHaveBeenLastCalledWith(
            expect.objectContaining({ title: 'Mine' }),
            expect.objectContaining({ version: '3' }),
        );
        await waitFor(() =>
            expect(
                screen.queryByRole('alertdialog', { name: 'Someone else saved this item' }),
            ).not.toBeInTheDocument(),
        );
        expect(await screen.findByText('Saved')).toBeInTheDocument();
    });

    it('asks to reload when the backend did not send the current item', async () => {
        const onReload = vi.fn();
        renderForm(
            <Form
                fields={FIELDS}
                values={{ title: 'Mine' }}
                version="2"
                onSubmit={async () => {
                    throw problemError({ status: 412 });
                }}
                onReload={onReload}
            />,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        const dialog = await screen.findByRole('alertdialog');
        expect(dialog).toHaveTextContent('load it to see what changed');
        await userEvent.click(
            within(dialog).getByRole('button', { name: 'Load the current version' }),
        );
        expect(onReload).toHaveBeenCalled();
    });
});
