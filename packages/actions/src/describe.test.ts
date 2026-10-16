import { createIntl } from 'react-intl';
import { describe, expect, it } from 'vitest';

import { describeItemResult, describeResult } from './describe';

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

describe('describeItemResult', () => {
    it('gives the message, the reason, or the status', () => {
        expect(describeItemResult({ id: '1', status: 'failed', message: 'No title.' }, intl)).toBe(
            'No title.',
        );
        expect(describeItemResult({ id: '1', status: 'skipped', reason: 'not_found' }, intl)).toBe(
            'Not found',
        );
        expect(describeItemResult({ id: '1', status: 'skipped', reason: 'other' }, intl)).toBe(
            'Skipped',
        );
        expect(describeItemResult({ id: '1', status: 'failed' }, intl)).toBe('Failed');
    });
});
