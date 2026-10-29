import { describe, expect, it } from 'vitest';

import { DEFAULT_HEADINGS, DEFAULT_TOOLBAR, getRichTextOptions } from './settings';

describe('getRichTextOptions', () => {
    it('has defaults without settings', () => {
        expect(getRichTextOptions({})).toEqual({
            toolbar: DEFAULT_TOOLBAR,
            headings: DEFAULT_HEADINGS,
            styles: [],
            newTab: 'choose',
        });
    });

    it('reads the settings, and skips what it can’t use', () => {
        expect(
            getRichTextOptions({
                settings: {
                    toolbar: ['bold', 3, 'logo'],
                    headings: [2, 7, 3.5, 4],
                    styles: [
                        { label: 'Big paragraph', class: 'big' },
                        { label: 'No class' },
                        { label: 'Lead', class: 'lead', element: 'h2' },
                    ],
                    links: { newTab: 'external' },
                },
            }),
        ).toEqual({
            toolbar: ['bold', 'logo'],
            headings: [2, 4],
            styles: [
                { label: 'Big paragraph', class: 'big' },
                { label: 'Lead', class: 'lead', element: 'h2' },
            ],
            newTab: 'external',
        });
        expect(getRichTextOptions({ settings: { toolbar: 'bold', links: 'never' } })).toMatchObject(
            { toolbar: DEFAULT_TOOLBAR, newTab: 'choose' },
        );
    });
});
