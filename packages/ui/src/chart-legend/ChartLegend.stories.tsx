import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Card } from '../card/Card';
import { ChartLegend } from './ChartLegend';

const meta = {
    title: 'UI/ChartLegend',
    component: ChartLegend,
    args: {
        label: 'Messages per day',
        items: [
            { label: 'Emails', value: '1,240', href: '#emails' },
            { label: 'Text messages', value: '86', help: '4 failed', helpTone: 'danger' },
            { label: 'Push notifications', value: '312', help: 'Since October 1' },
        ],
    },
    render: (args) => (
        <div style={{ maxWidth: '32rem' }}>
            <Card>
                <ChartLegend {...args} />
            </Card>
        </div>
    ),
} satisfies Meta<typeof ChartLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The lines of a chart: their color, their name, their total and a line of help. */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        const list = within(canvasElement).getByRole('list', { name: 'Messages per day' });
        await expect(within(list).getAllByRole('listitem')).toHaveLength(3);
        await expect(within(list).getByRole('link', { name: 'Emails' })).toBeVisible();
    },
};
