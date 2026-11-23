import { describe, expect, it } from 'vitest';

import { getFieldLabel, humanizeKey, labelOrKey } from './labels';

describe('humanizeKey', () => {
    it('reads snake case and kebab case', () => {
        expect(humanizeKey('published_at')).toBe('Published at');
        expect(humanizeKey('PUBLISHED_AT')).toBe('Published at');
        expect(humanizeKey('meta-description')).toBe('Meta description');
        expect(humanizeKey('status')).toBe('Status');
    });

    it('reads camel case and Pascal case', () => {
        expect(humanizeKey('publishedAt')).toBe('Published at');
        expect(humanizeKey('PublishedAt')).toBe('Published at');
    });

    it('names what a trailing id points to', () => {
        expect(humanizeKey('author_id')).toBe('Author');
        expect(humanizeKey('authorId')).toBe('Author');
        expect(humanizeKey('author_ID')).toBe('Author');
        expect(humanizeKey('id')).toBe('ID');
        expect(humanizeKey('id_number')).toBe('ID number');
        expect(humanizeKey('author_ids')).toBe('Author ids');
    });

    it('keeps every segment of a path', () => {
        expect(humanizeKey('seo.title')).toBe('Seo title');
        expect(humanizeKey('seo.og_image')).toBe('Seo og image');
    });

    it('keeps digits with their word', () => {
        expect(humanizeKey('address_line_2')).toBe('Address line 2');
        expect(humanizeKey('h1Title')).toBe('H1 title');
        expect(humanizeKey('line2')).toBe('Line2');
    });

    it('keeps acronyms in capitals', () => {
        expect(humanizeKey('seoURL')).toBe('Seo URL');
        expect(humanizeKey('URLPath')).toBe('URL path');
        expect(humanizeKey('api_key')).toBe('Api key');
        expect(humanizeKey('API_key')).toBe('API key');
    });

    it('leaves readable text as it is', () => {
        expect(humanizeKey('Published at')).toBe('Published at');
        expect(humanizeKey('Title')).toBe('Title');
        expect(humanizeKey('API key')).toBe('API key');
    });

    it('reads an empty key as an empty label', () => {
        expect(humanizeKey('')).toBe('');
        expect(humanizeKey('_')).toBe('');
    });
});

describe('labelOrKey and getFieldLabel', () => {
    it('keep a given label, an empty one included', () => {
        expect(labelOrKey('Date de publication', 'published_at')).toBe('Date de publication');
        expect(labelOrKey('', 'published_at')).toBe('');
        expect(getFieldLabel({ name: 'published_at', label: 'publié' })).toBe('publié');
        expect(getFieldLabel({ name: 'published_at', label: '' })).toBe('');
    });

    it('make the key readable without a label', () => {
        expect(labelOrKey(undefined, 'published_at')).toBe('Published at');
        expect(labelOrKey(null, 'author_id')).toBe('Author');
        expect(getFieldLabel({ name: 'published_at' })).toBe('Published at');
    });
});
