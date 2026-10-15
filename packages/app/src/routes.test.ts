import { describe, expect, it } from 'vitest';

import { type AppRoute, matchRoute, routePath } from './routes';

const routes: [string, Exclude<AppRoute, { name: 'not-found' }>][] = [
    ['/panneau', { name: 'home' }],
    ['/panneau/resources/pages', { name: 'resource.index', resource: 'pages' }],
    ['/panneau/resources/pages/create', { name: 'resource.create', resource: 'pages' }],
    ['/panneau/resources/pages/12', { name: 'resource.show', resource: 'pages', id: '12' }],
    ['/panneau/resources/pages/12/edit', { name: 'resource.edit', resource: 'pages', id: '12' }],
    ['/panneau/pages/settings', { name: 'page', page: 'settings' }],
];

describe('routes', () => {
    it.each(routes)('%s', (path, route) => {
        expect(matchRoute(path, '/panneau')).toEqual(route);
        expect(routePath(route, '/panneau')).toBe(path);
    });

    it('ignores a trailing slash on the base path and the path', () => {
        expect(matchRoute('/panneau/resources/pages/', '/panneau/')).toEqual({
            name: 'resource.index',
            resource: 'pages',
        });
        expect(routePath({ name: 'resource.index', resource: 'pages' }, '/panneau/')).toBe(
            '/panneau/resources/pages',
        );
    });

    it('works at the root of a domain', () => {
        expect(matchRoute('/', '/')).toEqual({ name: 'home' });
        expect(matchRoute('/resources/pages/12', '/')).toEqual({
            name: 'resource.show',
            resource: 'pages',
            id: '12',
        });
        expect(routePath({ name: 'home' }, '/')).toBe('/');
        expect(routePath({ name: 'resource.create', resource: 'pages' }, '/')).toBe(
            '/resources/pages/create',
        );
    });

    it('encodes ids, which are opaque', () => {
        const route = { name: 'resource.edit', resource: 'pages', id: 'a/b c' } as const;
        expect(routePath(route, '/panneau')).toBe('/panneau/resources/pages/a%2Fb%20c/edit');
        expect(matchRoute('/panneau/resources/pages/a%2Fb%20c/edit', '/panneau')).toEqual(route);
    });

    it('returns null outside the base path', () => {
        expect(matchRoute('/', '/panneau')).toBeNull();
        expect(matchRoute('/panneau-other', '/panneau')).toBeNull();
    });

    it.each([
        '/panneau/unknown',
        '/panneau/resources',
        '/panneau/resources/pages/12/delete',
        '/panneau/resources/pages/12/edit/more',
        '/panneau/pages',
        '/panneau/resources//12',
        '/panneau/resources/%E0%A4%A',
    ])('%s is not found', (path) => {
        expect(matchRoute(path, '/panneau')).toEqual({ name: 'not-found' });
    });
});
