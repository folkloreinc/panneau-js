import { act, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ListQuery } from '@panneau/protocol';
import { IDS_FILTER } from '@panneau/protocol/runtime';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import {
    type RelationReference,
    type RelationSource,
    createRelationSource,
} from '../shared/relation';
import { RelationField, useRelationSearch } from './RelationField';

/** 25 articles, a page of 10 at a time, each with a status. */
const ARTICLES: RelationReference[] = Array.from({ length: 25 }, (_, index) => ({
    id: String(index + 1),
    label: `Article ${String(index + 1)}`,
    status: index % 2 === 0 ? { label: 'Published', tone: 'success' } : { label: 'Draft' },
}));

function createPagedSource() {
    const searchPage = vi.fn(
        async (_resource: string, query: string, { next }: { next?: string | undefined }) => {
            const matches = ARTICLES.filter((article) => article.label.includes(query));
            const start = next !== undefined ? Number(next) : 0;
            return {
                items: matches.slice(start, start + 10),
                total: matches.length,
                next: start + 10 < matches.length ? String(start + 10) : null,
            };
        },
    );
    const source: RelationSource = {
        search: async () => [],
        searchPage,
        resolve: async (_resource, ids) => ARTICLES.filter((article) => ids.includes(article.id)),
        describe: () => ({ status: true }),
    };
    return { source, searchPage };
}

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

    it('shows the selected item as a card, and removes it', async () => {
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
        expect(screen.getByRole('group', { name: 'Author' })).toBeInTheDocument();
        expect(screen.getByRole('listitem')).toHaveTextContent('Ada Lovelace');
        // Without a link from the source, the label is plain text
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Remove Ada Lovelace' }));
        expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('shows the item in its picker, and items as chips, when compact', async () => {
        const { source } = createSource();
        const onChange = vi.fn();
        const { unmount } = renderField(
            <RelationField
                compact
                label="Author"
                resource="authors"
                value={{ id: '1', label: 'Ada Lovelace' }}
                onChange={onChange}
            />,
            { relationSource: source },
        );
        const input = screen.getByRole('combobox', { name: 'Author' });
        expect(input).toHaveValue('Ada Lovelace');
        expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
        await userEvent.clear(input);
        expect(onChange).toHaveBeenLastCalledWith(null);
        unmount();

        renderField(
            <RelationField
                compact
                multiple
                label="Authors"
                resource="authors"
                value={[{ id: '1', label: 'Ada Lovelace' }]}
            />,
            { relationSource: source },
        );
        expect(screen.getByRole('button', { name: 'Remove Ada Lovelace' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Change/ })).not.toBeInTheDocument();
    });

    it('changes the item from its card, and goes back to it with Escape', async () => {
        const { source } = createSource();
        renderField(
            <Controlled<RelationReference | null> initial={{ id: '1', label: 'Ada Lovelace' }}>
                {(value, setValue) => (
                    <RelationField
                        label="Author"
                        resource="authors"
                        value={value}
                        onChange={setValue}
                    />
                )}
            </Controlled>,
            { relationSource: source },
        );
        await userEvent.click(screen.getByRole('button', { name: 'Change Ada Lovelace' }));
        // The picker takes the focus
        const input = screen.getByRole('combobox', { name: 'Author' });
        expect(input).toHaveFocus();
        await userEvent.keyboard('{Escape}');
        // The card is back, with the focus on its first button
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Change Ada Lovelace' })).toHaveFocus();

        await userEvent.click(screen.getByRole('button', { name: 'Change Ada Lovelace' }));
        await userEvent.type(screen.getByRole('combobox', { name: 'Author' }), 'hop');
        await userEvent.click(await screen.findByRole('option', { name: 'Grace Hopper' }));
        expect(screen.getByRole('listitem')).toHaveTextContent('Grace Hopper');
        expect(screen.getByRole('button', { name: 'Change Grace Hopper' })).toHaveFocus();
    });

    it('shows the image, the description and the link of items, as the source describes them', async () => {
        const { source } = createSource();
        const resolve = vi.fn(async (_resource: string, ids: readonly string[]) =>
            ids.map((id) => ({
                id,
                label: `Author ${id}`,
                description: 'Writer',
                imageUrl: `https://example.com/${id}.jpg`,
            })),
        );
        const { container } = renderField(
            <RelationField
                multiple
                label="Authors"
                resource="authors"
                // From items: references without their image or description
                value={[{ id: '1', label: 'Ada Lovelace' }]}
            />,
            {
                relationSource: {
                    ...source,
                    resolve,
                    describe: () => ({ image: true, description: true }),
                    getItemHref: (resource, id) => `/${resource}/${id}`,
                },
            },
        );
        expect(await screen.findByText('Writer')).toBeInTheDocument();
        // The label of the value wins over the resolved one
        expect(screen.getByRole('link', { name: 'Ada Lovelace' })).toHaveAttribute(
            'href',
            '/authors/1',
        );
        expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/1.jpg');
        expect(resolve).toHaveBeenCalledTimes(1);
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

    it('puts a removed card back at its place from “Undo”, in the latest value', async () => {
        const { source } = createSource();
        const onChange = vi.fn();
        renderField(
            <Controlled<RelationReference[] | null> initial={AUTHORS} onChange={onChange}>
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
        await userEvent.click(screen.getByRole('button', { name: 'Remove Grace Hopper' }));
        expect(onChange).toHaveBeenLastCalledWith([AUTHORS[0], AUTHORS[2]]);
        await userEvent.click(screen.getByRole('button', { name: 'Remove Ada Lovelace' }));
        expect(screen.getByText('“Grace Hopper” removed')).toBeInTheDocument();
        expect(screen.getByText('“Ada Lovelace” removed')).toBeInTheDocument();

        // The toast of Grace Hopper still undoes her removal, after Ada Lovelace’s
        const [graceToast] = screen
            .getAllByRole('button', { name: 'Undo' })
            .filter((button) =>
                button.closest('.panneau-toast')?.textContent?.includes('Grace Hopper'),
            );
        await userEvent.click(graceToast as HTMLElement);
        expect(onChange).toHaveBeenLastCalledWith([AUTHORS[1], AUTHORS[2]]);
        expect(screen.getByText('“Grace Hopper” put back')).toBeInTheDocument();
        // Focused on her card again
        expect(
            screen.getByRole('button', { name: 'Remove Grace Hopper' }).closest('.panneau-tile'),
        ).toContainElement(document.activeElement as HTMLElement);
    });

    it('puts the removed item of a single relation back from “Undo”', async () => {
        const { source } = createSource();
        const onChange = vi.fn();
        renderField(
            <Controlled<RelationReference | null> initial={AUTHORS[0] ?? null} onChange={onChange}>
                {(value, setValue) => (
                    <RelationField
                        label="Author"
                        resource="authors"
                        value={value}
                        onChange={setValue}
                    />
                )}
            </Controlled>,
            { relationSource: source },
        );
        await userEvent.click(screen.getByRole('button', { name: 'Remove Ada Lovelace' }));
        expect(onChange).toHaveBeenLastCalledWith(null);
        await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
        expect(onChange).toHaveBeenLastCalledWith(AUTHORS[0]);
        expect(
            within(screen.getByRole('group', { name: 'Author' })).getByRole('listitem'),
        ).toHaveTextContent('Ada Lovelace');
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
            expect(screen.getByRole('button', { name: 'Change Grace Hopper' })).toBeInTheDocument(),
        );
        expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
        // An id the source doesn't find keeps its id as label.
        expect(screen.getByRole('button', { name: 'Remove 404' })).toBeInTheDocument();
        // Each field asks for its own ids, once
        expect(resolve).toHaveBeenCalledTimes(2);
    });

    it('resolves the ids of a repeater of relations in one request, with createRelationSource()', async () => {
        const list = vi.fn(async (_resource: string, query?: ListQuery) => ({
            data: AUTHORS.filter((author) =>
                ((query?.filter?.[IDS_FILTER] ?? []) as string[]).includes(author.id),
            ).map(({ id, label }) => ({ id, version: null, abilities: {}, name: label })),
        }));
        const source = createRelationSource(
            { list },
            {
                definition: {
                    resources: [
                        {
                            id: 'authors',
                            label: { singular: 'author', plural: 'authors' },
                            fields: [{ name: 'name', type: 'text' }],
                            itemTitle: 'name',
                        },
                    ],
                },
            },
        );
        const ids = ['1', '2', '3', '2', '404'];
        const { unmount } = renderField(
            <DefinitionField
                field={{
                    name: 'credits',
                    type: 'repeater',
                    label: 'Credits',
                    fields: [
                        { name: 'author', type: 'relation', label: 'Author', resource: 'authors' },
                    ],
                    settings: { collapsible: false },
                }}
                path="credits"
                value={ids.map((author) => ({ author }))}
                onChange={() => undefined}
            />,
            { relationSource: source },
        );
        // Each field also searches the source for its picker, after a delay: only the requests of
        // ids count here, whenever those searches go.
        const idRequests = () =>
            list.mock.calls.filter(([, query]) => query?.filter?.[IDS_FILTER] !== undefined);
        expect(await screen.findByText('Margaret Hamilton')).toBeInTheDocument();
        expect(screen.getAllByText('Grace Hopper')).toHaveLength(2);
        expect(idRequests()).toEqual([
            ['authors', { filter: { [IDS_FILTER]: ['1', '2', '3', '404'] }, perPage: 4 }],
        ]);
        // Shown again, the fields have their labels at once, without a request
        unmount();
        renderField(
            <DefinitionField
                field={{ name: 'author', type: 'relation', label: 'Author', resource: 'authors' }}
                path="author"
                value="1"
                onChange={() => undefined}
            />,
            { relationSource: source },
        );
        expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
        expect(idRequests()).toHaveLength(1);
    });

    it('searches only for the picker that is about to be used, in a form of relations', async () => {
        const user = userEvent.setup();
        const list = vi.fn(async (_resource: string, query?: ListQuery) => ({
            data: AUTHORS.filter(
                (author) =>
                    query?.filter?.[IDS_FILTER] === undefined ||
                    (query.filter[IDS_FILTER] as string[]).includes(author.id),
            ).map(({ id, label }) => ({ id, version: null, abilities: {}, name: label })),
        }));
        const searches = () =>
            list.mock.calls.filter(([, query]) => query?.filter?.[IDS_FILTER] === undefined);
        const source = createRelationSource(
            { list },
            {
                definition: {
                    resources: [
                        {
                            id: 'authors',
                            label: { singular: 'author', plural: 'authors' },
                            fields: [{ name: 'name', type: 'text' }],
                            itemTitle: 'name',
                        },
                    ],
                },
            },
        );
        renderField(
            <DefinitionField
                field={{
                    name: 'credits',
                    type: 'repeater',
                    label: 'Credits',
                    fields: [
                        {
                            name: 'author',
                            type: 'relation',
                            label: 'Author',
                            resource: 'authors',
                            multiple: true,
                        },
                    ],
                    settings: { collapsible: false },
                }}
                path="credits"
                value={Array.from({ length: 6 }, () => ({ author: [] }))}
                onChange={() => undefined}
            />,
            { relationSource: source },
        );
        const pickers = screen.getAllByRole('combobox', { name: 'Author' });
        expect(pickers).toHaveLength(6);
        // Longer than the debounce of a search: nothing went
        await act(() => new Promise((resolve) => setTimeout(resolve, 300)));
        expect(list).not.toHaveBeenCalled();

        // The focus on one picker: its search, at once, and its options when it opens
        await user.click(pickers[2] as HTMLElement);
        await vi.waitFor(() => expect(searches()).toHaveLength(1));
        expect(await screen.findByRole('option', { name: 'Grace Hopper' })).toBeInTheDocument();
        expect(searches()).toEqual([['authors', { page: 1, perPage: 20 }, expect.anything()]]);
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

    it('adds the item that a panel created, and brings the focus back to the field', async () => {
        const { source } = createFullSource();
        // A panel over the page: the field waits until it is saved or closed
        let settle: (reference: RelationReference | null) => void = () => undefined;
        const onCreate = vi.fn(
            (_text: string) =>
                new Promise<RelationReference | null>((resolve) => {
                    settle = resolve;
                }),
        );
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
                        onCreate={onCreate}
                    />
                )}
            </Controlled>,
            { relationSource: source },
        );
        const picker = screen.getByRole('combobox', { name: 'Authors' });
        await userEvent.type(picker, 'Jean');
        await userEvent.click(await screen.findByRole('option', { name: 'Create “Jean”' }));
        expect(onCreate).toHaveBeenCalledWith('Jean');
        // The panel took the focus
        picker.blur();
        act(() => settle({ id: '10', label: 'Jean' }));
        await waitFor(() =>
            expect(onChange).toHaveBeenLastCalledWith([
                { id: '1', label: 'Ada Lovelace' },
                { id: '10', label: 'Jean' },
            ]),
        );
        expect(screen.getByLabelText('Remove Jean')).toBeInTheDocument();
        await waitFor(() =>
            expect(screen.getByRole('combobox', { name: 'Authors' })).toHaveFocus(),
        );

        // Closed without saving: nothing added, and the focus is back too
        await userEvent.type(screen.getByRole('combobox', { name: 'Authors' }), 'Lin');
        await userEvent.click(await screen.findByRole('option', { name: 'Create “Lin”' }));
        screen.getByRole('combobox', { name: 'Authors' }).blur();
        act(() => settle(null));
        await waitFor(() =>
            expect(screen.getByRole('combobox', { name: 'Authors' })).toHaveFocus(),
        );
        expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('opens the links of its cards in a new tab when the source says so', () => {
        const source: RelationSource = {
            search: async () => [],
            getItemHref: (_resource, id) => `/authors/${id}`,
            linksInNewTab: true,
        };
        renderField(
            <RelationField
                label="Author"
                resource="authors"
                value={{ id: '1', label: 'Ada Lovelace' }}
            />,
            { relationSource: source },
        );
        const link = screen.getByRole('link', { name: 'Ada Lovelace' });
        expect(link).toHaveAttribute('href', '/authors/1');
        expect(link).toHaveAttribute('target', '_blank');
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
        expect(result.current).toMatchObject({
            items: [{ id: '2', label: 'Grace Hopper' }],
            isLoading: false,
            // `search()` gives no count, and no more pages
            total: null,
            hasMore: false,
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

    it('gives the total of a source with pages, and loads the next ones', async () => {
        const { source, searchPage } = createPagedSource();
        const { result } = renderHook(() => useRelationSearch(source, 'articles', ''));
        await waitFor(() => expect(result.current.items).toHaveLength(10));
        expect(result.current).toMatchObject({ total: 25, hasMore: true, isLoadingMore: false });
        act(() => result.current.loadMore());
        expect(result.current.isLoadingMore).toBe(true);
        await waitFor(() => expect(result.current.items).toHaveLength(20));
        expect(searchPage).toHaveBeenLastCalledWith(
            'articles',
            '',
            expect.objectContaining({ next: '10' }),
        );
        act(() => result.current.loadMore());
        await waitFor(() => expect(result.current.hasMore).toBe(false));
        expect(result.current.items).toHaveLength(25);
        // Nothing more to load
        act(() => result.current.loadMore());
        expect(searchPage).toHaveBeenCalledTimes(3);
    });

    it('asks for a next page once at a time, and shows an item once', async () => {
        let resolveNext: (page: { items: RelationReference[]; next: null }) => void = () =>
            undefined;
        const searchPage = vi
            .fn()
            .mockResolvedValueOnce({ items: ARTICLES.slice(0, 2), total: 3, next: 'b' })
            .mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        resolveNext = resolve;
                    }),
            );
        const source: RelationSource = { search: async () => [], searchPage };
        const { result } = renderHook(() => useRelationSearch(source, 'articles', ''));
        await waitFor(() => expect(result.current.items).toHaveLength(2));
        act(() => {
            result.current.loadMore();
            result.current.loadMore();
        });
        expect(searchPage).toHaveBeenCalledTimes(2);
        // The second item moved to the next page meanwhile
        await act(async () => {
            resolveNext({ items: ARTICLES.slice(1, 3), next: null });
        });
        expect(result.current.items.map((item) => item.id)).toEqual(['1', '2', '3']);
        expect(result.current.total).toBe(3);
    });

    it('starts again from the first page when the text changes', async () => {
        const { source, searchPage } = createPagedSource();
        const { result, rerender } = renderHook(
            ({ query }) => useRelationSearch(source, 'articles', query, { delay: 0 }),
            { initialProps: { query: '' } },
        );
        await waitFor(() => expect(result.current.items).toHaveLength(10));
        act(() => result.current.loadMore());
        await waitFor(() => expect(result.current.items).toHaveLength(20));
        rerender({ query: '2' });
        await waitFor(() => expect(result.current.total).toBe(8));
        expect(result.current.items).toHaveLength(8);
        expect(searchPage).toHaveBeenLastCalledWith(
            'articles',
            '2',
            expect.not.objectContaining({ next: expect.anything() }),
        );
    });
});

describe('RelationField: results and statuses', () => {
    it('says how many results there are, of how many', async () => {
        const { source } = createPagedSource();
        renderField(<RelationField label="Article" resource="articles" value={null} />, {
            relationSource: source,
        });
        await userEvent.click(screen.getByRole('combobox', { name: 'Article' }));
        expect(await screen.findByText('10 of 25 results')).toBeInTheDocument();
        await userEvent.type(screen.getByRole('combobox', { name: 'Article' }), '25');
        expect(await screen.findByText('1 result')).toBeInTheDocument();
    });

    it('shows no count when the source doesn’t count', async () => {
        const { source } = createSource();
        renderField(<RelationField label="Author" resource="authors" value={null} />, {
            relationSource: source,
        });
        await userEvent.click(screen.getByRole('combobox', { name: 'Author' }));
        await screen.findByRole('option', { name: 'Ada Lovelace' });
        expect(screen.queryByText(/results?$/)).not.toBeInTheDocument();
    });

    it('shows the status of results and cards as badges in their tones', async () => {
        const { source } = createPagedSource();
        renderField(
            <RelationField
                label="Articles"
                resource="articles"
                multiple
                // A reference from an item gets its status from the source
                value={[{ id: '2', label: 'Article 2' }]}
            />,
            { relationSource: source },
        );
        const card = await screen.findByRole('listitem');
        await waitFor(() =>
            expect(within(card).getByText('Draft')).toHaveClass('panneau-tone-neutral'),
        );
        await userEvent.click(screen.getByRole('combobox', { name: 'Articles' }));
        const option = await screen.findByRole('option', { name: 'Article 1' });
        expect(option).toHaveAccessibleDescription('Published');
        expect(option.querySelector('.panneau-badge')).toHaveClass('panneau-tone-success');
    });

    it('shows the status of a read-only card', () => {
        renderField(
            <RelationField
                label="Article"
                resource="articles"
                readOnly
                value={{
                    id: '1',
                    label: 'Article 1',
                    status: { label: 'Archived', tone: 'muted' },
                }}
            />,
            { relationSource: createPagedSource().source },
        );
        expect(screen.getByText('Archived')).toHaveClass('panneau-tone-muted');
    });
});
