import { describe, expect, it } from 'vitest';

import { getFieldTarget, isV4Package } from './mappings';
import { kebabCase, pascalCase } from './names';
import { isBootstrapClass } from './transforms/bootstrap';

describe('names', () => {
    it('reads names in every case, as v4 looked components up', () => {
        expect(pascalCase('video_or_embed')).toBe('VideoOrEmbed');
        expect(kebabCase('VideoOrEmbed')).toBe('video-or-embed');
        expect(kebabCase('date_time')).toBe('date-time');
        expect(kebabCase('HTMLField')).toBe('html-field');
    });
});

describe('getFieldTarget', () => {
    it('gives the v5 component of a v4 field, whatever the case of its id', () => {
        expect(getFieldTarget('date_time')).toMatchObject({
            source: '@panneau/fields/datetime',
            name: 'DateTimeField',
        });
        expect(getFieldTarget('DateTime')?.name).toBe('DateTimeField');
        expect(getFieldTarget('toggle')?.adds).toEqual({ widget: 'switch' });
        expect(getFieldTarget('video_or_embed')).toBeNull();
    });
});

describe('isV4Package', () => {
    it('knows the packages that only v4 has', () => {
        expect(isV4Package('@panneau/field-text')).toBe(true);
        expect(isV4Package('@panneau/element-form-group')).toBe(true);
        expect(isV4Package('@panneau/medias')).toBe(true);
        expect(isV4Package('@panneau/media')).toBe(false);
        expect(isV4Package('@panneau/fields')).toBe(false);
    });
});

describe('isBootstrapClass', () => {
    it('finds the classes of Bootstrap 4 and 5, and of Bootstrap Icons', () => {
        [
            'row',
            'col-auto',
            'mb-3',
            'ml-2',
            'd-flex',
            'btn-primary',
            'text-muted',
            'bi-check',
            'sr-only',
        ].forEach((name) => {
            expect(isBootstrapClass(name)).toBe(true);
        });
    });

    it('leaves the classes of the project alone', () => {
        ['text', 'title', 'page-slug', 'panneau-field', 'card-list-item-x'].forEach((name) => {
            expect(isBootstrapClass(name)).toBe(name === 'card-list-item-x');
        });
    });
});
