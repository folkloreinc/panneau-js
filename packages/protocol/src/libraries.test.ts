import { describe, expect, it } from 'vitest';

import { getItemImageField, getMediaLibraries } from './libraries';

const definition = {
    resources: [
        { id: 'pages' },
        { id: 'images', kind: 'media' },
        { id: 'documents', kind: 'media' },
    ],
};

describe('getMediaLibraries', () => {
    it('gives every library of the definition to a field that names none', () => {
        expect(getMediaLibraries(definition, {})).toEqual(['images', 'documents']);
        expect(getMediaLibraries(null, {})).toEqual([]);
    });

    it('gives the library a field names, or the ones it lists, in its order', () => {
        expect(getMediaLibraries(definition, { resource: 'documents' })).toEqual(['documents']);
        expect(getMediaLibraries(definition, { resource: ['documents', 'images'] })).toEqual([
            'documents',
            'images',
        ]);
    });

    it('leaves out ids that are not libraries', () => {
        expect(getMediaLibraries(definition, { resource: ['pages', 'images', 'unknown'] })).toEqual(
            ['images'],
        );
    });
});

describe('getItemImageField', () => {
    it('is the itemImage of the resource', () => {
        expect(getItemImageField({ itemImage: 'cover' })).toBe('cover');
        expect(getItemImageField({ kind: 'media', itemImage: 'poster' })).toBe('poster');
    });

    it('is the media of the items of a library without one', () => {
        expect(getItemImageField({ kind: 'media' })).toBe('media');
    });

    it('is undefined for other resources without one', () => {
        expect(getItemImageField({})).toBeUndefined();
        expect(getItemImageField({ kind: 'other' })).toBeUndefined();
    });
});
