import { describe, expect, it } from 'vitest';

import { type DefinitionInput, validateDefinition } from '@panneau/protocol';

import { createDefinition } from './__fixtures__/definition';
import { capitalize, getNavigation, getProfilePath, isCurrent } from './navigation';

function parse(input: DefinitionInput) {
    const result = validateDefinition(input);
    if (!result.success) {
        throw new Error(JSON.stringify(result.issues));
    }
    return result.data;
}

describe('getNavigation', () => {
    it('lists every resource and page without a main menu', () => {
        const definition = parse(
            createDefinition({ pages: { stats: { component: 'stats', label: 'Statistics' } } }),
        );
        expect(
            getNavigation(definition, '/panneau').map((entry) =>
                entry.type === 'link' ? [entry.label, entry.href] : entry.type,
            ),
        ).toEqual([
            ['Pages', '/panneau/resources/pages'],
            ['Authors', '/panneau/resources/authors'],
            ['Statistics', '/panneau/pages/stats'],
        ]);
    });

    it('follows the main menu: groups, separators, labels and icons of its own', () => {
        const definition = parse(
            createDefinition({
                menus: {
                    main: [
                        { type: 'resource', resource: 'authors', label: 'People', icon: 'users' },
                        { type: 'separator' },
                        {
                            type: 'group',
                            label: 'Content',
                            children: [
                                { type: 'resources' },
                                { type: 'group', children: [{ type: 'link', url: '/' }] },
                            ],
                        },
                        { type: 'link', label: 'Docs', url: 'https://example.com', external: true },
                        { type: 'unknown' },
                        { type: 'resource', resource: 'missing' },
                    ],
                },
            }),
        );
        expect(getNavigation(definition, '/')).toEqual([
            {
                type: 'link',
                key: '0:authors',
                label: 'People',
                href: '/resources/authors',
                icon: 'users',
                target: { kind: 'resource', resource: 'authors' },
            },
            { type: 'separator', key: '1' },
            {
                type: 'group',
                key: '2',
                label: 'Content',
                children: [
                    expect.objectContaining({ key: '2.0:pages', label: 'Pages' }),
                    expect.objectContaining({ key: '2.0:authors', label: 'Authors' }),
                    expect.objectContaining({
                        key: '2.1.0',
                        label: '/',
                        href: '/',
                        target: { kind: 'url', external: false },
                    }),
                ],
            },
            expect.objectContaining({
                label: 'Docs',
                href: 'https://example.com',
                target: { kind: 'url', external: true },
            }),
        ]);
    });

    it('leaves out the resources the user can’t list', () => {
        const input = createDefinition();
        input.resources = input.resources.map((resource) =>
            resource.id === 'authors' ? { ...resource, abilities: { viewAny: false } } : resource,
        );
        const labels = getNavigation(parse(input), '/panneau').map(
            (entry) => entry.type === 'link' && entry.label,
        );
        expect(labels).toEqual(['Pages']);
    });
});

describe('isCurrent', () => {
    it('marks a resource as current on all of its pages', () => {
        const target = { kind: 'resource', resource: 'pages' } as const;
        expect(isCurrent(target, { name: 'resource.index', resource: 'pages' })).toBe(true);
        expect(isCurrent(target, { name: 'resource.edit', resource: 'pages', id: '1' })).toBe(true);
        expect(isCurrent(target, { name: 'resource.index', resource: 'authors' })).toBe(false);
        expect(isCurrent({ kind: 'home' }, { name: 'home' })).toBe(true);
        expect(isCurrent({ kind: 'home' }, { name: 'not-found' })).toBe(false);
    });
});

describe('getProfilePath', () => {
    const users = {
        id: 'users',
        label: { singular: 'user', plural: 'users' },
        fields: [{ name: 'name', type: 'text' }],
    };

    it("leads to the user's item in the resource users", () => {
        const definition = parse(
            createDefinition({ resources: [...createDefinition().resources, users] }),
        );
        expect(getProfilePath(definition, '/panneau')).toBe('/panneau/resources/users/usr_1/edit');
    });

    it('reads the resource of users from the user', () => {
        const definition = parse(
            createDefinition({ user: { id: '7', name: 'Ada', resource: 'authors' } }),
        );
        expect(getProfilePath(definition, '/panneau')).toBe('/panneau/resources/authors/7/edit');
    });

    it('is null without a resource of users', () => {
        expect(getProfilePath(parse(createDefinition()), '/panneau')).toBeNull();
    });
});

describe('capitalize', () => {
    it('puts the first letter in upper case', () => {
        expect(capitalize('éditions', 'fr')).toBe('Éditions');
    });
});
