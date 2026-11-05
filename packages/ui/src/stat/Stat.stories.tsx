import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Card } from '../card/Card';
import { Grid } from '../grid/Grid';
import { LoadingRegion } from '../skeleton/LoadingRegion';
import { Stat } from './Stat';

const meta = {
    title: 'UI/Stat',
    component: Stat,
    args: { label: 'Entries to judge', value: 12, help: '3 more than last week' },
    render: (args) => (
        <div style={{ maxWidth: '16rem' }}>
            <Card>
                <Stat {...args} />
            </Card>
        </div>
    ),
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A number, what it counts, and a line of help. */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByText('12')).toBeVisible();
    },
};

/** A link to the list of what it counts. */
export const Link: Story = {
    args: { href: '#entries' },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole('link')).toHaveAccessibleName(
            'Entries to judge 12 3 more than last week',
        );
    },
};

/** Tones only for numbers that call for attention: the help always says why. */
export const Tones: Story = {
    render: () => (
        <Grid columns={{ base: 1, md: 3 }}>
            <Card>
                <Stat label="Published this week" value={24} help="As usual" />
            </Card>
            <Card>
                <Stat label="Expire soon" value={3} help="In the next 7 days" tone="warning" />
            </Card>
            <Card>
                <Stat label="Overdue" value={2} help="Since Monday" tone="danger" href="#" />
            </Card>
        </Grid>
    ),
};

/** Formatted for the locale: a currency. */
export const Currency: Story = {
    args: {
        label: 'Revenue',
        value: 18250,
        format: { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 },
        help: 'This month',
    },
};

/** A skeleton of the number while it loads, in the region that loads. */
export const Loading: Story = {
    args: { value: undefined },
    render: (args) => (
        <div style={{ maxWidth: '16rem' }}>
            <Card>
                <LoadingRegion>
                    <Stat {...args} />
                </LoadingRegion>
            </Card>
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvasElement.querySelector('[aria-busy="true"]')).not.toBeNull();
        await expect(canvas.getByRole('status')).toHaveTextContent('Loading…');
    },
};
