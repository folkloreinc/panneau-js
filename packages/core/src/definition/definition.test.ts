import { describe, expect, it } from 'vitest';

import type { Action, Item } from '@panneau/protocol';

import { createDefinition, getResource } from '../__fixtures__/definition';
import { can, getActionPlacements, isActionAllowedOn, partitionByAction } from './abilities';
import { getLayoutFieldNames, resolveFields, resolveForm } from './form';
import { getOpenMode, getResourceActions, resolveList } from './list';
import { findResource, resolveResource } from './resource';

const item = (id: string, abilities: Record<string, boolean>): Item => ({
    id,
    version: '1',
    abilities,
});

describe('resolveForm', () => {
    it('appends the fields that no layout node references, and drops unknown fields', () => {
        const form = resolveForm(getResource('pages'));
        expect(getLayoutFieldNames(form.layout)).toEqual([
            'title',
            'status',
            'published_at',
            'slug',
            'seo',
            'views',
            'body',
        ]);
        expect(form.layout.slice(1)).toEqual([
            { type: 'field', name: 'slug' },
            { type: 'field', name: 'seo' },
            { type: 'field', name: 'views' },
            { type: 'field', name: 'body' },
        ]);
        expect(JSON.stringify(form.layout)).not.toContain('removed');
        expect(form.fieldsByName.get('title')?.label).toBe('Title');
    });

    it('applies the create and update modes', () => {
        const create = resolveForm(getResource('pages'), { mode: 'create' });
        expect(create.fieldsByName.has('views')).toBe(false);
        expect(create.fieldsByName.get('slug')?.readOnly).toBeUndefined();

        const update = resolveForm(getResource('pages'), { mode: 'update' });
        expect(update.fieldsByName.has('views')).toBe(true);
        expect(update.fieldsByName.get('slug')?.readOnly).toBe(true);
    });

    it('keeps rules limited to a mode in that mode only, nested fields too', () => {
        const fields = [
            {
                name: 'password',
                type: 'text',
                rules: [
                    { rule: 'required' as const, mode: 'create' as const },
                    { rule: 'min' as const, value: 8 },
                ],
            },
            {
                name: 'blocks',
                type: 'repeater',
                types: [
                    {
                        id: 'quote',
                        label: 'Quote',
                        fields: [
                            {
                                name: 'body',
                                type: 'text',
                                rules: [{ rule: 'required' as const, mode: 'update' as const }],
                            },
                        ],
                    },
                ],
            },
        ];
        const create = resolveFields(fields, [], { mode: 'create' });
        expect(create.fieldsByName.get('password')?.rules).toEqual([
            { rule: 'required' },
            { rule: 'min', value: 8 },
        ]);
        expect(create.fieldsByName.get('blocks')?.types?.[0]?.fields[0]?.rules).toEqual([]);

        const update = resolveFields(fields, [], { mode: 'update' });
        expect(update.fieldsByName.get('password')?.rules).toEqual([{ rule: 'min', value: 8 }]);
        expect(update.fieldsByName.get('blocks')?.types?.[0]?.fields[0]?.rules).toEqual([
            { rule: 'required' },
        ]);

        expect(resolveFields(fields).fields).toEqual(fields);
    });

    it('adds the fields of an item type', () => {
        const form = resolveForm(getResource('authors'), { type: 'guest' });
        expect(form.fields.map((field) => field.name)).toContain('website');
        expect(resolveForm(getResource('authors'), { type: 'other' }).fields).toHaveLength(7);
    });

    it('works without a layout', () => {
        const form = resolveFields([{ name: 'a', type: 'text' }]);
        expect(form.layout).toEqual([{ type: 'field', name: 'a' }]);
    });
});

describe('resolveList', () => {
    it('resolves columns from the fields they show', () => {
        const list = resolveList(getResource('pages'));
        expect(list.columns).toEqual([
            expect.objectContaining({
                id: 'title',
                label: 'Title',
                display: 'text',
                sortable: true,
            }),
            expect.objectContaining({
                id: 'published_at',
                label: 'Published at',
                display: 'date',
                sortable: false,
            }),
            {
                id: 'preview',
                field: null,
                label: 'Preview',
                display: 'link',
                sortable: false,
                align: 'end',
            },
        ]);
        expect(list).toMatchObject({
            sorts: ['title', 'published_at'],
            defaultSort: ['-published_at', 'title'],
            search: true,
            layouts: ['table'],
            perPage: 10,
            selectable: true,
        });
    });

    it('shows the first fields when there are no columns', () => {
        const list = resolveList(getResource('authors'));
        expect(list.columns.map((column) => column.id)).toEqual(['name', 'email', 'phone', 'city']);
        // The built-in `delete` applies to selections: the list is selectable
        expect(list).toMatchObject({ perPage: 20, defaultSort: [], selectable: true });
        expect(resolveList({ ...getResource('authors'), itemActions: ['edit'] }).selectable).toBe(
            false,
        );
    });

    it('groups the actions the user can run by placement', () => {
        const { actions } = resolveList(getResource('pages'));
        const ids = (list: Action[]) => list.map((action) => action.id);
        // The built-in item actions first, `edit` replaced by the declared one
        expect(ids(actions.row)).toEqual(['show', 'edit', 'publish']);
        // `edit` has a URL: it keeps the placements of an item action
        expect(ids(actions.form)).toEqual(['edit', 'duplicate', 'delete', 'publish']);
        expect(ids(actions.toolbar)).toEqual(['delete', 'publish']);
        expect(ids(actions.menu)).toEqual(['duplicate', 'delete', 'export']);
    });
});

describe('abilities', () => {
    it('allow everything without abilities, and only what is true with them', () => {
        expect(can(undefined, 'create')).toBe(true);
        expect(can({ create: true }, 'create')).toBe(true);
        expect(can({ viewAny: true }, 'create')).toBe(false);
    });

    it('check actions against the abilities of items', () => {
        const actions = getResource('pages').actions ?? [];
        const [edit, publish, , purge] = actions as [Action, Action, Action, Action];
        expect(isActionAllowedOn(publish, item('1', { publish: true }))).toBe(true);
        expect(isActionAllowedOn(publish, item('1', {}))).toBe(false);
        // `edit` is a built-in item action: it needs `update`
        expect(isActionAllowedOn(edit, item('1', {}))).toBe(false);
        expect(isActionAllowedOn(edit, item('1', { update: true }))).toBe(true);
        expect(isActionAllowedOn(edit, item('1', { update: true, edit: false }))).toBe(false);
        expect(isActionAllowedOn(purge, item('1', { purge: true }))).toBe(false);

        const { allowed, skipped } = partitionByAction(publish, [
            item('1', { publish: true }),
            item('2', { publish: false }),
        ]);
        expect(allowed.map((entry) => entry.id)).toEqual(['1']);
        expect(skipped.map((entry) => entry.id)).toEqual(['2']);
    });

    it('place actions by scope when they have no placement', () => {
        expect(
            getActionPlacements({ id: 'a', label: 'A', kind: 'server', scope: ['item'] }),
        ).toEqual(['row', 'form']);
        expect(
            getActionPlacements({
                id: 'a',
                label: 'A',
                kind: 'server',
                scope: ['selection', 'resource'],
            }),
        ).toEqual(['toolbar']);
    });

    it('shows each built-in item action on the items whose ability allows it', () => {
        const [show, edit, duplicate, remove] = getResourceActions(getResource('authors')) as [
            Action,
            Action,
            Action,
            Action,
        ];
        const all = item('1', { view: true, update: true, duplicate: true, delete: true });
        [show, edit, duplicate, remove].forEach((action) => {
            expect(isActionAllowedOn(action, all)).toBe(true);
            // A missing ability hides it
            expect(isActionAllowedOn(action, item('1', {}))).toBe(false);
        });
        expect(isActionAllowedOn(show, item('1', { update: true }))).toBe(false);
        expect(isActionAllowedOn(edit, item('1', { view: true, update: false }))).toBe(false);
        expect(isActionAllowedOn(duplicate, item('1', { create: true }))).toBe(false);
        expect(isActionAllowedOn(remove, item('1', { update: true, delete: false }))).toBe(false);
        // Another link is allowed unless the item says otherwise
        const site: Action = { id: 'site', label: 'Site', kind: 'link', url: '/', scope: ['item'] };
        expect(isActionAllowedOn(site, item('1', {}))).toBe(true);
    });

    it('places the built-in links in rows only', () => {
        expect(getActionPlacements({ id: 'edit', kind: 'link', scope: ['item'] })).toEqual(['row']);
        expect(getActionPlacements({ id: 'show', kind: 'link', scope: ['item'] })).toEqual(['row']);
        expect(
            getActionPlacements({ id: 'edit', kind: 'link', scope: ['item'], placement: ['menu'] }),
        ).toEqual(['menu']);
        // With a URL, a link keeps the placements it had before decision 0040
        expect(
            getActionPlacements({ id: 'show', kind: 'link', url: '/s/{id}', scope: ['item'] }),
        ).toEqual(['row', 'form']);
    });
});

describe('getResourceActions', () => {
    const ids = (actions: Action[]) => actions.map((action) => action.id);

    it('gives every resource the built-in item actions, then those it declares', () => {
        expect(ids(getResourceActions(getResource('authors')))).toEqual([
            'show',
            'edit',
            'duplicate',
            'delete',
        ]);
        const remove = getResourceActions(getResource('authors'))[3];
        expect(remove).toMatchObject({ kind: 'server', destructive: true, confirm: true });
    });

    it('shows the built-in item actions of `itemActions`, in its order', () => {
        const resource = { ...getResource('pages'), itemActions: ['delete', 'edit', 'archive'] };
        expect(ids(getResourceActions(resource))).toEqual([
            'delete',
            'edit',
            'publish',
            'export',
            'purge',
        ]);
        // The declared `edit` replaces the built-in one
        expect(getResourceActions(resource)[1]).toMatchObject({ url: '/pages/{id}' });
        // Left out of `itemActions`, a declared built-in id is left out too
        expect(ids(getResourceActions({ ...resource, itemActions: [] }))).toEqual([
            'publish',
            'export',
            'purge',
        ]);
    });

    it('leaves out `show` when items open in their form', () => {
        const resource = getResource('authors');
        expect(getOpenMode(resource)).toBe('panel');
        expect(getOpenMode({ ...resource, open: 'site' })).toBe('panel');
        const opened = { ...resource, open: 'edit' };
        expect(getOpenMode(opened)).toBe('edit');
        expect(ids(getResourceActions(opened))).toEqual(['edit', 'duplicate', 'delete']);
        expect(ids(resolveList(opened).actions.row)).toEqual(['edit']);
    });
});

describe('resolveResource', () => {
    it('resolves the form, the list and the abilities', () => {
        const definition = createDefinition();
        const pages = findResource(definition, 'pages');
        if (pages === undefined) {
            throw new Error('No pages.');
        }
        const resolved = resolveResource(pages);
        expect(resolved.abilities).toEqual({ viewAny: true, create: false });
        expect(resolved.form.fieldsByName.has('views')).toBe(false);
        expect(resolved.list.columns).toHaveLength(3);
        expect(findResource(definition, 'unknown')).toBeUndefined();
    });
});
