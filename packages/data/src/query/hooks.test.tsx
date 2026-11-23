import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { ActionRun } from '@panneau/protocol';

import { BASE_URL, createBackend } from '../__fixtures__/backend';
import type { DataAdapter } from '../adapter';
import { ConflictError, ForbiddenError, ValidationError } from '../errors';
import { createRestAdapter } from '../rest';
import { DataAdapterProvider, useDataAdapter, useOptionalDataAdapter } from './context';
import {
    useActionRun,
    useCreateItem,
    useDefinition,
    useDeleteItem,
    useDuplicateItem,
    useResourceAggregate,
    useResourceAggregates,
    useResourceItem,
    useResourceList,
    useRunAction,
    useSearch,
    useUpdateItem,
    useWidgetData,
} from './hooks';
import { queryKeys } from './keys';

function setup(adapter?: DataAdapter) {
    const backend = createBackend();
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const resolved = adapter ?? createRestAdapter({ baseUrl: BASE_URL, fetch: backend.fetch });
    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={client}>
            <DataAdapterProvider adapter={resolved}>{children}</DataAdapterProvider>
        </QueryClientProvider>
    );
    return { backend, client, wrapper };
}

describe('query hooks', () => {
    it('need a DataAdapterProvider', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        expect(() => renderHook(() => useDataAdapter())).toThrow(/DataAdapterProvider/);
        expect(renderHook(() => useOptionalDataAdapter()).result.current).toBeNull();
        vi.restoreAllMocks();
    });

    it('load the definition', async () => {
        const { wrapper } = setup();
        const { result } = renderHook(() => useDefinition(), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.resources.map((resource) => resource.id)).toEqual(['pages']);
    });

    it('use an inlined definition without fetching it', () => {
        const { wrapper, backend } = setup();
        const definition = {
            protocol: 1 as const,
            name: 'Inlined',
            locale: 'en',
            locales: ['en'],
            api: { baseUrl: BASE_URL },
            resources: [],
        };
        const { result } = renderHook(() => useDefinition({ initialData: definition }), {
            wrapper,
        });
        expect(result.current.data?.name).toBe('Inlined');
        expect(backend.requests).toHaveLength(0);
    });

    it('list items and keep the previous page while the next one loads', async () => {
        const { wrapper } = setup();
        const { result, rerender } = renderHook(({ page }) => useResourceList('pages', { page }), {
            wrapper,
            initialProps: { page: 1 },
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.data.map((item) => item.id)).toEqual(['2', '3']);

        rerender({ page: 2 });
        expect(result.current.isPlaceholderData).toBe(true);
        expect(result.current.data?.meta.page).toBe(1);
        await waitFor(() => expect(result.current.data?.meta.page).toBe(2));
        expect(result.current.data?.data.map((item) => item.id)).toEqual(['1']);
    });

    it('keep lists and items fresh for 30 seconds, until a mutation invalidates them', async () => {
        const { wrapper, backend, client } = setup();
        const useRead = () => ({
            list: useResourceList('pages', { page: 1 }),
            item: useResourceItem('pages', '1'),
        });
        const first = renderHook(useRead, { wrapper });
        await waitFor(() => expect(first.result.current.item.isSuccess).toBe(true));
        await waitFor(() => expect(first.result.current.list.isSuccess).toBe(true));
        const count = backend.requests.length;
        first.unmount();

        // Shown again, as when coming back to the page or to the tab: nothing is fetched
        const second = renderHook(useRead, { wrapper });
        expect(second.result.current.list.isStale).toBe(false);
        expect(second.result.current.item.isStale).toBe(false);
        expect(backend.requests).toHaveLength(count);

        const update = renderHook(() => useUpdateItem('pages'), { wrapper });
        await act(() =>
            update.result.current.mutateAsync({ id: '1', values: { status: 'draft' } }),
        );
        // The list shown is fetched again
        await waitFor(() =>
            expect(
                backend.requests
                    .slice(count)
                    .some(
                        (request) =>
                            request.method === 'GET' &&
                            new URL(request.url).pathname.endsWith('/resources/pages'),
                    ),
            ).toBe(true),
        );
        expect(client.getQueryState(queryKeys.list('pages', { page: 1 }))?.isInvalidated).toBe(
            false,
        );
    });

    it('search the searchable resources, once enabled', async () => {
        const { wrapper, backend } = setup();
        const { result, rerender } = renderHook(
            ({ q }: { q: string }) => useSearch(q, { enabled: q.length >= 2 }),
            { wrapper, initialProps: { q: 'a' } },
        );
        expect(result.current.fetchStatus).toBe('idle');
        expect(backend.requests).toHaveLength(0);

        rerender({ q: 'abo' });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.data.map(({ resource, total }) => [resource, total])).toEqual([
            ['pages', 1],
        ]);
        expect(new URL(backend.requests[0]?.url ?? '').search).toBe('?q=abo');
    });

    it('search the resources asked for, with a limit', async () => {
        const { wrapper, backend } = setup();
        const { result } = renderHook(() => useSearch('abo', { limit: 20, resources: ['pages'] }), {
            wrapper,
        });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data?.data.map(({ resource }) => resource)).toEqual(['pages']);
        expect(new URL(backend.requests[0]?.url ?? '').search).toBe(
            '?q=abo&limit=20&resources=pages',
        );
    });

    it('get the data of a widget, and fail a 403 with a ForbiddenError', async () => {
        const urls: string[] = [];
        const adapter = createRestAdapter({
            baseUrl: BASE_URL,
            fetch: (input) => {
                const url = String(input);
                urls.push(url);
                return Promise.resolve(
                    url.endsWith('/secret')
                        ? new Response(JSON.stringify({ status: 403, title: 'Forbidden' }), {
                              status: 403,
                              headers: { 'Content-Type': 'application/problem+json' },
                          })
                        : new Response(JSON.stringify({ value: 12 }), {
                              headers: { 'Content-Type': 'application/json' },
                          }),
                );
            },
        });
        const { wrapper, client } = setup(adapter);
        const { result } = renderHook(() => useWidgetData('to judge'), { wrapper });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual({ value: 12 });
        expect(urls[0]).toBe(`${BASE_URL}/dashboard/widgets/to%20judge`);
        expect(client.getQueryData(queryKeys.widget('to judge'))).toEqual({ value: 12 });

        const secret = renderHook(() => useWidgetData('secret'), { wrapper });
        await waitFor(() => expect(secret.result.current.isError).toBe(true));
        expect(secret.result.current.error).toBeInstanceOf(ForbiddenError);

        // The same widget on another dashboard page: its own request and its own data
        const activity = renderHook(() => useWidgetData('to judge', { page: 'activity' }), {
            wrapper,
        });
        await waitFor(() => expect(activity.result.current.isSuccess).toBe(true));
        expect(urls.at(-1)).toBe(`${BASE_URL}/dashboard/widgets/to%20judge?page=activity`);
        expect(client.getQueryData(queryKeys.widget('to judge', { page: 'home' }))).toEqual({
            value: 12,
        });
        expect(client.getQueryData(queryKeys.widget('to judge', { page: 'activity' }))).toEqual({
            value: 12,
        });
        // Another period is another key
        const period = { option: '7d' as const, from: '2026-11-11', to: '2026-11-17' };
        const week = renderHook(() => useWidgetData('to judge', { page: 'activity', period }), {
            wrapper,
        });
        await waitFor(() => expect(week.result.current.isSuccess).toBe(true));
        expect(urls.at(-1)).toBe(
            `${BASE_URL}/dashboard/widgets/to%20judge?page=activity&period%5Boption%5D=7d&period%5Bfrom%5D=2026-11-11&period%5Bto%5D=2026-11-17`,
        );
        expect(
            client.getQueryData(queryKeys.widget('to judge', { page: 'activity', period })),
        ).toEqual({ value: 12 });
        // Every widget of every page is under the dashboard
        expect(client.getQueryCache().findAll({ queryKey: ['panneau', 'dashboard'] })).toHaveLength(
            4,
        );
    });

    it('get the data of a widget of a summary with its list query, refetched when its items change', async () => {
        const backend = createBackend();
        const adapter = createRestAdapter({ baseUrl: BASE_URL, fetch: backend.fetch });
        let calls = 0;
        const getWidgetData = vi.fn(() => Promise.resolve({ value: ++calls }));
        adapter.getWidgetData = getWidgetData;
        const { wrapper, client } = setup(adapter);
        const query = { filter: { status: 'draft' }, q: 'about' };
        const { result } = renderHook(
            () => ({
                summary: useWidgetData('health', { resource: 'pages', query }),
                home: useWidgetData('visits'),
                remove: useDeleteItem('pages'),
            }),
            { wrapper },
        );
        await waitFor(() => expect(result.current.summary.isSuccess).toBe(true));
        await waitFor(() => expect(result.current.home.isSuccess).toBe(true));
        expect(getWidgetData).toHaveBeenCalledWith('health', {
            signal: expect.any(AbortSignal) as AbortSignal,
            resource: 'pages',
            query,
        });
        expect(
            client.getQueryData(queryKeys.widget('health', { resource: 'pages', query })),
        ).toBeDefined();
        // Another query of the list is another key
        expect(
            client.getQueryData(queryKeys.widget('health', { resource: 'pages' })),
        ).toBeUndefined();
        const home = result.current.home.data;
        const before = result.current.summary.data;
        await act(() => result.current.remove.mutateAsync('2'));
        await waitFor(() => expect(result.current.summary.data).not.toEqual(before));
        expect(result.current.home.data).toBe(home);
    });

    it('get an item, and wait for an id', async () => {
        const { wrapper, backend } = setup();
        const { result, rerender } = renderHook(
            ({ id }: { id: string | null }) => useResourceItem('pages', id),
            { wrapper, initialProps: { id: null as string | null } },
        );
        expect(result.current.fetchStatus).toBe('idle');
        expect(backend.requests).toHaveLength(0);

        rerender({ id: '1' });
        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toMatchObject({ id: '1', status: 'published' });
    });

    it('update an item, cache it and refetch the lists', async () => {
        const { wrapper, client } = setup();
        const { result } = renderHook(
            () => ({
                list: useResourceList('pages', { filter: { status: 'published' } }),
                item: useResourceItem('pages', '2'),
                update: useUpdateItem('pages'),
            }),
            { wrapper },
        );
        await waitFor(() => expect(result.current.item.isSuccess).toBe(true));
        expect(result.current.list.data?.meta.total).toBe(1);

        await act(() =>
            result.current.update.mutateAsync({
                id: '2',
                values: { status: 'published' },
                version: result.current.item.data?.version ?? null,
            }),
        );
        await waitFor(() =>
            expect(result.current.item.data).toMatchObject({ version: '2', status: 'published' }),
        );
        await waitFor(() => expect(result.current.list.data?.meta.total).toBe(2));
        expect(client.getQueryData(queryKeys.item('pages', '2'))).toMatchObject({ version: '2' });
    });

    it('put an updated item in the cached lists that show it, before they are refetched', async () => {
        const { wrapper, client } = setup();
        const { result } = renderHook(
            () => ({ list: useResourceList('pages'), update: useUpdateItem('pages') }),
            { wrapper },
        );
        await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
        const before = result.current.list.data?.data.find((item) => item.id === '2');
        const invalidate = vi.spyOn(client, 'invalidateQueries').mockResolvedValue();
        await act(() =>
            result.current.update.mutateAsync({
                id: '2',
                values: { status: 'published' },
                version: before?.version ?? null,
            }),
        );
        expect(invalidate).toHaveBeenCalled();
        await waitFor(() =>
            expect(result.current.list.data?.data.find((item) => item.id === '2')).toMatchObject({
                status: 'published',
            }),
        );
    });

    it('fail an update with a ConflictError when the version is stale', async () => {
        const { wrapper } = setup();
        const { result } = renderHook(() => useUpdateItem('pages'), { wrapper });
        await act(() => result.current.mutateAsync({ id: '1', values: {}, version: '1' }));
        await act(async () => {
            await result.current
                .mutateAsync({ id: '1', values: { status: 'draft' }, version: '1' })
                .catch(() => undefined);
        });
        await waitFor(() => expect(result.current.error).toBeInstanceOf(ConflictError));
        expect((result.current.error as ConflictError).current).toMatchObject({ version: '2' });
    });

    describe('optimistic updates', () => {
        /** A REST adapter whose updates wait until the test lets them through, one by one. */
        function setupGated() {
            const backend = createBackend();
            const rest = createRestAdapter({ baseUrl: BASE_URL, fetch: backend.fetch });
            const gates: (() => void)[] = [];
            const sent: (string | null | undefined)[] = [];
            const adapter: DataAdapter = {
                ...rest,
                update: async (resource, id, values, options) => {
                    await new Promise<void>((resolve) => gates.push(resolve));
                    sent.push(options?.version);
                    return rest.update(resource, id, values, options);
                },
            };
            const release = async () => {
                await waitFor(() => expect(gates.length).toBeGreaterThan(0));
                gates.shift()?.();
            };
            return { ...setup(adapter), backend, sent, release };
        }

        function renderPages(wrapper: ({ children }: { children: ReactNode }) => ReactNode) {
            return renderHook(
                () => ({
                    list: useResourceList('pages'),
                    item: useResourceItem('pages', '2'),
                    update: useUpdateItem('pages', { optimistic: true }),
                }),
                { wrapper },
            );
        }

        const listed = (data: { data: { id: string }[] } | undefined) =>
            data?.data.find((item) => item.id === '2');

        it('show the values at once in the item and the lists, with the old version', async () => {
            const { wrapper, release } = setupGated();
            const { result } = renderPages(wrapper);
            await waitFor(() => expect(result.current.item.isSuccess).toBe(true));
            await waitFor(() => expect(result.current.list.isSuccess).toBe(true));

            let saved: Promise<unknown> = Promise.resolve();
            act(() => {
                saved = result.current.update.mutateAsync({
                    id: '2',
                    values: { status: 'published' },
                    version: '1',
                });
            });
            await waitFor(() =>
                expect(result.current.item.data).toMatchObject({
                    status: 'published',
                    version: '1',
                }),
            );
            expect(listed(result.current.list.data)).toMatchObject({
                status: 'published',
                version: '1',
            });

            await release();
            await act(() => saved);
            await waitFor(() =>
                expect(result.current.item.data).toMatchObject({
                    status: 'published',
                    version: '2',
                }),
            );
            expect(listed(result.current.list.data)).toMatchObject({ version: '2' });
        });

        it('put the values back when the save fails', async () => {
            const { wrapper, client } = setup();
            const { result } = renderPages(wrapper);
            await waitFor(() => expect(result.current.item.isSuccess).toBe(true));
            await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
            const before = result.current.item.data;

            let failure: unknown = null;
            await act(async () => {
                await result.current.update
                    // The mock backend refuses a status outside the options.
                    .mutateAsync({ id: '2', values: { status: 'archived' }, version: '1' })
                    .catch((error: unknown) => {
                        failure = error;
                    });
            });
            expect(failure).toBeInstanceOf(ValidationError);
            expect(result.current.item.data).toEqual(before);
            expect(listed(result.current.list.data)).toMatchObject({
                status: 'draft',
                version: '1',
            });
            expect(client.getQueryData(queryKeys.item('pages', '2'))).toEqual(before);
        });

        it('send two quick edits of an item one after the other, the second with the first’s version', async () => {
            const { wrapper, release, sent, backend } = setupGated();
            const { result } = renderPages(wrapper);
            await waitFor(() => expect(result.current.item.isSuccess).toBe(true));

            let first: Promise<unknown> = Promise.resolve();
            let second: Promise<unknown> = Promise.resolve();
            act(() => {
                first = result.current.update.mutateAsync({
                    id: '2',
                    values: { status: 'published' },
                    version: '1',
                });
                // Made from the item as the list showed it: still version 1.
                second = result.current.update.mutateAsync({
                    id: '2',
                    values: { title: { en: 'About us', fr: 'À propos' } },
                    version: '1',
                });
            });
            await waitFor(() =>
                expect(result.current.item.data).toMatchObject({
                    status: 'published',
                    title: { en: 'About us' },
                    version: '1',
                }),
            );

            await release();
            await act(() => first);
            // The first is saved; the second still shows.
            await waitFor(() =>
                expect(result.current.item.data).toMatchObject({
                    status: 'published',
                    title: { en: 'About us' },
                    version: '2',
                }),
            );
            await release();
            await act(() => second);
            await waitFor(() => expect(sent).toEqual(['1', '2']));
            expect(result.current.item.data).toMatchObject({
                status: 'published',
                title: { en: 'About us' },
                version: '3',
            });
            expect(backend.requests.filter(({ method }) => method === 'PATCH')).toHaveLength(2);
        });

        it('put back only the edit that failed, under the edits still pending', async () => {
            const { wrapper, release } = setupGated();
            const { result } = renderPages(wrapper);
            await waitFor(() => expect(result.current.item.isSuccess).toBe(true));
            await waitFor(() => expect(result.current.list.isSuccess).toBe(true));

            let first: Promise<unknown> = Promise.resolve();
            let second: Promise<unknown> = Promise.resolve();
            act(() => {
                first = result.current.update
                    .mutateAsync({ id: '2', values: { status: 'archived' }, version: '1' })
                    .catch(() => undefined);
                second = result.current.update.mutateAsync({
                    id: '2',
                    values: { title: { en: 'About us', fr: 'À propos' } },
                    version: '1',
                });
            });
            await waitFor(() =>
                expect(result.current.item.data).toMatchObject({ status: 'archived' }),
            );
            await release();
            await act(() => first);
            await waitFor(() =>
                expect(result.current.item.data).toMatchObject({
                    status: 'draft',
                    title: { en: 'About us' },
                    version: '1',
                }),
            );
            expect(listed(result.current.list.data)).toMatchObject({ status: 'draft' });
            await release();
            await act(() => second);
            await waitFor(() =>
                expect(result.current.item.data).toMatchObject({
                    status: 'draft',
                    title: { en: 'About us' },
                    version: '2',
                }),
            );
        });

        it('show the current item of a conflict', async () => {
            const { wrapper, backend } = setup();
            const { result } = renderPages(wrapper);
            await waitFor(() => expect(result.current.item.isSuccess).toBe(true));
            // Someone else saves it first.
            await backend.fetch(`${BASE_URL}/resources/pages/2`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'If-Match': '"1"' },
                body: JSON.stringify({ title: { en: 'Theirs', fr: 'Theirs' } }),
            });

            let failure: unknown = null;
            await act(async () => {
                await result.current.update
                    .mutateAsync({ id: '2', values: { status: 'published' }, version: '1' })
                    .catch((error: unknown) => {
                        failure = error;
                    });
            });
            expect(failure).toBeInstanceOf(ConflictError);
            await waitFor(() =>
                expect(result.current.item.data).toMatchObject({
                    status: 'draft',
                    title: { en: 'Theirs' },
                    version: '2',
                }),
            );
        });

        it('leave a form’s update as it was: nothing shows before the answer', async () => {
            const { wrapper, release } = setupGated();
            const { result } = renderHook(
                () => ({ item: useResourceItem('pages', '2'), update: useUpdateItem('pages') }),
                { wrapper },
            );
            await waitFor(() => expect(result.current.item.isSuccess).toBe(true));
            let saved: Promise<unknown> = Promise.resolve();
            act(() => {
                saved = result.current.update.mutateAsync({
                    id: '2',
                    values: { status: 'published' },
                    version: '1',
                });
            });
            await waitFor(() => expect(result.current.update.isPending).toBe(true));
            expect(result.current.item.data).toMatchObject({ status: 'draft' });
            await release();
            await act(() => saved);
            await waitFor(() =>
                expect(result.current.item.data).toMatchObject({ status: 'published' }),
            );
        });
    });

    it('create an item and refetch the lists', async () => {
        const { wrapper } = setup();
        const { result } = renderHook(
            () => ({ list: useResourceList('pages'), create: useCreateItem('pages') }),
            { wrapper },
        );
        await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
        await act(async () => {
            await result.current.create
                .mutateAsync({ title: { en: 'New' } })
                .catch(() => undefined);
        });
        await waitFor(() => expect(result.current.create.error).toBeInstanceOf(ValidationError));

        await act(() =>
            result.current.create.mutateAsync({
                title: { en: 'New', fr: 'Nouveau' },
                status: 'draft',
            }),
        );
        await waitFor(() => expect(result.current.list.data?.meta.total).toBe(4));
    });

    it('get the aggregates of a resource, refetched when its items change', async () => {
        const { wrapper, backend } = setup();
        const { result } = renderHook(
            () => ({
                aggregate: useResourceAggregate('pages', {
                    filter: { status: 'draft' },
                    group: 'status',
                }),
                remove: useDeleteItem('pages'),
            }),
            { wrapper },
        );
        await waitFor(() => expect(result.current.aggregate.isSuccess).toBe(true));
        expect(result.current.aggregate.data).toEqual({
            items: [{ label: 'Draft', value: 2, key: 'draft' }],
            total: 2,
        });
        expect(new URL(backend.requests[0]?.url ?? '').search).toBe(
            '?filter%5Bstatus%5D=draft&measure=count&group=status',
        );
        await act(() => result.current.remove.mutateAsync('2'));
        await waitFor(() => expect(result.current.aggregate.data).toMatchObject({ total: 1 }));
    });

    it('get several aggregates, in order, and none when disabled', async () => {
        const { wrapper, backend } = setup();
        const reads = [
            { resource: 'pages', request: {} },
            { resource: 'pages', request: { group: 'status' } },
        ];
        const { result, rerender } = renderHook(
            ({ enabled }) => useResourceAggregates(reads, { enabled }),
            { wrapper, initialProps: { enabled: false } },
        );
        expect(result.current.map((query) => query.fetchStatus)).toEqual(['idle', 'idle']);
        expect(backend.requests).toHaveLength(0);
        rerender({ enabled: true });
        await waitFor(() => expect(result.current.every((query) => query.isSuccess)).toBe(true));
        expect(result.current[0]?.data).toEqual({ value: 3 });
        expect(result.current[1]?.data).toMatchObject({ total: 3 });
    });

    it('fail the aggregates without getResourceAggregate()', async () => {
        const adapter = createRestAdapter({ baseUrl: BASE_URL, fetch: createBackend().fetch });
        delete adapter.getResourceAggregate;
        const { wrapper } = setup(adapter);
        const { result } = renderHook(() => useResourceAggregate('pages'), { wrapper });
        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error?.message).toBe(
            'The data adapter has no getResourceAggregate().',
        );
    });

    it('delete an item and refetch the lists', async () => {
        const { wrapper, client } = setup();
        const { result } = renderHook(
            () => ({ list: useResourceList('pages'), remove: useDeleteItem('pages') }),
            { wrapper },
        );
        await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
        client.setQueryData(queryKeys.item('pages', '2'), { id: '2' });
        await act(() => result.current.remove.mutateAsync('2'));
        await waitFor(() => expect(result.current.list.data?.meta.total).toBe(2));
        expect(client.getQueryData(queryKeys.item('pages', '2'))).toBeUndefined();
    });

    it('duplicate an item, cache the copy and refetch the lists', async () => {
        const { wrapper, client } = setup();
        const { result } = renderHook(
            () => ({ list: useResourceList('pages'), duplicate: useDuplicateItem('pages') }),
            { wrapper },
        );
        await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
        const copy = await act(() => result.current.duplicate.mutateAsync('1'));
        await waitFor(() => expect(result.current.list.data?.meta.total).toBe(4));
        expect(client.getQueryData(queryKeys.item('pages', copy.id))).toEqual(copy);
    });

    it('fail to duplicate with an adapter that can’t', async () => {
        const backend = createBackend();
        const { duplicate: _duplicate, ...adapter } = createRestAdapter({
            baseUrl: BASE_URL,
            fetch: backend.fetch,
        });
        const { wrapper } = setup(adapter);
        const { result } = renderHook(() => useDuplicateItem('pages'), { wrapper });
        await expect(act(() => result.current.mutateAsync('1'))).rejects.toThrow('can’t duplicate');
    });

    it('run an action and refresh what its result asks', async () => {
        const { wrapper, backend } = setup();
        const { result } = renderHook(
            () => ({ list: useResourceList('pages'), run: useRunAction('pages') }),
            { wrapper },
        );
        await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
        const response = await act(() =>
            result.current.run.mutateAsync({ action: 'delete', selection: { ids: ['2', '3'] } }),
        );
        expect(response.result?.summary?.succeeded).toBe(2);
        await waitFor(() =>
            expect(result.current.list.data?.data.map((item) => item.id)).toEqual(['1']),
        );
        expect(JSON.parse((await backend.requests.at(-2)?.text()) ?? '')).toEqual({
            selection: { ids: ['2', '3'] },
        });
    });

    it('follow a queued run until it finishes, then refresh', async () => {
        const runs: ActionRun[] = [
            {
                id: 'run_1',
                action: 'export',
                resource: 'pages',
                status: 'queued',
                progress: 0,
                total: 2,
            },
            {
                id: 'run_1',
                action: 'export',
                resource: 'pages',
                status: 'running',
                progress: 1,
                total: 2,
            },
            {
                id: 'run_1',
                action: 'export',
                resource: 'pages',
                status: 'succeeded',
                progress: 2,
                total: 2,
                result: { message: 'Done.', refresh: 'list' },
            },
        ];
        const backend = createBackend();
        const rest = createRestAdapter({ baseUrl: BASE_URL, fetch: backend.fetch });
        // Answers each run in turn, then the last one.
        const getActionRun = vi.fn(async () => {
            const run = runs.length > 1 ? runs.shift() : runs[0];
            if (run === undefined) {
                throw new Error('No run.');
            }
            return run;
        });
        const adapter: DataAdapter = {
            ...rest,
            runAction: async () => ({
                run: {
                    id: 'run_1',
                    action: 'export',
                    resource: 'pages',
                    status: 'queued',
                    progress: 0,
                    total: 2,
                },
            }),
            getActionRun,
        };
        const { wrapper, client } = setup(adapter);
        const invalidate = vi.spyOn(client, 'invalidateQueries');

        const { result } = renderHook(
            () => {
                const run = useRunAction('pages');
                return { run, followed: useActionRun(run.data?.run?.id, { interval: 10 }) };
            },
            { wrapper },
        );
        await act(() => result.current.run.mutateAsync({ action: 'export' }));
        await waitFor(() => expect(result.current.run.data?.run?.status).toBe('queued'));

        await waitFor(() => expect(result.current.followed.data?.status).toBe('succeeded'));
        expect(getActionRun).toHaveBeenCalledTimes(3);
        expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.resource('pages') });
        await new Promise((resolve) => setTimeout(resolve, 50));
        expect(getActionRun).toHaveBeenCalledTimes(3);
    });
});
