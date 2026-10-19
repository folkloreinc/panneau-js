import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Heading } from '../heading/Heading';
import { PanneauRoot } from '../root/PanneauRoot';
import { Stack } from '../stack/Stack';
import { CHART_CATEGORICAL_COUNT, chartColors } from './chartColors';
import type { ColorScheme } from './theme';

const SERIES = ['Pages', 'Articles', 'Videos', 'Podcasts', 'Events', 'Guides', 'Recipes', 'Polls'];
const VALUES = [42, 35, 28, 24, 19, 15, 11, 8];

/** Bars in the categorical colors, a sequential ramp, and diverging values. */
function Charts({ colorScheme }: { colorScheme: ColorScheme }) {
    return (
        <PanneauRoot colorScheme={colorScheme} style={{ padding: '1rem' }}>
            <Stack gap={6}>
                <Stack gap={2}>
                    <Heading level={2} size={4}>
                        Categorical
                    </Heading>
                    <svg role="img" aria-label="Items by type" width="400" height="200">
                        {SERIES.slice(0, CHART_CATEGORICAL_COUNT).map((name, index) => (
                            <rect
                                key={name}
                                data-testid={`series-${index + 1}`}
                                x={index * 50}
                                y={200 - (VALUES[index] ?? 0) * 4}
                                width="40"
                                height={(VALUES[index] ?? 0) * 4}
                                fill={chartColors.categorical(index)}
                            />
                        ))}
                    </svg>
                </Stack>
                <Stack gap={2}>
                    <Heading level={2} size={4}>
                        Sequential
                    </Heading>
                    <svg role="img" aria-label="Activity, from low to high" width="250" height="40">
                        {([1, 2, 3, 4, 5] as const).map((step) => (
                            <rect
                                key={step}
                                x={(step - 1) * 50}
                                width="48"
                                height="40"
                                fill={chartColors.sequential(step)}
                            />
                        ))}
                    </svg>
                </Stack>
                <Stack gap={2}>
                    <Heading level={2} size={4}>
                        Diverging
                    </Heading>
                    <svg role="img" aria-label="Change since last month" width="300" height="40">
                        <rect x="0" width="100" height="40" fill={chartColors.diverging.negative} />
                        <rect
                            x="100"
                            width="100"
                            height="40"
                            fill={chartColors.diverging.neutral}
                        />
                        <rect
                            x="200"
                            width="100"
                            height="40"
                            fill={chartColors.diverging.positive}
                        />
                    </svg>
                </Stack>
            </Stack>
        </PanneauRoot>
    );
}

const meta = {
    title: 'Theme/Chart colors',
    component: Charts,
    args: { colorScheme: 'light' },
} satisfies Meta<typeof Charts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = {
    play: async ({ canvasElement }) => {
        const bar = within(canvasElement).getByTestId('series-1');
        await expect(getComputedStyle(bar).fill).toBe('rgb(28, 108, 187)');
    },
};

export const Dark: Story = {
    args: { colorScheme: 'dark' },
    play: async ({ canvasElement }) => {
        const bar = within(canvasElement).getByTestId('series-1');
        await expect(getComputedStyle(bar).fill).toBe('rgb(97, 169, 227)');
    },
};
