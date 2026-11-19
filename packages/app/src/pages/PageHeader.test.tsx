import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PanneauProvider } from '@panneau/core';
import { Definition, type DefinitionInput } from '@panneau/protocol';

import { createDefinition } from '../__fixtures__/definition';
import { PageRouteContext } from '../pageRoute';
import type { AppRoute } from '../routes';
import { PageHeader, type PageHeaderProps } from './PageHeader';

const definition = Definition.parse(
    createDefinition({
        pages: { activity: { component: 'dashboard', label: 'Activity' } },
        resources: createDefinition().resources.map((resource) =>
            resource.id === 'authors' ? { ...resource, parent: 'activity' } : resource,
        ),
    } satisfies Partial<DefinitionInput>),
);

/** The header in the app, on a route. */
function renderHeader(props: PageHeaderProps, route?: AppRoute) {
    return render(
        <PanneauProvider definition={definition}>
            {route !== undefined ? (
                <PageRouteContext value={{ route, basePath: '/panneau' }}>
                    <PageHeader {...props} />
                </PageRouteContext>
            ) : (
                <PageHeader {...props} />
            )}
        </PanneauProvider>,
    );
}

const crumbs = () => screen.queryByRole('navigation', { name: 'Breadcrumbs' });

describe('PageHeader (decision 0093)', () => {
    it('shows no parent outside a route, without `parents`', () => {
        renderHeader({ title: 'Usage' });
        expect(screen.queryByRole('link')).toBeNull();
    });

    it('links to a single parent, without breadcrumbs', () => {
        renderHeader({
            title: 'Ada',
            parents: [{ href: '/panneau/resources/authors', label: 'Authors' }],
        });
        expect(screen.getByRole('link', { name: 'Authors' })).toHaveAttribute(
            'href',
            '/panneau/resources/authors',
        );
        expect(crumbs()).toBeNull();
    });

    it('takes the parents of its route by default, and none with `parents={[]}`', () => {
        const route: AppRoute = { name: 'resource.edit', resource: 'authors', id: '1' };
        const { unmount } = renderHeader({ title: 'Ada' }, route);
        const nav = crumbs();
        expect(nav).not.toBeNull();
        expect(
            within(nav as HTMLElement)
                .getAllByRole('listitem')
                .map((item) => item.textContent),
        ).toEqual(['Activity', 'Authors', 'Ada']);
        unmount();
        renderHeader({ title: 'Ada', parents: [] }, route);
        expect(screen.queryByRole('link')).toBeNull();
    });

    it('names the page in its crumb with `crumbLabel`, or links to the nearest parent without one', () => {
        const parents = [
            { href: '/panneau/pages/activity', label: 'Activity' },
            { href: '/panneau/resources/authors', label: 'Authors' },
        ];
        const { unmount } = renderHeader({ title: <em>Ada</em>, crumbLabel: 'Ada', parents });
        expect(within(crumbs() as HTMLElement).getByText('Ada')).toBeInTheDocument();
        unmount();
        renderHeader({ title: <em>Ada</em>, parents });
        expect(crumbs()).toBeNull();
        expect(screen.getByRole('link', { name: 'Authors' })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Activity' })).toBeNull();
    });

    it('shows a skeleton for a title that loads, and for its crumb', () => {
        renderHeader(
            { title: 'Edit author', isLoading: true },
            {
                name: 'resource.edit',
                resource: 'authors',
                id: '1',
            },
        );
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Loading…');
        expect(screen.queryByText('Edit author')).toBeNull();
        const nav = crumbs() as HTMLElement;
        expect(within(nav).getByText('Loading…').closest('[aria-current]')).toHaveAttribute(
            'aria-current',
            'page',
        );
    });
});
