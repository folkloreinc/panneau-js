import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-aria-components';
import { describe, expect, it, vi } from 'vitest';

import { Breadcrumbs } from './Breadcrumbs';

const items = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'pages', label: 'Pages', href: '/pages' },
    { id: 'guides', label: 'Guides', href: '/pages/guides' },
    { id: 'setup', label: 'Setting up a site', href: '/pages/guides/setup' },
    { id: 'domains', label: 'Domains' },
];

describe('Breadcrumbs', () => {
    it('is a named navigation with a link to each parent, and the current page last', () => {
        render(<Breadcrumbs items={items.slice(0, 3)} />);
        const nav = screen.getByRole('navigation', { name: 'Breadcrumbs' });
        expect(within(nav).getAllByRole('listitem')).toHaveLength(3);
        expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
        expect(within(nav).getByRole('link', { name: 'Pages' })).toHaveAttribute('href', '/pages');
        const current = within(nav).getByText('Guides').closest('[aria-current]');
        expect(current).toHaveAttribute('aria-current', 'page');
        expect(current).not.toHaveAttribute('href');
        expect(nav.querySelectorAll('svg[aria-hidden="true"]')).toHaveLength(2);
    });

    it('goes through the router', async () => {
        const navigate = vi.fn();
        render(
            <RouterProvider navigate={navigate}>
                <Breadcrumbs items={items.slice(0, 2)} />
            </RouterProvider>,
        );
        await userEvent.click(screen.getByRole('link', { name: 'Home' }));
        expect(navigate).toHaveBeenCalledWith('/', undefined);
    });

    it('folds the middle crumbs into a menu', async () => {
        render(<Breadcrumbs items={items} maxItems={3} />);
        const nav = screen.getByRole('navigation');
        expect(within(nav).getAllByRole('listitem')).toHaveLength(3);
        expect(within(nav).getByRole('link', { name: 'Home' })).toBeInTheDocument();
        expect(within(nav).queryByRole('link', { name: 'Pages' })).toBeNull();
        await userEvent.click(within(nav).getByRole('button', { name: 'More pages' }));
        const menu = await screen.findByRole('menu');
        expect(
            within(menu)
                .getAllByRole('menuitem')
                .map((item) => item.textContent),
        ).toEqual(['Pages', 'Guides', 'Setting up a site']);
        expect(within(menu).getByRole('menuitem', { name: 'Guides' })).toHaveAttribute(
            'href',
            '/pages/guides',
        );
    });

    it('shows the last ones with a larger maxItems', () => {
        render(<Breadcrumbs items={items} maxItems={4} />);
        expect(screen.getAllByRole('listitem')).toHaveLength(4);
        expect(screen.getByRole('link', { name: 'Setting up a site' })).toBeInTheDocument();
    });

    it('shows every crumb when they fit', () => {
        render(<Breadcrumbs items={items} maxItems={5} label="Pages" />);
        expect(screen.getByRole('navigation', { name: 'Pages' })).toBeInTheDocument();
        expect(screen.queryByRole('button')).toBeNull();
    });
});
