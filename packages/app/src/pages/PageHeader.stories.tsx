/**
 * The building blocks of the pages of the app, which plugin pages use too: `PageLayout` for the
 * column of the page, `PageHeader` for its title, its link to the parent page and its actions.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from 'lucide-react';
import { expect, within } from 'storybook/test';

import { Button, Icon, Text } from '@panneau/ui';

import { LinkButton, PageHeader, PageLayout } from './PageHeader';

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
                        <LinkButton href="/admin/pages/budgets" icon={<Icon icon={Plus} />}>
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

/** A narrow page about one item, with a link back to its parent page. */
export const Narrow: Story = {
    render: () => (
        <PageLayout width="narrow">
            <PageHeader title="Job 4f2a" back={{ href: '/admin/pages/jobs', label: 'Jobs' }} />
            <Text muted>The timeline of the job.</Text>
        </PageLayout>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('link', { name: 'Jobs' })).toHaveAttribute(
            'href',
            '/admin/pages/jobs',
        );
    },
};
