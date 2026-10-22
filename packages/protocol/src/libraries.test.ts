import { describe, expect, it } from 'vitest';

import { getMediaLibraries } from './libraries';

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
