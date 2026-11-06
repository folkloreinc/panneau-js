import { createIntl } from 'react-intl';
import { describe, expect, it } from 'vitest';

import { describeItemResult, describeResult, getChangedItems } from './describe';

const intl = createIntl({ locale: 'en', messages: {} });

describe('describeResult', () => {
    it('uses the message of the result, or says the action is done', () => {
        expect(describeResult({ message: '12 pages published.' }, 'Publish', intl)).toEqual({
            title: '12 pages published.',
            tone: 'success',
        });
        expect(describeResult({}, 'Publish', intl)).toEqual({
            title: '“Publish” is done.',
            tone: 'success',
        });
    });

    it('counts what didn’t succeed, with a tone that says how it went', () => {
        expect(
            describeResult({ summary: { succeeded: 3, failed: 0, skipped: 1 } }, 'Publish', intl),
        ).toMatchObject({ description: '3 items done, 1 skipped', tone: 'warning' });
        expect(
            describeResult({ summary: { succeeded: 0, failed: 2, skipped: 0 } }, 'Publish', intl),
        ).toMatchObject({ description: '0 items done, 2 failed', tone: 'danger' });
        expect(
            describeResult({ results: [{ id: '1', status: 'failed' }] }, 'Publish', intl),
        ).toMatchObject({ description: '1 failed', tone: 'warning' });
    });
});

describe('items in use', () => {
    const inUse = (id: string) => ({ id, status: 'skipped' as const, reason: 'in_use' });

    it('names the only item in use, or counts them, as the title when nothing was done', () => {
        const one = { summary: { succeeded: 0, failed: 0, skipped: 1 }, results: [inUse('1')] };
        expect(describeResult(one, 'Delete', intl, null, 'essai.png')).toEqual({
            title: '“essai.png” is in use elsewhere: remove it from where it is used, then try again.',
            tone: 'warning',
        });
        expect(describeResult(one, 'Delete', intl)).toEqual({
            title: '1 item is in use elsewhere: remove it from where it is used, then try again.',
            tone: 'warning',
        });
        expect(
            describeResult(
                { results: [inUse('1'), inUse('2')] },
                'Delete',
                intl,
                null,
                'essai.png',
            ),
        ).toEqual({
            title: '2 items are in use elsewhere: remove them from where they are used, then try again.',
            tone: 'warning',
        });
    });

    it('says it after the counts of what else happened', () => {
        expect(
            describeResult(
                {
                    summary: { succeeded: 3, failed: 0, skipped: 2 },
                    results: [inUse('1'), { id: '2', status: 'skipped', reason: 'forbidden' }],
                },
                'Delete',
                intl,
                '3 pages',
            ),
        ).toEqual({
            title: '“Delete” is done for 3 pages.',
            description:
                '3 items done, 1 skipped. 1 item is in use elsewhere: remove it from where it is used, then try again.',
            tone: 'warning',
        });
    });
});

describe('describeItemResult', () => {
    const inUseEntry = { id: '1', status: 'skipped' as const, reason: 'in_use' };

    it('gives the message, the reason, or the status', () => {
        expect(describeItemResult({ id: '1', status: 'failed', message: 'No title.' }, intl)).toBe(
            'No title.',
        );
        expect(describeItemResult({ id: '1', status: 'skipped', reason: 'not_found' }, intl)).toBe(
            'Not found',
        );
        expect(describeItemResult(inUseEntry, intl)).toBe('In use elsewhere');
        expect(describeItemResult({ id: '1', status: 'skipped', reason: 'other' }, intl)).toBe(
            'Skipped',
        );
        expect(describeItemResult({ id: '1', status: 'failed' }, intl)).toBe('Failed');
    });
});

describe('getChangedItems', () => {
    const action = {
        id: 'publish',
        label: 'Publish',
        kind: 'server' as const,
        scope: ['selection' as const],
    };

    it('gives the selected ids, without those that failed or were skipped', () => {
        expect(
            getChangedItems(
                { action, scope: 'selection', selection: { ids: ['1', '2', '3'] } },
                { results: [{ id: '2', status: 'failed' }] },
            ),
        ).toEqual(['1', '3']);
    });

    it('gives the items of an undo, even for a query selection', () => {
        expect(
            getChangedItems(
                { action, scope: 'selection', selection: { query: {} } },
                { undo: { action: 'restore', items: ['4'] } },
            ),
        ).toEqual(['4']);
    });

    it('gives nothing for an item, a query selection, no change, or too many items', () => {
        expect(getChangedItems({ action, scope: 'item', item: { id: '1' } }, {})).toBeNull();
        expect(
            getChangedItems(
                {
                    action: { ...action, id: 'delete' },
                    scope: 'selection',
                    selection: { ids: ['1'] },
                },
                {},
            ),
        ).toBeNull();
        expect(
            getChangedItems({ action, scope: 'selection', selection: { query: {} } }, {}),
        ).toBeNull();
        expect(
            getChangedItems(
                { action, scope: 'selection', selection: { ids: ['1'] } },
                { results: [{ id: '1', status: 'skipped' }] },
            ),
        ).toBeNull();
        const many = Array.from({ length: 101 }, (_, index) => String(index));
        expect(
            getChangedItems({ action, scope: 'selection', selection: { ids: many } }, {}),
        ).toBeNull();
    });
});
