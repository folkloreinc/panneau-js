import { describe, expect, it } from 'vitest';

import { evaluateCondition } from './conditions';

describe('evaluateCondition', () => {
    const values = { status: 'published', tags: ['a'], seo: { title: '' }, count: 0 };

    it.each([
        [{}, true],
        [{ field: 'status', equals: 'published' }, true],
        [{ field: 'status', equals: 'draft' }, false],
        [{ field: 'status', in: ['draft', 'published'] }, true],
        [{ field: 'status', notIn: ['published'] }, false],
        [{ field: 'tags', filled: true }, true],
        [{ field: 'seo.title', filled: false }, true],
        [{ field: 'count', filled: true }, true],
        [{ field: 'tags', equals: ['a'] }, true],
        [
            {
                all: [
                    { field: 'status', equals: 'published' },
                    { field: 'tags', filled: true },
                ],
            },
            true,
        ],
        [
            {
                all: [
                    { field: 'status', equals: 'published' },
                    { field: 'tags', filled: false },
                ],
            },
            false,
        ],
        [
            {
                any: [
                    { field: 'status', equals: 'draft' },
                    { field: 'tags', filled: true },
                ],
            },
            true,
        ],
        [{ any: [{ field: 'status', equals: 'draft' }] }, false],
    ])('evaluates %j to %s', (condition, expected) => {
        expect(evaluateCondition(condition, values)).toBe(expected);
    });
});
