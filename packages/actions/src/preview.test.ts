import { describe, expect, it, vi } from 'vitest';

import type { Action } from '@panneau/protocol';

import { canPreviewAction, previewAction } from './preview';

const publish: Action = {
    id: 'publish',
    label: 'Publish',
    kind: 'server',
    scope: ['selection'],
    dryRun: true,
};
const query = { query: { filter: { status: 'draft' } } };

describe('previewAction', () => {
    it('only previews server actions with dryRun on a query selection', () => {
        expect(canPreviewAction({ action: publish, scope: 'selection', selection: query })).toBe(
            true,
        );
        expect(
            canPreviewAction({ action: publish, scope: 'selection', selection: { ids: ['1'] } }),
        ).toBe(false);
        expect(
            canPreviewAction({
                action: { ...publish, dryRun: undefined },
                scope: 'selection',
                selection: query,
            }),
        ).toBe(false);
    });

    it('asks the backend for a dry run, and gives the counts of its summary', async () => {
        const runAction = vi.fn(() =>
            Promise.resolve({ result: { summary: { succeeded: 28, failed: 0, skipped: 12 } } }),
        );
        await expect(
            previewAction({ runAction }, 'pages', {
                action: publish,
                scope: 'selection',
                selection: query,
            }),
        ).resolves.toEqual({ succeeded: 28, skipped: 12 });
        expect(runAction).toHaveBeenCalledWith(
            'pages',
            'publish',
            { selection: query, dryRun: true },
            {},
        );
    });

    it('gives null without asking when the action cannot be previewed', async () => {
        const runAction = vi.fn();
        await expect(
            previewAction({ runAction }, 'pages', {
                action: publish,
                scope: 'selection',
                selection: { ids: ['1'] },
            }),
        ).resolves.toBeNull();
        expect(runAction).not.toHaveBeenCalled();
    });
});
