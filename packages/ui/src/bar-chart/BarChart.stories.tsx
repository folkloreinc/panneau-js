import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Card } from '../card/Card';
import { PanneauRoot } from '../root/PanneauRoot';
import { LoadingRegion } from '../skeleton/LoadingRegion';
import { BarChart, type BarChartItem } from './BarChart';

const STATUSES: BarChartItem[] = [
    { label: 'Done', value: 34, tone: 'success', href: '#done' },
    { label: 'Failed', value: 3, tone: 'danger', href: '#failed' },
    { label: 'Running', value: 5, tone: 'info', href: '#running' },
];

const meta = {
    title: 'UI/BarChart',
    component: BarChart,
    args: { label: 'Runs by status', items: STATUSES },
    render: (args) => (
        <div style={{ maxWidth: '24rem' }}>
            <Card title="Runs by status">
                <BarChart {...args} />
            </Card>
        </div>
    ),
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The parts of a total, the largest first, in the tones of their options, each a link. */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const rows = within(canvas.getByRole('list', { name: 'Runs by status' })).getAllByRole(
            'listitem',
        );
        await expect(rows.map((row) => row.textContent)).toEqual(['Done34', 'Running5', 'Failed3']);
        await expect(canvas.getByRole('link', { name: 'Failed' })).toHaveAttribute(
            'href',
            '#failed',
        );
    },
};

/** Parts without tones, on a categorical color, and the rest of the total as "Other". */
export const Other: Story = {
    args: {
        label: 'Cost by tool',
        items: [
            { label: 'Summaries', value: 1820.5 },
            { label: 'Translations', value: 940 },
            { label: 'Transcriptions', value: 610.25 },
            { label: 'Headlines', value: 120 },
        ],
        other: 310,
        color: 2,
        formatValue: (value: number) =>
            new Intl.NumberFormat('en', { style: 'currency', currency: 'CAD' }).format(value),
    },
    play: async ({ canvasElement }) => {
        const rows = within(canvasElement).getAllByRole('listitem');
        await expect(rows.at(-1)).toHaveTextContent('OtherCA$310.00');
    },
};

/** Long labels are cut, the values stay. */
export const LongLabels: Story = {
    args: {
        label: 'Entries by contest',
        items: [
            { label: 'The spring photography contest of the north shore', value: 128 },
            { label: 'Short stories written in a single night', value: 64 },
        ],
    },
};

/** In the dark color scheme. */
export const Dark: Story = {
    render: (args) => (
        <PanneauRoot colorScheme="dark" style={{ padding: '1rem' }}>
            <div style={{ maxWidth: '24rem' }}>
                <Card title="Runs by status">
                    <BarChart {...args} />
                </Card>
            </div>
        </PanneauRoot>
    ),
};

/** A skeleton of its rows while they load. */
export const Loading: Story = {
    args: { items: undefined },
    render: (args) => (
        <div style={{ maxWidth: '24rem' }}>
            <Card title="Runs by status">
                <LoadingRegion>
                    <BarChart {...args} />
                </LoadingRegion>
            </Card>
        </div>
    ),
    play: async ({ canvasElement }) => {
        await expect(canvasElement.querySelector('[aria-busy="true"]')).not.toBeNull();
        await expect(within(canvasElement).getByRole('status')).toHaveTextContent('Loading…');
    },
};
