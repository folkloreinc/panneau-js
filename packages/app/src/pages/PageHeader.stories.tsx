/**
 * The building blocks of the pages of the app, which plugin pages use too: `PageLayout` for the
 * column of the page, `PageHeader` for its title, its parents and its actions.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';

import { Button, LinkButton, Text } from '@panneau/ui';

import { PageHeader, PageLayout } from './PageHeader';

const meta = {
    title: 'App/Page header',
    component: PageLayout,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PageLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A plugin page, laid out as the pages of resources. */
export const PluginPage: Story = {
    render: () => (
        <PageLayout>
            <PageHeader
                title="Usage and costs"
                actions={
                    <>
                        <Button variant="secondary">Export</Button>
                        <LinkButton href="/admin/pages/budgets" variant="primary" icon={Plus}>
                            New budget
                        </LinkButton>
                    </>
                }
            />
            <Text muted>The content of the page.</Text>
        </PageLayout>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent(
            'Usage and costs',
        );
        await expect(canvas.getByRole('link', { name: 'New budget' })).toHaveAttribute(
            'href',
            '/admin/pages/budgets',
        );
    },
};

/** A narrow page about one item, with a link to its parent page. */
export const Narrow: Story = {
    render: () => (
        <PageLayout width="narrow">
            <PageHeader title="Job 4f2a" parents={[{ href: '/admin/pages/jobs', label: 'Jobs' }]} />
            <Text muted>The timeline of the job.</Text>
        </PageLayout>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('link', { name: 'Jobs' })).toHaveAttribute(
            'href',
            '/admin/pages/jobs',
        );
        await expect(canvas.queryByRole('navigation', { name: 'Breadcrumbs' })).toBeNull();
    },
};

const LOG_PARENTS = [
    { href: '/admin/pages/activity', label: 'Activity' },
    { href: '/admin/resources/emails', label: 'Emails sent' },
];

/** Two parents or more (decision 0093): breadcrumbs, the page last, in place of the link. */
export const Breadcrumbs: Story = {
    render: () => (
        <PageLayout>
            <PageHeader
                title="To Ada Lovelace"
                parents={LOG_PARENTS}
                actions={<Button variant="secondary">Resend</Button>}
            />
            <Text muted>The message as it was sent.</Text>
        </PageLayout>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const crumbs = canvas.getByRole('navigation', { name: 'Breadcrumbs' });
        await expect(crumbs).toBeVisible();
        await expect(within(crumbs).getByRole('link', { name: 'Activity' })).toHaveAttribute(
            'href',
            '/admin/pages/activity',
        );
        await expect(
            within(crumbs).getByText('To Ada Lovelace').closest('[aria-current]'),
        ).toHaveAttribute('aria-current', 'page');
        // The link to the nearest parent is for narrow roots
        const links = canvas.getAllByRole('link', { name: 'Emails sent', hidden: true });
        await expect(links.filter((link) => link.checkVisibility())).toHaveLength(1);
    },
};

/** Below 48rem of the root, the breadcrumbs give way to a link to the nearest parent. */
export const BreadcrumbsOnANarrowRoot: Story = {
    render: () => (
        <div
            style={{ containerType: 'inline-size', containerName: 'panneau-root', width: '30rem' }}
        >
            <PageLayout>
                <PageHeader title="To Ada Lovelace" parents={LOG_PARENTS} />
            </PageLayout>
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.queryByRole('navigation', { name: 'Breadcrumbs' })).toBeNull();
        await expect(canvas.getByRole('link', { name: 'Emails sent' })).toBeVisible();
        await expect(canvas.queryByRole('link', { name: 'Activity' })).toBeNull();
    },
};

/** A deep page: the first parent, "…" with the folded ones, the nearest parent and the page. */
export const Folded: Story = {
    render: () => (
        <PageLayout>
            <PageHeader
                title="Montreal office"
                parents={[
                    { href: '/admin/resources/pages', label: 'Pages' },
                    { href: '/admin/resources/pages/1/edit', label: 'About us' },
                    { href: '/admin/resources/pages/4/edit', label: 'The team' },
                    { href: '/admin/resources/pages/9/edit', label: 'Offices' },
                ]}
            />
        </PageLayout>
    ),
    play: async ({ canvasElement }) => {
        const crumbs = within(
            within(canvasElement).getByRole('navigation', { name: 'Breadcrumbs' }),
        );
        await expect(crumbs.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
            'Pages',
            '',
            'Offices',
            'Montreal office',
        ]);
        await userEvent.click(crumbs.getByRole('button', { name: 'More pages' }));
        const menu = await within(canvasElement.ownerDocument.body).findByRole('menu');
        await expect(
            within(menu)
                .getAllByRole('menuitem')
                .map((item) => item.textContent),
        ).toEqual(['About us', 'The team']);
        await userEvent.keyboard('{Escape}');
    },
};

/** While the item loads, its title and its crumb are skeletons, under its parents. */
export const Loading: Story = {
    render: () => (
        <PageLayout>
            <PageHeader title="Edit email" isLoading parents={LOG_PARENTS} />
        </PageLayout>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('Loading…');
        const crumbs = canvas.getByRole('navigation', { name: 'Breadcrumbs' });
        await expect(within(crumbs).getByRole('link', { name: 'Emails sent' })).toBeVisible();
        await expect(
            within(crumbs).getByText('Loading…').closest('[aria-current]'),
        ).toHaveAttribute('aria-current', 'page');
        await expect(canvas.queryByText('Edit email')).toBeNull();
    },
};
