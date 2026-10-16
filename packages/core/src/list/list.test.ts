import { describe, expect, it, vi } from 'vitest';

import { getResource } from '../__fixtures__/definition';
import { resolveList } from '../definition/list';
import { createList } from './list';
import { createHistoryRouter, createMemoryRouter } from './router';

const pages = resolveList(getResource('pages'));

describe('createList', () => {
    it('starts from the defaults of the list', () => {
        const list = createList({ list: pages });
        expect(list.getState().query).toEqual({
            page: 1,
            perPage: 10,
            sort: ['-published_at', 'title'],
        });
        expect(createList().getState().query).toEqual({ page: 1, perPage: 20 });
        expect(createList({ query: { page: 3, q: 'a' } }).getState().query).toMatchObject({
            page: 3,
            q: 'a',
        });
    });

    it('changes the query, back to the first page when the results change', () => {
        const list = createList({ list: pages });
        const listener = vi.fn();
        list.subscribe(listener);

        list.setPage(3);
        expect(list.getState().query.page).toBe(3);
        list.setFilter('status', 'draft');
        expect(list.getState().query).toMatchObject({ page: 1, filter: { status: 'draft' } });
        list.setPage(2);
        list.setSearch('home');
        expect(list.getState().query).toMatchObject({ page: 1, q: 'home' });
        list.setPerPage(50);
        expect(list.getState().query).toMatchObject({ page: 1, perPage: 50 });
        list.setSort(['title']);
        expect(list.getState().query.sort).toEqual(['title']);
        list.setFilter('status', undefined);
        expect(list.getState().query.filter).toBeUndefined();
        list.resetQuery();
        expect(list.getState().query).toEqual({
            page: 1,
            perPage: 10,
            sort: ['-published_at', 'title'],
        });
        expect(listener).toHaveBeenCalledTimes(8);

        list.setPage(1);
        expect(listener).toHaveBeenCalledTimes(8);
    });

    it('toggles the sort of a field: ascending, descending, default', () => {
        const list = createList({ list: pages });
        list.toggleSort('title');
        expect(list.getState().query.sort).toEqual(['title']);
        list.toggleSort('title');
        expect(list.getState().query.sort).toEqual(['-title']);
        list.toggleSort('title');
        expect(list.getState().query.sort).toEqual(['-published_at', 'title']);
        list.toggleSort('published_at');
        expect(list.getState().query.sort).toEqual(['published_at']);
    });

    it('selects ids across pages', () => {
        const list = createList({ list: pages });
        list.select(['1', '2']);
        list.setPage(2);
        list.toggle('3');
        list.toggle('1');
        expect(list.getState().selection).toEqual({ mode: 'ids', ids: ['2', '3'] });
        expect(list.isSelected('2')).toBe(true);
        expect(list.getSelectedCount(100)).toBe(2);
        expect(list.getSelection()).toEqual({ ids: ['2', '3'] });
        list.clearSelection();
        expect(list.getSelection()).toBeNull();
    });

    it('selects every item matching the query, except some', () => {
        const list = createList({ list: pages });
        list.setFilter('status', 'draft');
        list.setSearch('été');
        list.selectAllMatching();
        expect(list.getSelection()).toEqual({ query: { filter: { status: 'draft' }, q: 'été' } });
        list.deselect(['4']);
        list.toggle('5');
        list.toggle('5');
        expect(list.isSelected('4')).toBe(false);
        expect(list.isSelected('9')).toBe(true);
        expect(list.getSelectedCount(40)).toBe(39);
        expect(list.getSelection()).toEqual({
            query: { filter: { status: 'draft' }, q: 'été' },
            except: ['4'],
        });

        list.setPage(2);
        expect(list.getState().selection.mode).toBe('all');
        list.setFilter('status', 'published');
        expect(list.getState().selection).toEqual({ mode: 'ids', ids: [] });
    });

    it('keeps the query in the URL, without the defaults, next to other parameters', () => {
        const router = createMemoryRouter('tab=2&page=3&filter%5Bstatus%5D=draft');
        const list = createList({ list: pages, router });
        expect(list.getState().query).toMatchObject({ page: 3, filter: { status: 'draft' } });

        list.setPage(4);
        expect(router.getSearch()).toBe('tab=2&page=4&filter%5Bstatus%5D=draft');
        list.setSort(['-published_at', 'title']);
        list.setFilter('status', ['draft', 'published']);
        expect(router.getSearch()).toBe(
            'tab=2&filter%5Bstatus%5D%5B%5D=draft&filter%5Bstatus%5D%5B%5D=published',
        );
        list.setSearch('home');
        list.setSearch('homes');
        expect(router.history).toHaveLength(4);
        expect(router.getSearch()).toContain('q=homes');
        list.resetQuery();
        expect(router.getSearch()).toBe('tab=2');
    });

    it('keeps the bounds of a range in the URL, and drops an empty range', () => {
        const router = createMemoryRouter(
            'filter%5Bpublished_at%5D%5Bfrom%5D=2026-01-01&filter%5Bpublished_at%5D%5Bto%5D=2026-01-31',
        );
        const list = createList({ list: pages, router });
        expect(list.getState().query.filter).toEqual({
            published_at: { from: '2026-01-01', to: '2026-01-31' },
        });
        list.setFilter('published_at', { from: '2026-02-01' });
        expect(router.getSearch()).toBe('filter%5Bpublished_at%5D%5Bfrom%5D=2026-02-01');
        list.setFilter('published_at', {});
        expect(router.getSearch()).toBe('');
        expect(list.getState().query.filter).toBeUndefined();
    });

    it('follows the URL when it changes (back and forward)', () => {
        const router = createMemoryRouter();
        const list = createList({ list: pages, router });
        const listener = vi.fn();
        const unsubscribe = list.subscribe(listener);
        list.setFilter('status', 'draft');
        list.selectAllMatching();
        listener.mockClear();

        router.back();
        expect(listener).toHaveBeenCalledTimes(1);
        expect(list.getState().query.filter).toBeUndefined();
        expect(list.getState().selection).toEqual({ mode: 'ids', ids: [] });

        unsubscribe();
        router.setSearch('page=5');
        expect(list.getState().query.page).toBe(5);
    });
});

describe('createHistoryRouter', () => {
    it('reads and writes the query string of the location', () => {
        window.history.replaceState(null, '', '/pages?tab=1#top');
        const router = createHistoryRouter();
        const listener = vi.fn();
        const unsubscribe = router.subscribe(listener);
        expect(router.getSearch()).toBe('tab=1');

        router.setSearch('tab=2');
        expect(window.location.pathname + window.location.search + window.location.hash).toBe(
            '/pages?tab=2#top',
        );
        router.setSearch('', { replace: true });
        expect(window.location.search).toBe('');
        expect(listener).toHaveBeenCalledTimes(2);

        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(listener).toHaveBeenCalledTimes(3);
        unsubscribe();
        router.setSearch('x=1');
        expect(listener).toHaveBeenCalledTimes(3);
    });
});
