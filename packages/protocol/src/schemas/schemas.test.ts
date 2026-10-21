import { describe, expect, it } from 'vitest';

import { createDefinition } from '../__fixtures__/definition';
import { lintDefinition } from '../lint';
import { validate, validateDefinition } from '../validate';
import { Action, Definition, Field, Item, ListResponse, Problem } from './index';

describe('Definition', () => {
    it('accepts a complete definition', () => {
        const result = validateDefinition(createDefinition());
        expect(result).toEqual({ success: true, data: expect.anything() });
    });

    it('keeps properties it does not know, so later versions can add some', () => {
        const definition = { ...createDefinition(), futureOption: { enabled: true } };
        const parsed = Definition.parse(definition);
        expect(parsed).toHaveProperty('futureOption', { enabled: true });
    });

    it('requires version 1 of the protocol', () => {
        const result = validateDefinition({ ...createDefinition(), protocol: 2 });
        expect(result.success).toBe(false);
    });

    it('refuses duplicate resource ids', () => {
        const definition = createDefinition();
        const first = definition.resources[0];
        if (first === undefined) {
            throw new Error('Fixture has no resources.');
        }
        definition.resources.push(first);
        const result = validateDefinition(definition);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.issues).toContainEqual({
                path: 'resources.2.id',
                message: 'Duplicate resource id `pages`.',
            });
        }
    });

    it('reports where a value is invalid', () => {
        const definition = createDefinition() as unknown as { resources: { fields: unknown[] }[] };
        definition.resources[0]?.fields.push({ name: '', type: 'text' });
        const result = validateDefinition(definition);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.issues.map((issue) => issue.path)).toContain('resources.0.fields.6.name');
        }
    });
});

describe('Field', () => {
    it('accepts plugin field types and settings', () => {
        expect(
            Field.safeParse({ name: 'slug', type: 'page-slug', settings: { prefix: '/' } }).success,
        ).toBe(true);
    });

    it('checks the parameters of known rules', () => {
        expect(
            Field.safeParse({ name: 'title', type: 'text', rules: [{ rule: 'max', value: '12' }] })
                .success,
        ).toBe(false);
        expect(
            Field.safeParse({ name: 'title', type: 'text', rules: [{ rule: 'max', value: 12 }] })
                .success,
        ).toBe(true);
    });

    it('accepts rules added by later versions', () => {
        expect(
            Field.safeParse({ name: 'code', type: 'text', rules: [{ rule: 'luhn' }] }).success,
        ).toBe(true);
    });
});

describe('Action', () => {
    it('defaults to a server action', () => {
        expect(Action.parse({ id: 'publish', label: 'Publish', scope: ['item'] }).kind).toBe(
            'server',
        );
    });

    it('needs a url or a route for a link, and a component for a client action', () => {
        expect(
            Action.safeParse({ id: 'open', label: 'Open', kind: 'link', scope: ['item'] }).success,
        ).toBe(false);
        expect(
            Action.safeParse({ id: 'copy', label: 'Copy', kind: 'client', scope: ['item'] })
                .success,
        ).toBe(false);
        expect(
            Action.safeParse({
                id: 'copy',
                label: 'Copy',
                kind: 'client',
                component: 'copy',
                scope: ['item'],
            }).success,
        ).toBe(true);
    });

    it('needs at least one scope', () => {
        expect(Action.safeParse({ id: 'publish', label: 'Publish', scope: [] }).success).toBe(
            false,
        );
    });
});

describe('API payloads', () => {
    it('requires id, version and abilities on items', () => {
        expect(Item.safeParse({ id: '1', title: 'Hello' }).success).toBe(false);
        expect(
            Item.safeParse({ id: '1', version: null, abilities: {}, title: 'Hello' }).success,
        ).toBe(true);
    });

    it('validates lists', () => {
        const list = { data: [], meta: { page: 1, perPage: 20, total: 0, lastPage: 1 } };
        expect(validate(ListResponse, list).success).toBe(true);
    });

    it('validates problems', () => {
        expect(
            Problem.safeParse({
                type: 'urn:panneau:problem:validation',
                title: 'Invalid',
                status: 422,
                errors: { 'title.fr': ['Required.'] },
            }).success,
        ).toBe(true);
        expect(Problem.safeParse({ title: 'Invalid', status: 200 }).success).toBe(false);
    });
});

describe('lintDefinition', () => {
    it('finds no issue in a consistent definition', () => {
        expect(lintDefinition(createDefinition())).toEqual([]);
    });

    it('reports layout nodes, columns and relations that reference nothing', () => {
        const definition = createDefinition();
        const pages = definition.resources[0];
        if (pages === undefined) {
            throw new Error('Fixture has no resources.');
        }
        pages.form = {
            layout: [
                { type: 'field', name: 'subtitle' },
                { type: 'tabs', children: [{ type: 'row' }] },
            ],
        };
        pages.list = { columns: [{ field: 'missing' }] };
        pages.fields.push({ name: 'editor', type: 'relation', resource: 'editors' });
        expect(lintDefinition(definition)).toEqual([
            { path: 'resources.0.form.layout.0.name', message: 'No field named `subtitle`.' },
            {
                path: 'resources.0.form.layout.1.children',
                message: 'The children of `tabs` must be `tab` nodes.',
            },
            { path: 'resources.0.list.columns.0.field', message: 'No field named `missing`.' },
            { path: 'resources.0.fields.6.resource', message: 'No resource `editors`.' },
        ]);
    });

    it('is part of validateDefinition()', () => {
        const definition = createDefinition();
        definition.resources[0]?.fields.push({ name: 'title', type: 'text' });
        const result = validateDefinition(definition);
        expect(result.success).toBe(false);
    });
});
