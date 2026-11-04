import { describe, expect, it } from 'vitest';

import { getLinkNewTab, getLinkTypes, resolveLinkNewTab } from './links';

describe('getLinkTypes', () => {
    it('offers url, email and tel, after page when the field has resources', () => {
        expect(getLinkTypes({}).map((type) => type.id)).toEqual(['url', 'email', 'tel']);
        expect(getLinkTypes({ resource: ['pages', 'events'] }).map((type) => type.id)).toEqual([
            'page',
            'url',
            'email',
            'tel',
        ]);
    });

    it('reads settings.types, with the types of the site', () => {
        expect(
            getLinkTypes({
                resource: 'pages',
                settings: {
                    types: ['file', 'page', { id: 'anchor', label: 'Anchor' }, 'nope', 'file'],
                },
            }),
        ).toEqual([{ id: 'file' }, { id: 'page' }, { id: 'anchor', label: 'Anchor' }]);
        expect(getLinkTypes({ settings: { types: ['page', 'url'] } })).toEqual([{ id: 'url' }]);
    });
});

describe('resolveLinkNewTab', () => {
    it('keeps the choice of the user, or none', () => {
        expect(resolveLinkNewTab('choose', { type: 'page', newTab: true })).toBe(true);
        expect(resolveLinkNewTab('choose', { type: 'url' })).toBe(false);
        expect(resolveLinkNewTab('never', { type: 'url', newTab: true })).toBe(false);
    });

    it('opens url and file links in a new tab with external', () => {
        expect(resolveLinkNewTab('external', { type: 'url' })).toBe(true);
        expect(resolveLinkNewTab('external', { type: 'file' })).toBe(true);
        expect(resolveLinkNewTab('external', { type: 'page', newTab: true })).toBe(false);
        expect(resolveLinkNewTab('external', { type: 'email' })).toBe(false);
        expect(resolveLinkNewTab('external', { type: 'anchor', url: '#top' })).toBe(false);
        expect(resolveLinkNewTab('external', { type: 'app', url: '//example.com' })).toBe(true);
    });

    it('reads the setting of the field', () => {
        expect(getLinkNewTab({})).toBe('choose');
        expect(getLinkNewTab({ settings: { newTab: 'external' } })).toBe('external');
        expect(getLinkNewTab({ settings: { newTab: 'always' } })).toBe('choose');
    });
});
