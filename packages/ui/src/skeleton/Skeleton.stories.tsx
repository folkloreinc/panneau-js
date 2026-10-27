import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Card } from '../card/Card';
import { LoadingRegion } from './LoadingRegion';
import { Skeleton } from './Skeleton';

const meta = {
    title: 'UI/Skeleton',
    component: Skeleton,
    args: { shape: 'text' },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
    args: { lines: 3 },
    render: (args) => (
        <div style={{ maxWidth: '24rem' }}>
            <Skeleton {...args} />
        </div>
    ),
};

export const Shapes: Story = {
    render: () => (
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '24rem' }}>
            <Skeleton width="40%" />
            <Skeleton shape="rect" height={40} />
            <Skeleton shape="rect" aspectRatio="16 / 9" />
            <Skeleton shape="circle" />
            <Skeleton shape="circle" width={64} />
        </div>
    ),
};

/** A card that loads: its skeleton in a loading region, announced once to screen readers. */
export const Loading: Story = {
    render: () => (
        <LoadingRegion label="Loading the article…" style={{ maxWidth: '24rem' }}>
            <Card>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <Skeleton shape="circle" />
                    <Skeleton width="50%" />
                </div>
                <Skeleton shape="rect" aspectRatio="16 / 9" />
                <Skeleton lines={3} />
            </Card>
        </LoadingRegion>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('status')).toHaveTextContent('Loading the article…');
        const region = canvasElement.querySelector('[aria-busy="true"]');
        await expect(region).not.toBeNull();
        for (const block of region?.querySelectorAll('.panneau-skeleton') ?? []) {
            await expect(block).toHaveAttribute('aria-hidden', 'true');
        }
    },
};
