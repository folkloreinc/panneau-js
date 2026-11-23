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
                        <Button>Export</Button>
                        <LinkButton href="/admin/pages/budgets" tone="accent" icon={Plus}>
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

/** The header of a page, from its title. */
function header(canvas: ReturnType<typeof within>) {
    return canvas.getByRole('heading', { level: 1 }).closest('header');
}

/** The left and right edges of an element, rounded to the pixel. */
function edges(element: Element | null) {
    if (element === null) {
        throw new Error('No element');
    }
    const { left, right } = element.getBoundingClientRect();
    return { left: Math.round(left), right: Math.round(right) };
}

const ITEM_ACTIONS = (
    <>
        <Button>Duplicate</Button>
        <Button tone="danger" appearance="outline">
            Delete
        </Button>
    </>
);

/**
 * The actions keep their place whatever the length of the title (#423): the title wraps, whole,
 * and the actions stay at the end of its row.
 */
export const LongTitle: Story = {
    render: () => (
        <PageLayout>
            <section data-testid="short" aria-label="A short title">
                <PageHeader title="Spring" actions={ITEM_ACTIONS} parents={[]} />
            </section>
            <section data-testid="long" aria-label="A long title">
                <PageHeader
                    title="The river festival returns for its twentieth summer, with three new stages along the old port and a night of fireworks over the water"
                    actions={ITEM_ACTIONS}
                    parents={[]}
                />
            </section>
        </PageLayout>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const short = within(canvas.getByTestId('short'));
        const long = within(canvas.getByTestId('long'));
        const shortDelete = edges(short.getByRole('button', { name: 'Delete' }));
        const longDelete = edges(long.getByRole('button', { name: 'Delete' }));
        await expect(longDelete).toEqual(shortDelete);
        await expect(edges(long.getByRole('button', { name: 'Duplicate' }))).toEqual(
            edges(short.getByRole('button', { name: 'Duplicate' })),
        );
        // At the end of the header
        await expect(longDelete.right).toBe(edges(header(long)).right);
        // The title wraps, whole, before the actions
        const title = long.getByRole('heading', { level: 1 });
        await expect(title).toHaveTextContent(/fireworks over the water$/);
        await expect(title.getBoundingClientRect().height).toBeGreaterThan(
            short.getByRole('heading', { level: 1 }).getBoundingClientRect().height,
        );
        await expect(edges(title).right).toBeLessThanOrEqual(
            edges(long.getByRole('button', { name: 'Duplicate' })).left,
        );
    },
};

/** On a phone (below 48rem of the root), the actions go under the title. */
export const ActionsOnANarrowRoot: Story = {
    render: () => (
        <div
            style={{ containerType: 'inline-size', containerName: 'panneau-root', width: '22rem' }}
        >
            <PageLayout>
                <PageHeader
                    title="The river festival returns"
                    actions={ITEM_ACTIONS}
                    parents={[{ href: '/admin/resources/articles', label: 'Articles' }]}
                />
            </PageLayout>
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const title = canvas.getByRole('heading', { level: 1 }).getBoundingClientRect();
        const duplicate = canvas.getByRole('button', { name: 'Duplicate' }).getBoundingClientRect();
        await expect(duplicate.top).toBeGreaterThanOrEqual(title.bottom);
        await expect(Math.round(duplicate.left)).toBe(Math.round(title.left));
    },
};

/**
 * A narrow page narrows its content, from the start of the column, and not its header (#415): the
 * title and the actions are where they are on a wide page. (Each page in a section, which keeps
 * their headers from being two banners.)
 */
export const NarrowAndWide: Story = {
    render: () => (
        <>
            <section data-testid="wide" aria-label="A wide page">
                <PageLayout>
                    <PageHeader title="Articles" actions={ITEM_ACTIONS} parents={[]} />
                    <div data-testid="wide-content">The list of articles.</div>
                </PageLayout>
            </section>
            <section data-testid="narrow" aria-label="A narrow page">
                <PageLayout width="narrow">
                    <PageHeader title="Ada Lovelace" actions={ITEM_ACTIONS} parents={[]} />
                    <div data-testid="narrow-content">The form of an author.</div>
                </PageLayout>
            </section>
        </>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const wide = within(canvas.getByTestId('wide'));
        const narrow = within(canvas.getByTestId('narrow'));
        await expect(edges(header(narrow))).toEqual(edges(header(wide)));
        await expect(edges(narrow.getByRole('heading', { level: 1 })).left).toBe(
            edges(wide.getByRole('heading', { level: 1 })).left,
        );
        await expect(edges(narrow.getByRole('button', { name: 'Delete' }))).toEqual(
            edges(wide.getByRole('button', { name: 'Delete' })),
        );
        // The content starts where the header does, and is narrower when the page is wide enough
        const content = edges(canvas.getByTestId('narrow-content'));
        await expect(content.left).toBe(edges(header(narrow)).left);
        await expect(content.right).toBeLessThanOrEqual(
            edges(canvas.getByTestId('wide-content')).right,
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
                actions={<Button>Resend</Button>}
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
