import { describe, expect, it } from 'vitest';

import { getDateShortcutSettings, resolveDateShortcuts } from './shortcuts';

describe('date shortcuts', () => {
    it('keeps the valid shortcuts of the settings', () => {
        expect(
            getDateShortcutSettings({
                shortcuts: [
                    'today',
                    'soon',
                    { label: 'In a week', weeks: 1 },
                    { days: 1 },
                    { label: 'Half a day', days: 0.5 },
                ],
            }),
        ).toEqual(['today', { label: 'In a week', weeks: 1 }]);
        expect(getDateShortcutSettings({ shortcuts: 'today' })).toEqual([]);
        expect(getDateShortcutSettings(undefined)).toEqual([]);
    });

    it('works out dates from today or from another field', () => {
        const [yesterday, start, end] = resolveDateShortcuts(
            [
                'yesterday',
                { label: 'The day before the start', from: 'starts_at', days: -1 },
                { label: 'After', from: 'missing', days: 1 },
            ],
            // A date-time is read in the zone: November 1 at 1:30 UTC is October 31 in Toronto
            { starts_at: '2026-11-01T01:30:00Z' },
            'America/Toronto',
        );
        expect(yesterday?.name).toBe('yesterday');
        expect(yesterday?.value).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(start).toEqual({
            name: null,
            label: 'The day before the start',
            value: '2026-10-30',
        });
        expect(end?.value).toBeNull();
    });
});
