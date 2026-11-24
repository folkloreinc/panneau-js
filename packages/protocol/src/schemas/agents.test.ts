import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, it } from 'vitest';

import { createAgentsJsonSchema } from '../openapi';
import {
    AGENT_TOOLS,
    AgentDescribeArguments,
    AgentDescribeResult,
    AgentFindItemsArguments,
    AgentFindItemsResult,
    AgentGetItemArguments,
    AgentResourceDescription,
    AgentRunActionArguments,
    AgentRunActionResult,
    AgentSaveItemArguments,
    Item,
    agentToolSchemas,
} from './index';

const item = { id: '12', version: 'v3', abilities: { update: true }, title: 'Hello' };

const description = {
    id: 'articles',
    label: { singular: 'Article', plural: 'Articles' },
    description: 'News articles of the site, published on the home page.',
    fields: [
        { name: 'title', type: 'text', label: 'Title', localized: true, required: true },
        { name: 'slug', type: 'text', required: 'create', createOnly: true },
        { name: 'tags', type: 'relation', resource: 'tags', multiple: true },
        { name: 'author', type: 'relation', resource: 'people' },
        { name: 'status', type: 'select', options: [{ value: 'draft', label: 'Draft' }] },
        {
            name: 'blocks',
            type: 'repeater',
            types: [{ id: 'text', label: 'Text', fields: [{ name: 'body', type: 'richtext' }] }],
        },
        { name: 'seo', type: 'group', fields: [{ name: 'title', type: 'text', readOnly: true }] },
    ],
    types: [{ id: 'news', label: 'News', fields: [] }],
    abilities: { viewAny: true, create: true },
    list: {
        filters: [{ id: 'status', type: 'select' }],
        sorts: ['title'],
        defaultSort: '-title',
        search: true,
    },
    actions: [
        { id: 'delete', label: 'Delete', scope: ['item', 'selection'], destructive: true },
        { id: 'publish', label: 'Publish', scope: ['item'], confirmation: true, dryRun: true },
    ],
};

const accepts =
    (schema: { safeParse: (value: unknown) => { success: boolean } }) => (value: unknown) =>
        schema.safeParse(value).success;

describe('the tools of agents', () => {
    it('lists five tools, two of which write', () => {
        expect(Object.keys(AGENT_TOOLS)).toEqual(Object.keys(agentToolSchemas));
        expect(
            Object.entries(AGENT_TOOLS)
                .filter(([, tool]) => tool.writes)
                .map(([name]) => name),
        ).toEqual(['save_item', 'run_action']);
    });

    it('describes the resources, or one resource', () => {
        const args = accepts(AgentDescribeArguments);
        expect(args({})).toBe(true);
        expect(args({ resource: 'articles', parts: ['fields', 'actions'] })).toBe(true);
        expect(args({ resource: 'articles', parts: ['layout'] })).toBe(false);
        expect(args({ parts: ['fields'] })).toBe(false);
        expect(args({ resource: 'articles', page: 2 })).toBe(false);

        const result = accepts(AgentDescribeResult);
        expect(
            result({
                resources: [
                    {
                        id: 'articles',
                        label: { singular: 'Article', plural: 'Articles' },
                        abilities: { viewAny: true, create: false },
                    },
                ],
                context: { params: [{ name: 'site', label: 'Site', value: 'ca' }] },
            }),
        ).toBe(true);
        expect(AgentResourceDescription.safeParse(description).success).toBe(true);
        expect(result(description)).toBe(true);
    });

    it('searches every resource, or lists one', () => {
        const args = accepts(AgentFindItemsArguments);
        expect(args({ q: 'hello', limit: 5 })).toBe(true);
        expect(args({ q: 'hello', filter: { status: 'draft' } })).toBe(false);
        expect(args({ limit: 5 })).toBe(false);
        expect(
            args({ resource: 'articles', filter: { status: 'draft' }, sort: '-title', page: 2 }),
        ).toBe(true);
        expect(args({ resource: 'articles', cursor: 'abc', perPage: 50, fields: ['title'] })).toBe(
            true,
        );
        expect(args({ resource: 'articles', perPage: 51 })).toBe(false);
        expect(args({ resource: 'articles', page: 2, cursor: 'abc' })).toBe(false);
        expect(args({ resource: 'articles', limit: 5 })).toBe(false);

        const result = accepts(AgentFindItemsResult);
        expect(result({ data: [{ resource: 'articles', items: [item], total: 1 }] })).toBe(true);
        expect(
            result({ data: [item], meta: { page: 1, perPage: 50, total: 1, lastPage: 1 } }),
        ).toBe(true);
    });

    it('gets an item, with its version and its abilities', () => {
        expect(AgentGetItemArguments.safeParse({ resource: 'articles', id: '12' }).success).toBe(
            true,
        );
        expect(AgentGetItemArguments.safeParse({ resource: 'articles' }).success).toBe(false);
        expect(Item.safeParse(item).success).toBe(true);
    });

    it('creates an item, or changes one at the version it read', () => {
        const args = accepts(AgentSaveItemArguments);
        expect(args({ resource: 'articles', type: 'news', values: { title: 'Hi' } })).toBe(true);
        expect(
            args({ resource: 'articles', id: '12', version: 'v3', values: { title: 'Hi' } }),
        ).toBe(true);
        expect(args({ resource: 'articles', id: '12', version: null, values: {} })).toBe(true);
        expect(args({ resource: 'articles', id: '12', values: { title: 'Hi' } })).toBe(false);
        expect(args({ resource: 'articles', version: 'v3', values: {} })).toBe(false);
        expect(
            args({ resource: 'articles', id: '12', version: 'v3', type: 'news', values: {} }),
        ).toBe(false);
        expect(agentToolSchemas.save_item.result.safeParse(item).success).toBe(true);
    });

    it('runs an action, or asks for a confirmation first', () => {
        const args = accepts(AgentRunActionArguments);
        expect(
            args({
                resource: 'articles',
                action: 'publish',
                selection: { ids: ['12'] },
                dryRun: true,
            }),
        ).toBe(true);
        expect(
            args({
                resource: 'articles',
                action: 'delete',
                selection: { query: { filter: { status: 'draft' } } },
                confirmation: 'signed-token',
            }),
        ).toBe(true);
        expect(args({ resource: 'articles' })).toBe(false);

        const result = accepts(AgentRunActionResult);
        expect(
            result({
                status: 'confirmation_required',
                message: 'Delete 140 articles?',
                preview: { count: 140 },
                confirmation: 'signed-token',
            }),
        ).toBe(true);
        expect(
            result({
                message: 'Deleted.',
                summary: { succeeded: 1, failed: 0, skipped: 0 },
                undo: { action: 'restore', items: ['12'] },
            }),
        ).toBe(true);
        expect(result({ item })).toBe(true);
    });

    it('writes a JSON Schema of each tool that accepts the same examples', () => {
        const schema = createAgentsJsonSchema();
        const ajv = new Ajv2020({ strict: false });
        const validate = ajv.compile(schema);
        const calls = {
            describe: { arguments: { resource: 'articles' }, result: description },
            find_items: { arguments: { q: 'hello' }, result: { data: [] } },
            get_item: { arguments: { resource: 'articles', id: '12' }, result: item },
            save_item: {
                arguments: { resource: 'articles', id: '12', version: 'v3', values: {} },
                result: item,
            },
            run_action: {
                arguments: { resource: 'articles', action: 'publish' },
                result: { message: 'Published.' },
            },
        };
        expect(validate(calls)).toBe(true);
        const unknownArgument = {
            ...calls.get_item,
            arguments: { resource: 'a', id: '1', other: 1 },
        };
        expect(validate({ ...calls, get_item: unknownArgument })).toBe(false);
        const bigPage = { ...calls.find_items, arguments: { resource: 'a', perPage: 51 } };
        expect(validate({ ...calls, find_items: bigPage })).toBe(false);
    });
});

describe('a field, as an agent reads it', () => {
    it('takes a required mode, not any string', () => {
        expect(
            AgentResourceDescription.safeParse({
                ...description,
                fields: [{ name: 'slug', type: 'text', required: 'always' }],
            }).success,
        ).toBe(false);
    });
});
