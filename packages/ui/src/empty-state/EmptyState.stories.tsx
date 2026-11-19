import type { Meta, StoryObj } from '@storybook/react-vite';
import { FolderOpen, Plus, SearchX } from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from '../button/Button';
import { Card } from '../card/Card';
import { EmptyState } from './EmptyState';

const meta = {
    title: 'UI/EmptyState',
    component: EmptyState,
    args: {
        icon: FolderOpen,
        title: 'No projects yet',
        description: 'Projects group the pages, the media and the people of a site.',
    },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

const onCreate = fn();

export const WithActions: Story = {
    args: {
        actions: (
            <>
                <Button tone="accent" icon={Plus} onPress={onCreate}>
                    Create a project
                </Button>
                <Button>Import</Button>
            </>
        ),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Create a project' }));
        await expect(onCreate).toHaveBeenCalled();
    },
};

/** A list with no match: its action clears the filters. */
export const NoMatch: Story = {
    args: {
        icon: SearchX,
        title: 'No items match the search or the filters.',
        description: undefined,
        actions: <Button size="sm">Clear all</Button>,
    },
};

/** The small size, for a widget, a popover or a panel, here without an icon. */
export const Small: Story = {
    args: {
        icon: undefined,
        size: 'sm',
        title: 'No data for this period.',
        description: undefined,
    },
    render: (args) => (
        <div style={{ maxWidth: '20rem' }}>
            <Card title="Visits">
                <EmptyState {...args} />
            </Card>
        </div>
    ),
};

/** A page that is empty as a whole has a heading. */
export const AsAHeading: Story = {
    args: { headingLevel: 1 },
    play: async ({ canvasElement }) => {
        await expect(
            within(canvasElement).getByRole('heading', { level: 1, name: 'No projects yet' }),
        ).toBeInTheDocument();
    },
};
