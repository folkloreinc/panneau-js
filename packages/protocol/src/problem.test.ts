import { describe, expect, it } from 'vitest';

import { isProblem } from './problem';
import { Problem } from './schemas/api';

const item = { id: '12', version: '3', abilities: { update: true } };

const cases: [string, unknown][] = [
    ['a minimal problem', { type: 'about:blank', title: 'Not found', status: 404 }],
    [
        'a validation problem',
        {
            type: 'urn:panneau:problem:validation',
            title: 'Invalid',
            status: 422,
            detail: 'The title is required.',
            instance: '/resources/pages',
            errors: { 'title.fr': ['Required.'] },
        },
    ],
    [
        'a version conflict with the current item',
        {
            type: 'urn:panneau:problem:version-conflict',
            title: 'Conflict',
            status: 412,
            current: item,
        },
    ],
    ['unknown properties', { type: 'about:blank', title: 'Error', status: 500, trace: 'x' }],
    ['null', null],
    ['a string', 'Not found'],
    ['an array', [{ type: 'about:blank', title: 'Error', status: 500 }]],
    ['no type', { title: 'Error', status: 500 }],
    ['no title', { type: 'about:blank', status: 500 }],
    ['a status below 400', { type: 'about:blank', title: 'OK', status: 200 }],
    ['a status above 599', { type: 'about:blank', title: 'Error', status: 600 }],
    ['a status that is not an integer', { type: 'about:blank', title: 'Error', status: 500.5 }],
    ['a status as a string', { type: 'about:blank', title: 'Error', status: '500' }],
    [
        'a detail that is not a string',
        { type: 'about:blank', title: 'Error', status: 500, detail: 1 },
    ],
    [
        'errors that are not lists of strings',
        { type: 'about:blank', title: 'Invalid', status: 422, errors: { title: 'Required.' } },
    ],
    [
        'errors as a list',
        { type: 'about:blank', title: 'Invalid', status: 422, errors: [['Required.']] },
    ],
    [
        'a current item without an id',
        { type: 'about:blank', title: 'Conflict', status: 412, current: { ...item, id: '' } },
    ],
    [
        'a current item without abilities',
        {
            type: 'about:blank',
            title: 'Conflict',
            status: 412,
            current: { id: '1', version: null },
        },
    ],
    [
        'a current item with abilities that are not booleans',
        {
            type: 'about:blank',
            title: 'Conflict',
            status: 412,
            current: { ...item, abilities: { update: 'yes' } },
        },
    ],
];

describe('isProblem()', () => {
    it.each(cases)('agrees with the Problem schema on %s', (_name, value) => {
        expect(isProblem(value)).toBe(Problem.safeParse(value).success);
    });

    it('accepts problems and refuses other values', () => {
        expect(isProblem({ type: 'about:blank', title: 'Not found', status: 404 })).toBe(true);
        expect(isProblem({ message: 'Not found' })).toBe(false);
    });
});
