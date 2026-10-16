import { describe, expect, it } from 'vitest';

import type { Action } from '@panneau/protocol';

import { buildActionRequest, getLinkTarget, getResultCounts, isFinished } from './request';

const action: Action = { id: 'publish', label: 'Publish', kind: 'server', scope: ['item'] };

describe('buildActionRequest', () => {
    it('sends the item as a selection of one id', () => {
        expect(
            buildActionRequest({ action, scope: 'item', item: { id: '12' } }, { notify: true }),
        ).toEqual({ selection: { ids: ['12'] }, values: { notify: true } });
    });

    it('sends the selection as it is, and nothing for the resource', () => {
        const selection = { query: { q: 'été' }, except: ['3'] };
        expect(buildActionRequest({ action, scope: 'selection', selection })).toEqual({
            selection,
            values: {},
        });
        expect(buildActionRequest({ action, scope: 'resource' })).toEqual({ values: {} });
    });
});

describe('getLinkTarget', () => {
    it('fills the id of the item in the URL', () => {
        const edit: Action = { ...action, kind: 'link', url: '/pages/{id}/edit' };
        expect(getLinkTarget({ action: edit, scope: 'item', item: { id: '1/2' } })).toBe(
            '/pages/1%2F2/edit',
        );
        expect(getLinkTarget({ action: edit, scope: 'resource' })).toBeNull();
        expect(getLinkTarget({ action: { ...edit, url: '/pages/new' }, scope: 'resource' })).toBe(
            '/pages/new',
        );
    });

    it('gives a route with the id of the item', () => {
        const edit: Action = { ...action, kind: 'link', route: 'pages.edit' };
        expect(getLinkTarget({ action: edit, scope: 'item', item: { id: '1' } })).toEqual({
            route: 'pages.edit',
            params: { id: '1' },
        });
        expect(getLinkTarget({ action: { ...action, kind: 'link' }, scope: 'item' })).toBeNull();
    });
});

describe('getResultCounts', () => {
    it('reads the summary, or counts the results', () => {
        expect(getResultCounts({ summary: { succeeded: 3, failed: 1, skipped: 0 } })).toEqual({
            succeeded: 3,
            failed: 1,
            skipped: 0,
        });
        expect(
            getResultCounts({
                results: [
                    { id: '1', status: 'failed' },
                    { id: '2', status: 'skipped', reason: 'forbidden' },
                    { id: '3', status: 'skipped', reason: 'not_found' },
                ],
            }),
        ).toEqual({ succeeded: null, failed: 1, skipped: 2 });
    });
});

describe('isFinished', () => {
    it('tells finished runs from those that run', () => {
        expect(['queued', 'running'].map(isFinished)).toEqual([false, false]);
        expect(['succeeded', 'partial', 'failed', 'cancelled'].map(isFinished)).toEqual([
            true,
            true,
            true,
            true,
        ]);
    });
});
