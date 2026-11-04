import { describe, expect, it } from 'vitest';

import {
    type AppRoute,
    contextPath,
    matchAuthPage,
    matchContext,
    matchRoute,
    routePath,
} from './routes';

describe('the account route', () => {
    it('is the account page', () => {
        expect(matchRoute('/panneau/account', '/panneau')).toEqual({ name: 'account' });
        expect(matchRoute('/panneau/account/more', '/panneau')).toEqual({ name: 'not-found' });
        expect(routePath({ name: 'account' }, '/panneau')).toBe('/panneau/account');
    });
});

describe('matchAuthPage', () => {
    it('matches the auth pages under the base path', () => {
        expect(matchAuthPage('/panneau/auth/reset-password', '/panneau')).toBe('resetPassword');
        expect(matchAuthPage('/panneau/auth/verify-email/', '/panneau/')).toBe('verifyEmail');
        expect(matchAuthPage('/auth/verify-email', '/')).toBe('verifyEmail');
    });

    it('matches nothing else', () => {
        expect(matchAuthPage('/panneau', '/panneau')).toBeNull();
        expect(matchAuthPage('/panneau/auth', '/panneau')).toBeNull();
        expect(matchAuthPage('/panneau/auth/login', '/panneau')).toBeNull();
        expect(matchAuthPage('/site/auth/reset-password', '/panneau')).toBeNull();
        expect(matchAuthPage('/panneau/site/main/auth/reset-password', '/panneau')).toBeNull();
    });
});

const routes: [string, Exclude<AppRoute, { name: 'not-found' }>][] = [
    ['/panneau', { name: 'home' }],
    ['/panneau/resources/pages', { name: 'resource.index', resource: 'pages' }],
    ['/panneau/resources/pages/create', { name: 'resource.create', resource: 'pages' }],
    ['/panneau/resources/pages/12', { name: 'resource.show', resource: 'pages', id: '12' }],
    ['/panneau/resources/pages/12/edit', { name: 'resource.edit', resource: 'pages', id: '12' }],
    ['/panneau/pages/settings', { name: 'page', page: 'settings' }],
    ['/panneau/pages/job/4f2a', { name: 'page', page: 'job', segments: ['4f2a'] }],
    ['/panneau/pages/run/a%2Fb/2', { name: 'page', page: 'run', segments: ['a/b', '2'] }],
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

describe('the context in the path (decision 0045)', () => {
    const names = ['client', 'contest'];

    it('is a prefix of the routes, in the order of the params', () => {
        expect(contextPath({ contest: '12', client: 'a/b' }, names)).toBe(
            '/client/a%2Fb/contest/12',
        );
        expect(contextPath({}, names)).toBe('');
    });

    it('is read after the base path, which then includes it', () => {
        expect(
            matchContext('/panneau/client/a%2Fb/contest/12/resources/pages', '/panneau', names),
        ).toEqual({
            values: { client: 'a/b', contest: '12' },
            basePath: '/panneau/client/a%2Fb/contest/12',
        });
        const { basePath } = matchContext(
            '/panneau/contest/12/resources/pages',
            '/panneau/',
            names,
        );
        expect(matchRoute('/panneau/contest/12/resources/pages', basePath)).toEqual({
            name: 'resource.index',
            resource: 'pages',
        });
        expect(matchContext('/', '/', names)).toEqual({ values: {}, basePath: '' });
    });

    it('stops at a segment that is not a param, or a param without a value', () => {
        expect(matchContext('/panneau/resources/pages', '/panneau', names).values).toEqual({});
        expect(matchContext('/panneau/contest', '/panneau', names).values).toEqual({});
        expect(matchContext('/panneau/contest/1/contest/2', '/panneau', names)).toEqual({
            values: { contest: '1' },
            basePath: '/panneau/contest/1',
        });
        expect(matchContext('/elsewhere/contest/1', '/panneau', names).values).toEqual({});
    });
});
