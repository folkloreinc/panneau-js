import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { queryKeys } from './keys';
import { invalidateActionResult } from './refresh';

function setup() {
    const client = new QueryClient();
    const keys = {
        list: queryKeys.list('pages', { page: 1 }),
        item1: queryKeys.item('pages', '1'),
        item2: queryKeys.item('pages', '2'),
        other: queryKeys.item('authors', '1'),
    };
    Object.values(keys).forEach((key) => client.setQueryData(key, {}));
    const invalidated = () =>
        Object.entries(keys)
            .filter(([, key]) => client.getQueryState(key)?.isInvalidated === true)
            .map(([name]) => name);
    return { client, invalidated };
}

describe('invalidateActionResult', () => {
    it('refreshes nothing with `none`', async () => {
        const { client, invalidated } = setup();
        await invalidateActionResult(client, 'pages', { refresh: 'none' });
        expect(invalidated()).toEqual([]);
    });

    it('refreshes the selected items and the lists with `items`', async () => {
        const { client, invalidated } = setup();
        await invalidateActionResult(client, 'pages', { refresh: 'items' }, { ids: ['2'] });
        expect(invalidated()).toEqual(['list', 'item2']);
    });

    it('refreshes every item of the resource with `items` and a query selection', async () => {
        const { client, invalidated } = setup();
        await invalidateActionResult(
            client,
            'pages',
            { refresh: 'items' },
            { query: { q: 'home' } },
        );
        expect(invalidated()).toEqual(['list', 'item1', 'item2']);
    });

    it('refreshes the whole resource with `list`, or without `refresh`', async () => {
        for (const result of [{ refresh: 'list' as const }, {}]) {
            const { client, invalidated } = setup();
            await invalidateActionResult(client, 'pages', result);
            expect(invalidated()).toEqual(['list', 'item1', 'item2']);
        }
    });
});
