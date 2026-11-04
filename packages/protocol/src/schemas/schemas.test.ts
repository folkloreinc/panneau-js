import { describe, expect, it } from 'vitest';

import { createDefinition } from '../__fixtures__/definition';
import { lintDefinition } from '../lint';
import { validate, validateDefinition } from '../validate';
import {
    Action,
    CreditsValue,
    Definition,
    Field,
    Item,
    ListResponse,
    MediaTransform,
    Problem,
    RichTextSettings,
} from './index';

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

    it('takes what opens an item, and keeps a value it does not know', () => {
        const definition = createDefinition();
        const [first, second] = definition.resources;
        if (first === undefined || second === undefined) {
            throw new Error('Fixture has no resources.');
        }
        first.open = 'edit';
        second.open = 'site';
        const parsed = Definition.parse(definition);
        expect(parsed.resources[0]?.open).toBe('edit');
        expect(parsed.resources[1]?.open).toBe('site');
        expect(
            validateDefinition({ ...definition, resources: [{ ...first, open: '' }] }).success,
        ).toBe(false);
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

    it('gives the options of a select a tone, a name of the theme', () => {
        const field = (tone: string) => ({
            name: 'status',
            type: 'select',
            options: [{ value: 'failed', label: 'Failed', tone }],
        });
        expect(Field.safeParse(field('danger')).success).toBe(true);
        expect(Field.safeParse(field('brand-signal')).success).toBe(true);
        expect(Field.safeParse(field('Danger!')).success).toBe(false);
    });

    it('describes the settings of richtext fields', () => {
        expect(
            RichTextSettings.safeParse({
                toolbar: ['heading', 'style', '|', 'bold', 'logo'],
                headings: [2, 3],
                styles: [{ label: 'Big paragraph', class: 'big', element: 'p' }],
                links: { newTab: 'external' },
            }).success,
        ).toBe(true);
        expect(RichTextSettings.safeParse({ headings: [7] }).success).toBe(false);
        expect(RichTextSettings.safeParse({ styles: [{ label: 'Big' }] }).success).toBe(false);
        expect(
            RichTextSettings.safeParse({ styles: [{ label: 'Box', class: 'box', element: 'div' }] })
                .success,
        ).toBe(false);
        expect(RichTextSettings.safeParse({ links: { newTab: 'always' } }).success).toBe(false);
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

    it('needs a label, except for the built-in item actions', () => {
        expect(Action.safeParse({ id: 'delete', scope: ['item'] }).success).toBe(true);
        expect(Action.safeParse({ id: 'duplicate', scope: ['item'] }).success).toBe(true);
        expect(Action.safeParse({ id: 'publish', scope: ['item'] }).success).toBe(false);
        expect(Action.safeParse({ id: 'edit', kind: 'link', scope: ['item'] }).success).toBe(true);
        expect(Action.safeParse({ id: 'show', kind: 'link', scope: ['item'] }).success).toBe(true);
    });

    it('resolves the built-in links without a url or a route', () => {
        expect(Action.parse({ id: 'edit', kind: 'link', scope: ['item'] })).toEqual({
            id: 'edit',
            kind: 'link',
            scope: ['item'],
        });
        expect(
            Action.safeParse({
                id: 'edit',
                label: 'Edit',
                kind: 'link',
                url: '/e/{id}',
                scope: ['item'],
            }).success,
        ).toBe(true);
    });

    it('reserves the ids of the built-in links for links', () => {
        const result = Action.safeParse({ id: 'edit', label: 'Edit', scope: ['item'] });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.path).toEqual(['kind']);
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

describe('validateDefinition', () => {
    it('checks the settings of richtext fields, nested ones included', () => {
        const definition = createDefinition();
        const resource = definition.resources[0];
        if (resource === undefined) {
            throw new Error('Fixture has no resource.');
        }
        const count = resource.fields.length;
        resource.fields.push(
            { name: 'lead', type: 'richtext', settings: { headings: [2], toolbar: ['bold'] } },
            { name: 'notes', type: 'richtext', settings: { headings: [7] } },
            {
                name: 'aside',
                type: 'group',
                fields: [
                    {
                        name: 'text',
                        type: 'richtext',
                        settings: { styles: [{ label: 'Big' }], links: { newTab: 'always' } },
                    },
                ],
            },
        );
        const result = validateDefinition(definition);
        expect(result.success).toBe(false);
        expect(result.success ? [] : result.issues.map((issue) => issue.path)).toEqual([
            `resources.0.fields.${String(count + 1)}.settings.headings.0`,
            `resources.0.fields.${String(count + 2)}.fields.0.settings.styles.0.class`,
            `resources.0.fields.${String(count + 2)}.fields.0.settings.links.newTab`,
        ]);
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

    it('checks the resources and the fields of credits', () => {
        const definition = createDefinition();
        const authors = definition.resources.find((resource) => resource.id === 'authors');
        if (authors === undefined) {
            throw new Error('Fixture has no authors.');
        }
        const index = authors.fields.length;
        authors.fields.push({
            name: 'credits',
            type: 'credits',
            resource: 'authors',
            settings: { roles: 'authors', featured: true },
            fields: [{ name: 'note', type: 'text' }],
        });
        expect(lintDefinition(definition)).toEqual([]);
        authors.fields[index] = {
            name: 'credits',
            type: 'credits',
            resource: 'people',
            settings: { roles: 'roles' },
            fields: [{ name: 'featured', type: 'boolean' }],
        };
        const at = `resources.1.fields.${String(index)}`;
        expect(lintDefinition(definition)).toEqual([
            {
                path: `${at}.fields.0.name`,
                message: '`featured` is a key of every credit: a field of the credit can’t use it.',
            },
            { path: `${at}.resource`, message: 'No resource `people`.' },
            { path: `${at}.settings.roles`, message: 'No resource `roles`.' },
        ]);
        authors.fields[index] = { name: 'credits', type: 'credits', resource: ['authors'] };
        expect(lintDefinition(definition)).toEqual([
            { path: `${at}.resource`, message: 'A `credits` field names one resource.' },
        ]);
    });

    it('checks the field and the filter of a calendar', () => {
        const definition = createDefinition();
        const pages = definition.resources[0];
        if (pages === undefined) {
            throw new Error('Fixture has no resource.');
        }
        pages.list = {
            ...pages.list,
            filters: [{ id: 'published_at', type: 'date-range' }],
            calendar: { field: 'published_at' },
        };
        expect(lintDefinition(definition)).toEqual([]);
        pages.list.calendar = { field: 'title', filter: 'day' };
        expect(lintDefinition(definition)).toEqual([
            {
                path: 'resources.0.list.calendar.field',
                message: 'The field of a calendar must be a `date`, a `datetime` or a `daterange`.',
            },
            {
                path: 'resources.0.list.calendar',
                message: 'The calendar needs a `date-range` filter `day` in the list.',
            },
        ]);
        pages.list.calendar = { field: 'missing' };
        expect(lintDefinition(definition)[0]?.message).toBe('No field named `missing`.');
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

describe('CreditsValue', () => {
    it('takes references and names, for people and roles', () => {
        const value = [
            {
                person: { id: '12', label: 'Ada Lovelace' },
                roles: [{ id: '3', label: 'Director' }],
                featured: true,
            },
            {
                person: { name: 'Jane Doe' },
                roles: [{ name: { fr: 'Musique', en: 'Music' } }],
                note: 'A field of the credit',
            },
            { person: { id: '13' }, roles: [] },
        ];
        expect(CreditsValue.safeParse(value).success).toBe(true);
    });

    it('refuses a person without an id or a name, and roles that aren’t a list', () => {
        expect(CreditsValue.safeParse([{ person: {}, roles: [] }]).success).toBe(false);
        expect(CreditsValue.safeParse([{ person: '12', roles: [] }]).success).toBe(false);
        expect(CreditsValue.safeParse([{ person: { name: 'Ada' } }]).success).toBe(false);
        expect(
            CreditsValue.safeParse([{ person: { name: 'Ada' }, roles: [{ name: 'Music' }] }])
                .success,
        ).toBe(false);
    });
});
