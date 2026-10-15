import { describe, expect, it } from 'vitest';

import type { Action, Item } from '@panneau/protocol';

import { createDefinition, getResource } from '../__fixtures__/definition';
import { can, getActionPlacements, isActionAllowedOn, partitionByAction } from './abilities';
import { getLayoutFieldNames, resolveFields, resolveForm } from './form';
import { resolveList } from './list';
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
        expect(list).toMatchObject({ perPage: 20, defaultSort: [], selectable: false });
    });

    it('groups the actions the user can run by placement', () => {
        const { actions } = resolveList(getResource('pages'));
        const ids = (list: Action[]) => list.map((action) => action.id);
        expect(ids(actions.row)).toEqual(['edit', 'publish']);
        expect(ids(actions.form)).toEqual(['edit', 'publish']);
        expect(ids(actions.toolbar)).toEqual(['publish']);
        expect(ids(actions.menu)).toEqual(['export']);
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
        expect(isActionAllowedOn(edit, item('1', {}))).toBe(true);
        expect(isActionAllowedOn(edit, item('1', { edit: false }))).toBe(false);
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
