import { describe, expect, it } from 'vitest';

import { createDefinition } from './__fixtures__/definition';
import { lintDefinition } from './lint';
import {
    getCreatableTypes,
    getItemType,
    getResourceType,
    getTypeFields,
    hasResourceTypes,
} from './resourceTypes';
import type { DefinitionInput, ResourceInput } from './schemas';

function createPages(overrides: Partial<ResourceInput> = {}): ResourceInput {
    return {
        id: 'posts',
        label: { singular: 'post', plural: 'posts' },
        fields: [
            { name: 'title', type: 'text' },
            { name: 'type', type: 'select', notInForm: true },
        ],
        types: [
            { id: 'home', label: 'Home', fields: [], abilities: { create: false } },
            {
                id: 'event',
                label: 'Event',
                fields: [
                    { name: 'starts_at', type: 'datetime' },
                    { name: 'venue', type: 'relation', resource: 'venues' },
                ],
            },
            { id: 'article', label: 'Article', fields: [{ name: 'body', type: 'richtext' }] },
        ],
        form: {
            layout: [
                { type: 'field', name: 'title' },
                { type: 'field', name: 'starts_at' },
                { type: 'field', name: 'body' },
            ],
        },
        ...overrides,
    };
}

function withPages(pages: ResourceInput): DefinitionInput {
    const definition = createDefinition();
    return { ...definition, resources: [...definition.resources, pages] };
}

describe('resource types (decision 0075)', () => {
    it('finds the type of an item and the types a user can create', () => {
        const pages = createPages();
        expect(hasResourceTypes(pages)).toBe(true);
        expect(hasResourceTypes({ types: [] })).toBe(false);
        expect(hasResourceTypes({})).toBe(false);
        expect(getResourceType(pages, 'event')?.label).toBe('Event');
        expect(getResourceType(pages, 'other')).toBeUndefined();
        expect(getResourceType(pages, 3)).toBeUndefined();
        expect(getItemType(pages, { id: '1', type: 'home' })?.label).toBe('Home');
        expect(getItemType({ types: undefined }, { type: 'home' })).toBeUndefined();
        // The home page is a singleton: it isn't offered when creating
        expect(getCreatableTypes(pages).map((type) => type.id)).toEqual(['event', 'article']);
        expect(getCreatableTypes({})).toEqual([]);
    });

    it('gives the fields of a type after those of the resource', () => {
        const pages = createPages();
        expect(getTypeFields(pages, 'event').map((field) => field.name)).toEqual([
            'title',
            'type',
            'starts_at',
            'venue',
        ]);
        expect(getTypeFields(pages, 'other').map((field) => field.name)).toEqual(['title', 'type']);
        expect(getTypeFields(pages, undefined)).toEqual(pages.fields);
    });

    it('lets the layout name the fields of the types, and lints their references', () => {
        expect(lintDefinition(withPages(createPages()))).toEqual([
            {
                path: 'resources.3.types.1.fields.1.resource',
                message: 'No resource `venues`.',
            },
        ]);
    });

    it('lints ids, field names and the `type` field', () => {
        const pages = createPages({
            fields: [
                { name: 'title', type: 'text' },
                { name: 'type', type: 'select' },
            ],
            types: [
                {
                    id: 'event',
                    label: 'Event',
                    fields: [
                        { name: 'title', type: 'text' },
                        { name: 'when', type: 'date' },
                        { name: 'when', type: 'date' },
                    ],
                },
                { id: 'event', label: 'Again', fields: [] },
            ],
            form: { layout: [{ type: 'field', name: 'body' }] },
        });
        expect(lintDefinition(withPages(pages))).toEqual([
            {
                path: 'resources.3.types.0.fields',
                message: 'Field names must be unique.',
            },
            {
                path: 'resources.3.types.0.fields.0.name',
                message: 'The resource already has a field named `title`.',
            },
            { path: 'resources.3.types.1.id', message: 'Duplicate type id `event`.' },
            {
                path: 'resources.3.fields.1',
                message:
                    '`type` holds the type of the item, set when it is created: its field must be `notInForm`.',
            },
            { path: 'resources.3.form.layout.0.name', message: 'No field named `body`.' },
        ]);
    });

    it('keeps `type` for the type of the item', () => {
        const pages = createPages({
            fields: [{ name: 'title', type: 'text' }],
            types: [{ id: 'event', label: 'Event', fields: [{ name: 'type', type: 'text' }] }],
            form: {},
        });
        expect(lintDefinition(withPages(pages))).toEqual([
            {
                path: 'resources.3.types.0.fields.0.name',
                message: '`type` holds the type of the item.',
            },
        ]);
    });
});
