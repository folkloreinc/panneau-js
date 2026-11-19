import type { Meta, StoryObj } from '@storybook/react-vite';
import { RouterProvider } from 'react-aria-components';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Breadcrumbs } from './Breadcrumbs';

const navigate = fn();

const meta = {
    title: 'UI/Breadcrumbs',
    component: Breadcrumbs,
    args: {
        items: [
            { id: 'home', label: 'Home', href: '/' },
            { id: 'pages', label: 'Pages', href: '/pages' },
            { id: 'guides', label: 'Guides', href: '/pages/guides' },
            {
                id: 'setup',
                label: 'Setting up a site with a custom domain and a mailing list',
                href: '/pages/guides/setup',
            },
            { id: 'domains', label: 'Domains' },
        ],
    },
    decorators: [
        (Story) => (
            <RouterProvider navigate={navigate}>
                <Story />
            </RouterProvider>
        ),
    ],
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every crumb: a long label is cut, with the full label on hover. */
export const AllCrumbs: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('link', { name: 'Pages' }));
        await expect(navigate).toHaveBeenCalledWith('/pages', undefined);
        await expect(canvas.getByText('Domains').closest('[aria-current]')).toHaveAttribute(
            'aria-current',
            'page',
        );
    },
};

/** `maxItems` folds the middle crumbs into a menu. */
export const Folded: Story = {
    args: { maxItems: 3 },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
        await userEvent.click(canvas.getByRole('button', { name: 'More pages' }));
        const menu = await within(canvasElement.ownerDocument.body).findByRole('menu');
        await expect(within(menu).getAllByRole('menuitem')).toHaveLength(3);
        await userEvent.keyboard('{Escape}');
    },
};

/** A crumb whose label loads, such as the title of an item, is a skeleton. */
export const Loading: Story = {
    args: {
        items: [
            { id: 'activity', label: 'Activity', href: '/pages/activity' },
            { id: 'emails', label: 'Emails sent', href: '/resources/emails' },
            { id: 'email', label: undefined },
        ],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('link', { name: 'Emails sent' })).toBeVisible();
        await expect(canvas.getByText('Loading…').closest('[aria-current]')).toHaveAttribute(
            'aria-current',
            'page',
        );
    },
};

/** In a narrow column, the label of the current page is cut first: the parents stay whole. */
export const Narrow: Story = {
    args: {
        items: [
            { id: 'activity', label: 'Activity', href: '/pages/activity' },
            { id: 'emails', label: 'Emails sent', href: '/resources/emails' },
            { id: 'email', label: 'To Ada Lovelace, about the reading group of next Thursday' },
        ],
    },
    decorators: [
        (Story) => (
            <div style={{ width: '18rem' }}>
                <Story />
            </div>
        ),
    ],
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const parent = canvas.getByText('Emails sent');
        await expect(parent.scrollWidth).toBeLessThanOrEqual(parent.clientWidth);
        const current = canvas.getByText(/^To Ada Lovelace/);
        await expect(current.scrollWidth).toBeGreaterThan(current.clientWidth);
    },
};
