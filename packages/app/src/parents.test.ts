import { describe, expect, it } from 'vitest';

import {
    type Definition,
    type DefinitionInput,
    Definition as DefinitionSchema,
} from '@panneau/protocol';

import { createDefinition } from './__fixtures__/definition';
import { getListKey, rememberListSearch } from './listLocation';
import { getNavigation } from './navigation';
import { getMenuRoute, getPageParents, getRouteParents } from './parents';

// Parsed without `lintDefinition()`, which refuses the broken chains these tests follow
function parse(input: DefinitionInput): Definition {
    return DefinitionSchema.parse(input);
}

/** Authors under the dashboard page "Activity", and pages under a resource or another page. */
function createParents(overrides: Partial<DefinitionInput> = {}): Definition {
    const definition = createDefinition();
    return parse({
        ...definition,
        resources: definition.resources.map((resource) =>
            resource.id === 'authors' ? { ...resource, parent: 'activity' } : resource,
        ),
        pages: {
            home: { component: 'dashboard' },
            activity: { component: 'dashboard', label: 'Activity' },
            usage: { component: 'usage', label: 'Usage', parent: 'activity' },
            report: { component: 'report', label: 'Report', parent: { resource: 'authors' } },
            job: { component: 'job', label: 'Job', params: ['id'] },
        },
        ...overrides,
    });
}

describe('getRouteParents (decision 0093)', () => {
    it('gives an item, a new item and the choice of its type the list of their resource', () => {
        const definition = parse(createDefinition());
        const list = { name: 'resource.index', resource: 'pages' };
        expect(
            getRouteParents(definition, { name: 'resource.edit', resource: 'pages', id: '1' }),
        ).toEqual([list]);
        expect(getRouteParents(definition, { name: 'resource.create', resource: 'pages' })).toEqual(
            [list],
        );
        expect(
            getRouteParents(definition, {
                name: 'resource.create',
                resource: 'pages',
                type: 'event',
            }),
        ).toEqual([list]);
    });

    it('gives a list, and the panel of its show route, no parent without a `parent`', () => {
        const definition = parse(createDefinition());
        expect(getRouteParents(definition, { name: 'resource.index', resource: 'pages' })).toEqual(
            [],
        );
        expect(
            getRouteParents(definition, { name: 'resource.show', resource: 'pages', id: '1' }),
        ).toEqual([]);
    });

    it('follows the `parent` of resources and pages, from the top', () => {
        const definition = createParents();
        const activity = { name: 'page', page: 'activity' };
        const authors = { name: 'resource.index', resource: 'authors' };
        expect(
            getRouteParents(definition, { name: 'resource.index', resource: 'authors' }),
        ).toEqual([activity]);
        expect(
            getRouteParents(definition, { name: 'resource.show', resource: 'authors', id: '1' }),
        ).toEqual([activity]);
        expect(
            getRouteParents(definition, { name: 'resource.edit', resource: 'authors', id: '1' }),
        ).toEqual([activity, authors]);
        expect(getRouteParents(definition, { name: 'page', page: 'usage' })).toEqual([activity]);
        expect(getRouteParents(definition, { name: 'page', page: 'report' })).toEqual([
            activity,
            authors,
        ]);
    });

    it('gives the home page, the account page and pages that match nothing no parent', () => {
        const definition = createParents();
        expect(getRouteParents(definition, { name: 'home' })).toEqual([]);
        expect(getRouteParents(definition, { name: 'account' })).toEqual([]);
        expect(getRouteParents(definition, { name: 'not-found' })).toEqual([]);
        expect(getRouteParents(definition, { name: 'page', page: 'missing' })).toEqual([]);
    });

    it('stops at a parent that no link leads to, that the user can’t view, or already seen', () => {
        const definition = createParents({
            pages: {
                home: { component: 'dashboard' },
                hidden: { component: 'dashboard', label: 'Hidden', abilities: { view: false } },
                job: { component: 'job', label: 'Job', params: ['id'] },
                underHome: { component: 'a', parent: 'home' },
                underJob: { component: 'b', parent: 'job' },
                underHidden: { component: 'c', parent: 'hidden' },
                underMissing: { component: 'd', parent: 'missing' },
                loopA: { component: 'e', label: 'A', parent: 'loopB' },
                loopB: { component: 'f', label: 'B', parent: 'loopA' },
            },
        });
        for (const page of ['underHome', 'underJob', 'underHidden', 'underMissing']) {
            expect(getRouteParents(definition, { name: 'page', page })).toEqual([]);
        }
        // `activity` doesn't exist here: the authors have no parent
        expect(
            getRouteParents(definition, { name: 'resource.index', resource: 'authors' }),
        ).toEqual([]);
        expect(getRouteParents(definition, { name: 'page', page: 'loopA' })).toEqual([
            { name: 'page', page: 'loopA' },
            { name: 'page', page: 'loopB' },
        ]);
    });

    it('stops at a resource the user can’t list', () => {
        const definition = createParents();
        const authors = definition.resources.find((resource) => resource.id === 'authors');
        if (authors !== undefined) {
            authors.abilities = { viewAny: false };
        }
        expect(getRouteParents(definition, { name: 'page', page: 'report' })).toEqual([]);
    });
});

describe('getPageParents', () => {
    it('links to each parent, with the label of a page and the plural of a resource', () => {
        expect(
            getPageParents(createParents(), '/panneau', {
                name: 'resource.edit',
                resource: 'authors',
                id: '1',
            }),
        ).toEqual([
            { href: '/panneau/pages/activity', label: 'Activity' },
            { href: '/panneau/resources/authors', label: 'Authors' },
        ]);
    });

    it('goes back to a list with the query it last had in this tab (decision 0102)', () => {
        const definition = createParents();
        rememberListSearch(getListKey('/panneau', definition.user?.id, 'authors'), '?page=3&q=ada');
        try {
            expect(
                getPageParents(definition, '/panneau', {
                    name: 'resource.edit',
                    resource: 'authors',
                    id: '1',
                }),
            ).toEqual([
                { href: '/panneau/pages/activity', label: 'Activity' },
                { href: '/panneau/resources/authors?page=3&q=ada', label: 'Authors' },
            ]);
        } finally {
            window.sessionStorage.clear();
        }
    });

    it('names a page without a label by its id made readable', () => {
        const definition = createParents({
            pages: {
                stats: { component: 'stats' },
                usage: { component: 'usage', parent: 'stats' },
            },
        });
        expect(getPageParents(definition, '', { name: 'page', page: 'usage' })).toEqual([
            { href: '/pages/stats', label: 'Stats' },
        ]);
    });
});

describe('getMenuRoute', () => {
    const entries = (definition: Definition) => getNavigation(definition, '/panneau');

    it('is the route when the menus lead to it', () => {
        const definition = createParents();
        const route = { name: 'resource.edit', resource: 'authors', id: '1' } as const;
        expect(getMenuRoute(definition, entries(definition), route)).toBe(route);
    });

    it('is the nearest parent the menus lead to, for a resource that isn’t in them', () => {
        const definition = createParents({
            menus: {
                main: [
                    { type: 'resource', resource: 'pages' },
                    { type: 'page', page: 'activity' },
                ],
            },
        });
        expect(
            getMenuRoute(definition, entries(definition), {
                name: 'resource.edit',
                resource: 'authors',
                id: '1',
            }),
        ).toEqual({ name: 'page', page: 'activity' });
        expect(
            getMenuRoute(definition, entries(definition), { name: 'page', page: 'report' }),
        ).toEqual({ name: 'page', page: 'activity' });
    });

    it('is the route when no parent is in the menus either', () => {
        const definition = createParents({
            menus: { main: [{ type: 'resource', resource: 'pages' }] },
        });
        const route = { name: 'page', page: 'usage' } as const;
        expect(getMenuRoute(definition, entries(definition), route)).toBe(route);
    });
});
