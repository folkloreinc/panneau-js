import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Card } from '../card/Card';
import { PanneauRoot } from '../root/PanneauRoot';
import { LoadingRegion } from '../skeleton/LoadingRegion';
import { LineChart, type LineChartPoint } from './LineChart';

const DAYS: LineChartPoint[] = [4, 6, 3, 8, 12, 9, 14, 11, 7, 10, 15, 13, 9, 16].map(
    (value, index) => ({ label: `Oct ${index + 5}`, value }),
);

const meta = {
    title: 'UI/LineChart',
    component: LineChart,
    args: { label: 'Entries per day', points: DAYS },
    render: (args) => (
        <div style={{ maxWidth: '32rem' }}>
            <Card title="Entries">
                <LineChart {...args} />
            </Card>
        </div>
    ),
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two weeks of entries, on the first categorical color of the theme. */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const table = canvas.getByRole('table', { name: 'Entries per day' });
        await expect(within(table).getAllByRole('row')).toHaveLength(DAYS.length);
    },
};

/** Three months, by month. */
export const Months: Story = {
    args: {
        label: 'Entries per month',
        points: [
            { label: 'Aug 2026', value: 120 },
            { label: 'Sep 2026', value: 340 },
            { label: 'Oct 2026', value: 280 },
        ],
    },
};

/** One point: a dot. */
export const OnePoint: Story = {
    args: { points: [{ label: 'Oct 5', value: 4 }] },
};

/**
 * Every value at 0, as for a month without entries: no top of the scale over the flat line, and
 * the caption of the table stays hidden.
 */
export const AllZero: Story = {
    args: {
        points: DAYS.map((point) => ({ ...point, value: 0 })),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const caption = canvas.getByText('Entries per day');
        // Clipped by its hidden wrapper: no box of its own shows over the plot
        const wrapper = caption.closest('table')?.parentElement;
        await expect(wrapper?.getBoundingClientRect().width).toBeLessThanOrEqual(1);
        await expect(getComputedStyle(wrapper!).overflow).toBe('hidden');
        // The 0s are only in the table
        await expect(canvas.getAllByText('0')).toHaveLength(DAYS.length);
    },
};

/** No values yet: the baseline. */
export const Empty: Story = {
    args: { points: [] },
};

/** In the dark color scheme, on its own chart colors. */
export const Dark: Story = {
    render: (args) => (
        <PanneauRoot colorScheme="dark" style={{ padding: '1rem' }}>
            <div style={{ maxWidth: '32rem' }}>
                <Card title="Entries">
                    <LineChart {...args} color={2} />
                </Card>
            </div>
        </PanneauRoot>
    ),
};

/** A skeleton of the plot while it loads. */
export const Loading: Story = {
    args: { points: undefined },
    render: (args) => (
        <div style={{ maxWidth: '32rem' }}>
            <Card title="Entries">
                <LoadingRegion>
                    <LineChart {...args} />
                </LoadingRegion>
            </Card>
        </div>
    ),
    play: async ({ canvasElement }) => {
        await expect(canvasElement.querySelector('[aria-busy="true"]')).not.toBeNull();
        await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Loading…');
    },
};
