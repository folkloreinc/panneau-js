import { act, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import type { RelationReference, RelationSource } from '../shared/relation';
import { RelationField, useRelationSearch } from './RelationField';

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

/** A source that also resolves ids and creates authors. */
function createFullSource({ failCreate = false }: { failCreate?: boolean } = {}) {
    const { source, search } = createSource();
    const resolve = vi.fn(async (_resource: string, ids: readonly string[]) =>
        AUTHORS.filter((author) => ids.includes(author.id)),
    );
    const create = vi.fn(async (_resource: string, text: string) => {
        if (failCreate) {
            throw new Error('Nope.');
        }
        return { id: '9', label: text };
    });
    const full: RelationSource = { ...source, resolve, create };
    return { source: full, search, resolve, create };
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
        // Which searches ran depends on timing (see the tests of `useRelationSearch`).
        expect(search).toHaveBeenCalledWith('authors', expect.any(String), expect.anything());
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

    it('shows the labels of plain ids, resolved once by the source', async () => {
        const { source, resolve } = createFullSource();
        renderField(
            <>
                <DefinitionField
                    field={{
                        name: 'author',
                        type: 'relation',
                        label: 'Author',
                        resource: 'authors',
                    }}
                    path="author"
                    value="2"
                    onChange={() => undefined}
                />
                <DefinitionField
                    field={{
                        name: 'authors',
                        type: 'relation',
                        label: 'Authors',
                        resource: 'authors',
                        multiple: true,
                    }}
                    path="authors"
                    value={['1', '2', '404']}
                    onChange={() => undefined}
                />
            </>,
            { relationSource: source },
        );
        await vi.waitFor(() =>
            expect(screen.getByRole('combobox', { name: 'Author' })).toHaveValue('Grace Hopper'),
        );
        expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
        // An id the source doesn't find keeps its id as label.
        expect(screen.getByRole('button', { name: 'Remove 404' })).toBeInTheDocument();
        // The two fields share their requests: "2" is resolved once.
        const asked = resolve.mock.calls.flatMap(([, ids]) => ids);
        expect(asked.filter((id) => id === '2')).toHaveLength(1);
    });

    it('creates an item from the typed text, with the source', async () => {
        const { source, create } = createFullSource();
        const onChange = vi.fn();
        renderField(
            <RelationField label="Author" resource="authors" value={null} onChange={onChange} />,
            { relationSource: source },
        );
        await userEvent.type(screen.getByRole('combobox', { name: 'Author' }), 'Hedy Lamarr');
        await userEvent.click(await screen.findByRole('option', { name: 'Create “Hedy Lamarr”' }));
        expect(create).toHaveBeenCalledWith('authors', 'Hedy Lamarr');
        await vi.waitFor(() =>
            expect(onChange).toHaveBeenCalledWith({ id: '9', label: 'Hedy Lamarr' }),
        );
    });

    it('doesn’t offer to create an item that the search found', async () => {
        const { source } = createFullSource();
        renderField(<RelationField label="Author" resource="authors" value={null} />, {
            relationSource: source,
        });
        await userEvent.type(screen.getByRole('combobox', { name: 'Author' }), 'ada lovelace');
        await screen.findByRole('option', { name: 'Ada Lovelace' });
        expect(screen.queryByRole('option', { name: /Create/ })).not.toBeInTheDocument();
    });

    it('creates with onCreate, adds to multiple values, and can be turned off', async () => {
        const { source } = createFullSource();
        const onCreate = vi.fn(async (text: string) => ({ id: '10', label: `${text}!` }));
        const onChange = vi.fn();
        const { unmount } = renderField(
            <RelationField
                multiple
                label="Authors"
                resource="authors"
                value={[{ id: '1', label: 'Ada Lovelace' }]}
                onChange={onChange}
                onCreate={onCreate}
            />,
            { relationSource: source },
        );
        await userEvent.type(screen.getByRole('combobox', { name: 'Authors' }), 'Jean');
        await userEvent.click(await screen.findByRole('option', { name: 'Create “Jean”' }));
        await vi.waitFor(() =>
            expect(onChange).toHaveBeenCalledWith([
                { id: '1', label: 'Ada Lovelace' },
                { id: '10', label: 'Jean!' },
            ]),
        );
        expect(onCreate).toHaveBeenCalledWith('Jean');
        unmount();

        renderField(
            <RelationField label="Author" resource="authors" value={null} onCreate={null} />,
            { relationSource: source },
        );
        await userEvent.type(screen.getByRole('combobox', { name: 'Author' }), 'Jean');
        await screen.findByRole('listbox');
        expect(screen.queryByRole('option', { name: /Create/ })).not.toBeInTheDocument();
    });

    it('says when the item couldn’t be created', async () => {
        const { source } = createFullSource({ failCreate: true });
        const onChange = vi.fn();
        renderField(
            <RelationField label="Author" resource="authors" value={null} onChange={onChange} />,
            { relationSource: source },
        );
        await userEvent.type(screen.getByRole('combobox', { name: 'Author' }), 'Hedy');
        await userEvent.click(await screen.findByRole('option', { name: 'Create “Hedy”' }));
        expect(await screen.findByText('“Hedy” couldn’t be created.')).toBeInTheDocument();
        expect(onChange).not.toHaveBeenCalled();
    });

    it('keeps the value when onCreate creates nothing', async () => {
        const onChange = vi.fn();
        const onCreate = vi.fn(async () => null);
        renderField(
            <RelationField
                label="Author"
                resource="authors"
                value={null}
                onChange={onChange}
                onCreate={onCreate}
            />,
            { relationSource: createSource().source },
        );
        await userEvent.type(screen.getByRole('combobox', { name: 'Author' }), 'Hedy');
        await userEvent.click(await screen.findByRole('option', { name: 'Create “Hedy”' }));
        await vi.waitFor(() => expect(onCreate).toHaveBeenCalledWith('Hedy'));
        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByRole('combobox', { name: 'Author' })).toHaveValue('Hedy');
    });

    it('doesn’t offer to create where the source can’t', async () => {
        const { source } = createFullSource();
        renderField(<RelationField label="Author" resource="authors" value={null} />, {
            relationSource: { ...source, canCreate: (resource) => resource !== 'authors' },
        });
        await userEvent.type(screen.getByRole('combobox', { name: 'Author' }), 'Hedy');
        await screen.findByRole('listbox');
        expect(screen.queryByRole('option', { name: /Create/ })).not.toBeInTheDocument();
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

describe('useRelationSearch', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('searches once typing pauses, with the latest text', async () => {
        vi.useFakeTimers();
        const { source, search } = createSource();
        const { result, rerender } = renderHook(
            ({ query }) => useRelationSearch(source, 'authors', query),
            { initialProps: { query: 'g' } },
        );
        rerender({ query: 'gr' });
        rerender({ query: 'grace' });
        expect(result.current.isLoading).toBe(true);
        await act(async () => {
            await vi.advanceTimersByTimeAsync(250);
        });
        expect(search).toHaveBeenCalledTimes(1);
        expect(search).toHaveBeenCalledWith('authors', 'grace', expect.anything());
        expect(result.current).toEqual({
            items: [{ id: '2', label: 'Grace Hopper' }],
            isLoading: false,
        });
    });

    it('ignores the results of a search that a newer one replaced', async () => {
        vi.useFakeTimers();
        let resolveFirst: (items: RelationReference[]) => void = () => undefined;
        const search = vi
            .fn()
            .mockImplementationOnce(
                () =>
                    new Promise<RelationReference[]>((resolve) => {
                        resolveFirst = resolve;
                    }),
            )
            .mockResolvedValueOnce([{ id: '3', label: 'Margaret Hamilton' }]);
        const source: RelationSource = { search };
        const { result, rerender } = renderHook(
            ({ query }) => useRelationSearch(source, 'authors', query),
            { initialProps: { query: 'a' } },
        );
        await act(async () => {
            await vi.advanceTimersByTimeAsync(250);
        });
        rerender({ query: 'mar' });
        await act(async () => {
            await vi.advanceTimersByTimeAsync(250);
        });
        await act(async () => {
            resolveFirst([{ id: '1', label: 'Ada Lovelace' }]);
        });
        expect(result.current.items).toEqual([{ id: '3', label: 'Margaret Hamilton' }]);
    });

    it('does nothing without a source', () => {
        const { result } = renderHook(() => useRelationSearch(null, 'authors', 'a'));
        expect(result.current.items).toEqual([]);
    });
});
