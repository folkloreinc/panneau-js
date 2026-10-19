import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Text } from './Text';

const meta = {
    title: 'UI/Text',
    component: Text,
    args: { children: 'The quick brown fox jumps over the lazy dog.' },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
    render: () => (
        <div style={{ display: 'grid', gap: '0.5rem', maxWidth: '20rem' }}>
            <Text size="xl" weight="bold">
                Extra large, bold
            </Text>
            <Text size="lg">Large</Text>
            <Text>Inherited</Text>
            <Text size="sm" muted>
                Small and muted
            </Text>
            <Text size="xs" family="mono">
                Extra small, mono
            </Text>
            <Text tone="success">Published</Text>
            <Text tone="danger">Failed to publish</Text>
            <Text numeric>1,111.11 — 8,888.88</Text>
            <Text truncate>
                A long title that does not fit on one line and ends with an ellipsis
            </Text>
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(getComputedStyle(canvas.getByText('Small and muted')).color).toBe(
            'rgb(82, 82, 91)',
        );
        await expect(
            getComputedStyle(canvas.getByText('1,111.11 — 8,888.88')).fontVariantNumeric,
        ).toBe('tabular-nums');
        const truncated = canvas.getByText(/A long title/);
        await expect(truncated.scrollWidth).toBeGreaterThan(truncated.clientWidth);
    },
};
