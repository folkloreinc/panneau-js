import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Card } from '../card/Card';
import { PanneauRoot } from '../root/PanneauRoot';
import { LoadingRegion } from '../skeleton/LoadingRegion';
import { LineChart, type LineChartPoint } from './LineChart';

const DAYS: LineChartPoint[] = [4, 6, 3, 8, 12, 9, 14, 11, 7, 10, 15, 13, 9, 16].map(
    (value, index) => ({
        label: `October ${index + 5}, 2026`,
        shortLabel: `Oct ${index + 5}`,
        value,
    }),
);

/** 90 days of views, in the thousands: a long series. */
const QUARTER: LineChartPoint[] = Array.from({ length: 90 }, (_, index) => {
    const date = new Date(Date.UTC(2026, 7, 1 + index));
    return {
        label: date.toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' }),
        shortLabel: date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC',
        }),
        value: Math.round(9000 + 3500 * Math.sin(index / 6) + (index % 7) * 400 + index * 40),
    };
});

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

/**
 * Two weeks of entries, on the first categorical color of the theme: a curve through the points, a
 * scale of round graduations, dates under it, and the last value at the end of the line.
 */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const table = canvas.getByRole('table', { name: 'Entries per day' });
        await expect(within(table).getAllByRole('row')).toHaveLength(DAYS.length);
        // Nothing to focus: the values are on the chart and in its table
        await expect(canvas.queryByRole('slider')).toBeNull();
    },
};

/** What the values are above the scale, and the highest one marked on the line. */
export const AxisLabelAndMax: Story = {
    args: {
        axisLabel: 'Entries',
        showMax: true,
        points: DAYS.map((point, index) =>
            index === DAYS.length - 1 ? { ...point, value: 11 } : point,
        ),
    },
};

/** Without the scale: the trend alone, as beside a number. */
export const Trend: Story = {
    args: { showAxis: false, height: '4rem' },
};

/** A ratio, on a scale fixed from 0 to 100 %. */
export const Ratio: Story = {
    args: {
        label: 'Entries judged',
        domain: { min: 0, max: 1 },
        formatValue: (value: number) =>
            value.toLocaleString('en-US', { style: 'percent', maximumFractionDigits: 1 }),
        formatTick: (value: number) => value.toLocaleString('en-US', { style: 'percent' }),
        points: DAYS.map((point, index) => ({ ...point, value: Math.min(1, 0.2 + index * 0.05) })),
    },
};

/** Straight segments between the points. */
export const Linear: Story = {
    args: { curve: 'linear' },
};

/**
 * A long series in the thousands, compact on the scale: the pointer or the arrow keys show the
 * value of each day, which the scale can't give.
 */
export const Interactive: Story = {
    args: { label: 'Views per day', points: QUARTER, isInteractive: true, axisLabel: 'Views' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const plot = canvas.getByRole('slider', { name: 'Views per day' });
        await userEvent.tab();
        await expect(plot).toHaveFocus();
        const last = QUARTER.at(-1);
        await expect(plot).toHaveAttribute(
            'aria-valuetext',
            `${last?.label}: ${last?.value.toLocaleString('en-US')}`,
        );
        await userEvent.keyboard('{Home}');
        const first = QUARTER[0];
        await expect(plot).toHaveAttribute('aria-valuenow', '0');
        await expect(
            canvas
                .getAllByText(first?.label ?? '')
                .filter((node) => node.closest('table') === null),
        ).toHaveLength(1);
        await userEvent.keyboard('{ArrowRight}');
        await expect(plot).toHaveAttribute('aria-valuenow', '1');
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

/** One point: a dot, with its value. */
export const OnePoint: Story = {
    args: { points: [{ label: 'October 5, 2026', shortLabel: 'Oct 5', value: 4 }] },
};

/**
 * Every value at 0, as for a month without entries: the line on the baseline, and the caption of
 * the table stays hidden.
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
        if (wrapper === null || wrapper === undefined) {
            throw new Error('The table has no wrapper.');
        }
        await expect(wrapper.getBoundingClientRect().width).toBeLessThanOrEqual(1);
        await expect(getComputedStyle(wrapper).overflow).toBe('hidden');
        // The 0s of the table, the graduation (and its hidden copy that sizes the scale), and the last value
        await expect(canvas.getAllByText('0')).toHaveLength(DAYS.length + 3);
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
