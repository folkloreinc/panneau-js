import { describe, expect, it } from 'vitest';

import type { Field } from '@panneau/protocol';

import { describePath } from './describe';
import { getFieldAtPath, getPathSteps } from './paths';

const FIELDS: Field[] = [
    { name: 'title', type: 'text', label: 'Title', localized: true },
    {
        name: 'blocks',
        type: 'repeater',
        label: 'Blocks',
        types: [
            {
                id: 'text',
                label: 'Text',
                fields: [{ name: 'body', type: 'richtext', label: 'Body', localized: true }],
            },
        ],
    },
    { name: 'seo', type: 'group', label: 'SEO', fields: [{ name: 'title', type: 'text' }] },
];

describe('paths', () => {
    it('follows localized values, items of repeaters, blocks and groups', () => {
        expect(
            getPathSteps(FIELDS, 'blocks.2.body.fr').map((step) => [
                step.field.name,
                step.index,
                step.locale,
            ]),
        ).toEqual([
            ['blocks', 2, undefined],
            ['body', undefined, 'fr'],
        ]);
        expect(getFieldAtPath(FIELDS, 'seo.title')?.type).toBe('text');
        expect(getFieldAtPath(FIELDS, 'nope')).toBeUndefined();
    });

    it('describes paths with labels', () => {
        expect(describePath(FIELDS, 'title.fr')).toBe('Title (fr)');
        expect(describePath(FIELDS, 'blocks.2.body.en')).toBe('Blocks › 3 › Body (en)');
        expect(describePath(FIELDS, 'seo.title')).toBe('SEO › title');
        expect(describePath(FIELDS, 'other.path')).toBe('other.path');
    });
});
