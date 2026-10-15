import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import type { RelationReference, RelationSource } from '../shared/relation';
import { RelationField } from './RelationField';

const AUTHORS: RelationReference[] = [
    { id: '1', label: 'Ada Lovelace' },
    { id: '2', label: 'Grace Hopper' },
    { id: '3', label: 'Margaret Hamilton' },
];

function createSource() {
    const search = vi.fn(async (resource: string, query: string) => {
        if (resource !== 'authors') {
            return [];
        }
        return AUTHORS.filter((author) => author.label.toLowerCase().includes(query.toLowerCase()));
    });
    const source: RelationSource = { search };
    return { source, search };
}

describe('RelationField', () => {
    it('searches the source and picks a reference', async () => {
        const { source, search } = createSource();
        const onChange = vi.fn();
        renderField(
            <RelationField label="Author" resource="authors" value={null} onChange={onChange} />,
            { relationSource: source },
        );
        await userEvent.type(screen.getByRole('combobox', { name: 'Author' }), 'grace');
        await userEvent.click(await screen.findByRole('option', { name: 'Grace Hopper' }));
        expect(onChange).toHaveBeenCalledWith({ id: '2', label: 'Grace Hopper' });
        await waitFor(() =>
            expect(search).toHaveBeenCalledWith('authors', 'grace', expect.anything()),
        );
    });

    it('shows the label of the selected reference, and clears it', async () => {
        const { source } = createSource();
        const onChange = vi.fn();
        renderField(
            <RelationField
                label="Author"
                resource="authors"
                value={{ id: '1', label: 'Ada Lovelace' }}
                onChange={onChange}
            />,
            { relationSource: source },
        );
        const input = screen.getByRole('combobox', { name: 'Author' });
        expect(input).toHaveValue('Ada Lovelace');
        await userEvent.clear(input);
        expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('adds and removes references with multiple', async () => {
        const { source } = createSource();
        const onChange = vi.fn();
        renderField(
            <Controlled<RelationReference[] | null>
                initial={[{ id: '1', label: 'Ada Lovelace' }]}
                onChange={onChange}
            >
                {(value, setValue) => (
                    <RelationField
                        multiple
                        label="Authors"
                        resource="authors"
                        value={value}
                        onChange={setValue}
                    />
                )}
            </Controlled>,
            { relationSource: source },
        );
        await userEvent.click(screen.getByRole('combobox', { name: 'Authors' }));
        await screen.findByRole('option', { name: 'Grace Hopper' });
        const options = screen.getAllByRole('option');
        expect(options.map((option) => option.textContent)).toEqual([
            'Grace Hopper',
            'Margaret Hamilton',
        ]);
        await userEvent.click(screen.getByRole('option', { name: 'Margaret Hamilton' }));
        expect(onChange).toHaveBeenLastCalledWith([
            { id: '1', label: 'Ada Lovelace' },
            { id: '3', label: 'Margaret Hamilton' },
        ]);
        await userEvent.keyboard('{Escape}');
        await userEvent.click(await screen.findByRole('button', { name: 'Remove Ada Lovelace' }));
        expect(onChange).toHaveBeenLastCalledWith([{ id: '3', label: 'Margaret Hamilton' }]);
    });

    it('shows its references without a source, read-only', () => {
        renderField(
            <DefinitionField
                field={{
                    name: 'authors',
                    type: 'relation',
                    resource: 'authors',
                    label: 'Authors',
                    multiple: true,
                }}
                path="authors"
                value={['7', { id: '8', label: 'Grace Hopper' }]}
                onChange={() => undefined}
            />,
        );
        expect(screen.getByRole('group', { name: 'Authors' })).toHaveAccessibleDescription(
            'Items can’t be searched here.',
        );
        expect(screen.getByText('7')).toBeInTheDocument();
        expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
});
