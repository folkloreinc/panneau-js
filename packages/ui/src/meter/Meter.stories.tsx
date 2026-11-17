import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Card } from '../card/Card';
import { PanneauRoot } from '../root/PanneauRoot';
import { Stack } from '../stack/Stack';
import { Meter } from './Meter';

const meta = {
    title: 'UI/Meter',
    component: Meter,
    args: { label: 'Budget', value: 620, target: 1000 },
    render: (args) => (
        <div style={{ maxWidth: '16rem' }}>
            <Card>
                <Meter {...args} />
            </Card>
        </div>
    ),
} satisfies Meta<typeof Meter>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A budget, partly spent: on the first categorical chart color. */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole('meter', { name: 'Budget' })).toHaveAttribute(
            'aria-valuetext',
            '620 of 1,000',
        );
    },
};

/** Past the target: full, in the tone that says so, and the value read as it is. */
export const PastTheTarget: Story = {
    args: { value: 1250, tone: 'danger' },
    play: async ({ canvasElement }) => {
        const meter = within(canvasElement).getByRole('meter', { name: 'Budget' });
        await expect(meter).toHaveAttribute('aria-valuetext', '1,250 of 1,000');
        await expect(meter).toHaveClass('panneau-tone-danger');
    },
};

/** In the tones of the theme. */
export const Tones: Story = {
    render: () => (
        <div style={{ maxWidth: '16rem' }}>
            <Card>
                <Stack gap={3}>
                    <Meter label="Quota" value={40} target={100} />
                    <Meter label="Almost there" value={95} target={100} tone="warning" />
                    <Meter label="Over budget" value={130} target={100} tone="danger" />
                    <Meter label="Reached" value={100} target={100} tone="success" />
                </Stack>
            </Card>
        </div>
    ),
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getAllByRole('meter')).toHaveLength(4);
    },
};

/** In the dark color scheme. */
export const Dark: Story = {
    render: (args) => (
        <PanneauRoot colorScheme="dark" style={{ padding: '1rem' }}>
            <div style={{ maxWidth: '16rem' }}>
                <Card>
                    <Meter {...args} />
                </Card>
            </div>
        </PanneauRoot>
    ),
};
