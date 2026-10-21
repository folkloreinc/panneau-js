import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { ActionRun } from '@panneau/protocol';

import { BASE_URL, createBackend } from '../__fixtures__/backend';
import type { DataAdapter } from '../adapter';
import { ConflictError, ValidationError } from '../errors';
import { createRestAdapter } from '../rest';
import { DataAdapterProvider, useDataAdapter, useOptionalDataAdapter } from './context';
import {
    useActionRun,
    useCreateItem,
    useDefinition,
    useDeleteItem,
    useResourceItem,
    useResourceList,
    useRunAction,
    useUpdateItem,
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
