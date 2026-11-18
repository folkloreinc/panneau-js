import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Card } from '../card/Card';
import { Stack } from '../stack/Stack';
import { Sparkline } from './Sparkline';

const meta = {
    title: 'UI/Sparkline',
    component: Sparkline,
    args: { values: [4, 6, 3, 8, 12, 9, 14, 11, 16, 18, 15, 21], label: 'Emails per day' },
    render: (args) => (
        <div style={{ maxWidth: '12rem' }}>
            <Card>
                <Sparkline {...args} />
            </Card>
        </div>
    ),
} satisfies Meta<typeof Sparkline>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A trend beside a number: an image named by its label. */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        await expect(
            within(canvasElement).getByRole('img', { name: 'Emails per day' }),
        ).toBeInTheDocument();
    },
};

/** On the categorical colors, or in a tone. Without a label, decorative. */
export const Colors: Story = {
    render: () => (
        <div style={{ maxWidth: '12rem' }}>
            <Card>
                <Stack gap={3}>
                    <Sparkline values={[1, 3, 2, 5, 4, 6]} />
                    <Sparkline values={[6, 4, 5, 2, 3, 1]} color={1} />
                    <Sparkline values={[0, 0, 1, 0, 4, 2]} tone="danger" />
                    <Sparkline values={[0, 0, 0, 0]} />
                </Stack>
            </Card>
        </div>
    ),
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).queryAllByRole('img')).toHaveLength(0);
    },
};

/** While its values load: a skeleton of its size. */
export const Loading: Story = {
    args: { values: undefined },
    play: async ({ canvasElement }) => {
        await expect(canvasElement.querySelector('path')).toBeNull();
    },
};
