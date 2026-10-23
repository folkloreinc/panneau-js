import { describe, expect, it } from 'vitest';

import { createDefinition } from '../__fixtures__/definition';
import { lintDefinition } from '../lint';
import { validate, validateDefinition } from '../validate';
import { Action, Definition, Field, Item, ListResponse, MediaTransform, Problem } from './index';

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
                path: 'resources.3.id',
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
            expect(result.issues.map((issue) => issue.path)).toContain('resources.0.fields.7.name');
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
    it('checks the file field of media resources, and the library of media fields', () => {
        const definition = createDefinition();
        expect(lintDefinition(definition)).toEqual([]);
        const library = definition.resources.find((resource) => resource.id === 'media');
        if (library === undefined) {
            throw new Error('Fixture has no media resource.');
        }
        const libraryIndex = definition.resources.indexOf(library);
        definition.resources.push({ ...library, id: 'documents' });
        library.fields = library.fields.map((field) =>
            field.name === 'file' ? { ...field, multiple: true } : field,
        );
        const authors = definition.resources.find((resource) => resource.id === 'authors');
        // Without a `resource`, the field allows every library (decision 0027): its `photo`
        // field is fine with two libraries.
        authors?.fields.push({ name: 'cv', type: 'media', resource: 'pages' });
        authors?.fields.push({ name: 'files', type: 'media', resource: ['documents', 'pages'] });
        authors?.fields.push({ name: 'mentor', type: 'relation', resource: ['authors'] });

        expect(lintDefinition(definition)).toEqual([
            {
                path: 'resources.1.fields.4.resource',
                message: 'A `relation` field names one resource.',
            },
            {
                path: 'resources.1.fields.2.resource',
                message: 'No resource of kind `media` named `pages`.',
            },
            {
                path: 'resources.1.fields.3.resource.1',
                message: 'No resource of kind `media` named `pages`.',
            },
            {
                path: `resources.${String(libraryIndex)}.fields.0`,
                message: 'The `file` field of a `media` resource must be a single `file`.',
            },
        ]);
    });

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
            { path: 'resources.0.fields.7.resource', message: 'No resource `editors`.' },
        ]);
    });

    it('is part of validateDefinition()', () => {
        const definition = createDefinition();
        definition.resources[0]?.fields.push({ name: 'title', type: 'text' });
        const result = validateDefinition(definition);
        expect(result.success).toBe(false);
    });
});

describe('MediaTransform', () => {
    it('accepts the shared shape of image edits', () => {
        const transform = {
            crop: { x: 120, y: 0, width: 1600, height: 900 },
            rotate: 90,
            flipX: true,
            focalPoint: { x: 0.42, y: 0.35 },
        };
        expect(MediaTransform.safeParse(transform).success).toBe(true);
    });

    it('refuses a crop in fractional or negative pixels, or empty', () => {
        const crop = (values: Record<string, number>) =>
            MediaTransform.safeParse({ crop: { x: 0, y: 0, width: 10, height: 10, ...values } })
                .success;
        expect(crop({ x: 1.5 })).toBe(false);
        expect(crop({ y: -1 })).toBe(false);
        expect(crop({ width: 0 })).toBe(false);
        expect(crop({})).toBe(true);
    });

    it('says its base, with the media transform it was made on (decision 0031)', () => {
        expect(
            MediaTransform.safeParse({
                base: 'media',
                baseTransform: { rotate: 90 },
                crop: { x: 0, y: 900, width: 3024, height: 1701 },
            }).success,
        ).toBe(true);
        expect(MediaTransform.safeParse({ base: 'library' }).success).toBe(false);
        expect(MediaTransform.safeParse({ baseTransform: { rotate: 45 } }).success).toBe(false);
    });

    it('keeps the keys that editor tools add', () => {
        expect(MediaTransform.parse({ rotate: 90, filter: 'sepia' })).toEqual({
            rotate: 90,
            filter: 'sepia',
        });
    });
});

describe('the image field', () => {
    it('accepts its options and the crop rule', () => {
        const field = {
            name: 'cover',
            type: 'image',
            ratios: ['16:9', '4:3'],
            rotate: false,
            focalPoint: true,
            transformBase: 'choose',
            rules: [{ rule: 'crop', value: { ratios: ['16:9', '1:1'], required: true } }],
        };
        expect(Field.safeParse(field).success).toBe(true);
    });

    it('refuses ratios it cannot read, and an unknown base', () => {
        expect(Field.safeParse({ name: 'cover', type: 'image', ratios: ['16/9'] }).success).toBe(
            false,
        );
        expect(
            Field.safeParse({
                name: 'cover',
                type: 'image',
                rules: [{ rule: 'crop', value: { ratios: ['wide'] } }],
            }).success,
        ).toBe(false);
        expect(
            Field.safeParse({ name: 'cover', type: 'image', transformBase: 'library' }).success,
        ).toBe(false);
    });

    it('names libraries, as a media field does', () => {
        const definition = createDefinition();
        const authors = definition.resources.find((resource) => resource.id === 'authors');
        authors?.fields.push({ name: 'cover', type: 'image' });
        authors?.fields.push({ name: 'banner', type: 'image', resource: 'pages' });
        expect(lintDefinition(definition)).toEqual([
            {
                path: 'resources.1.fields.3.resource',
                message: 'No resource of kind `media` named `pages`.',
            },
        ]);
        definition.resources = definition.resources.filter((resource) => resource.kind !== 'media');
        const fields = definition.resources[1]?.fields ?? [];
        expect(
            lintDefinition(definition).find(
                (issue) =>
                    issue.path === `resources.1.fields.${String(fields.length - 2)}.resource`,
            ),
        ).toEqual({
            path: `resources.1.fields.${String(fields.length - 2)}.resource`,
            message: 'An `image` field needs a resource of kind `media`.',
        });
    });
});
