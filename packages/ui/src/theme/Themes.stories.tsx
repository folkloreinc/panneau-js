import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from 'lucide-react';
import { expect, within } from 'storybook/test';

import { Alert } from '../alert/Alert';
import { Badge } from '../badge/Badge';
import { Button, type ButtonAppearance } from '../button/Button';
import { Card } from '../card/Card';
import { Checkbox } from '../checkbox/Checkbox';
import { Grid } from '../grid/Grid';
import { Heading } from '../heading/Heading';
import { Inline } from '../inline/Inline';
import { Prose } from '../prose/Prose';
import { Select } from '../select/Select';
import { Stack } from '../stack/Stack';
import { Switch } from '../switch/Switch';
import { TextInput } from '../text-input/TextInput';
import { Text } from '../text/Text';
import { CHART_CATEGORICAL_COUNT, chartColors } from './chartColors';
import { BUILT_IN_TONES, type Tone } from './tones';

const APPEARANCES: ButtonAppearance[] = ['solid', 'outline', 'subtle', 'ghost'];

/** Components of every kind, as a theme styles them: run with each theme of the toolbar. */
function Showcase({ tones }: { tones: readonly Tone[] }) {
    return (
        <Stack gap={6} style={{ maxWidth: '56rem' }}>
            <Stack gap={1}>
                <Heading level={1} size="display-2">
                    Spring issue
                </Heading>
                <Text muted>Updated today by Ada Lovelace</Text>
            </Stack>
            <Inline gap={2}>
                {APPEARANCES.map((appearance) => (
                    <Button key={appearance} tone="accent" appearance={appearance} icon={Plus}>
                        {appearance}
                    </Button>
                ))}
                <Button tone="danger">Delete</Button>
            </Inline>
            <Inline gap={2}>
                {tones.map((tone) => (
                    <Badge key={tone} tone={tone}>
                        {tone}
                    </Badge>
                ))}
            </Inline>
            <Grid columns={{ base: 1, md: 2 }} gap={4}>
                <Card title="Details">
                    <TextInput label="Title" defaultValue="Spring issue" />
                    <TextInput
                        label="Slug"
                        defaultValue="spring issue"
                        errors={['Use dashes, not spaces.']}
                    />
                    <Select
                        label="Status"
                        options={[
                            { value: 'draft', label: 'Draft' },
                            { value: 'published', label: 'Published' },
                        ]}
                        value="draft"
                    />
                    <Checkbox defaultSelected>Featured</Checkbox>
                    <Switch>Members only</Switch>
                </Card>
                <Stack gap={3}>
                    {tones
                        .filter((tone) => tone !== 'neutral')
                        .slice(0, 3)
                        .map((tone) => (
                            <Alert key={tone} tone={tone} title={`A ${tone} message`}>
                                What happened, and what to do next.
                            </Alert>
                        ))}
                    <svg role="img" aria-label="Items by type" width="320" height="80">
                        {Array.from({ length: CHART_CATEGORICAL_COUNT }, (_, index) => (
                            <rect
                                key={index}
                                x={index * 40}
                                y={index * 6}
                                width="32"
                                height={80 - index * 6}
                                fill={chartColors.categorical(index)}
                            />
                        ))}
                    </svg>
                </Stack>
            </Grid>
            <Prose>
                <h2>About this issue</h2>
                <p>
                    Read the <a href="#guide">editorial guide</a>, and check the <code>slug</code>.
                </p>
            </Prose>
        </Stack>
    );
}

const meta = {
    title: 'Theme/Themes',
    component: Showcase,
    args: { tones: BUILT_IN_TONES },
    parameters: { layout: 'padded' },
} satisfies Meta<typeof Showcase>;

export default meta;
type Story = StoryObj<typeof meta>;

const accent = (canvasElement: HTMLElement) =>
    getComputedStyle(within(canvasElement).getByRole('button', { name: 'solid' })).backgroundColor;

export const Default: Story = {
    globals: { theme: 'default', colorScheme: 'light' },
    play: async ({ canvasElement }) => {
        await expect(accent(canvasElement)).toBe('rgb(24, 24, 27)');
    },
};

export const DefaultDark: Story = {
    globals: { theme: 'default', colorScheme: 'dark' },
    play: async ({ canvasElement }) => {
        await expect(accent(canvasElement)).toBe('rgb(250, 250, 250)');
    },
};

export const Bootstrap: Story = {
    globals: { theme: 'bootstrap', colorScheme: 'light' },
    play: async ({ canvasElement }) => {
        await expect(accent(canvasElement)).toBe('rgb(13, 110, 253)');
    },
};

export const BootstrapDark: Story = {
    globals: { theme: 'bootstrap', colorScheme: 'dark' },
};

/** The reference theme also adds tones: `signal`, derived from one color, and `members`. */
export const Reference: Story = {
    globals: { theme: 'reference', colorScheme: 'light' },
    args: { tones: [...BUILT_IN_TONES, 'signal', 'members'] },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(accent(canvasElement)).toBe('rgb(20, 83, 45)');
        const button = canvas.getByRole('button', { name: 'solid' });
        await expect(getComputedStyle(button).borderTopLeftRadius).toBe('0px');
        const title = canvas.getByRole('heading', { name: 'Spring issue' });
        await expect(getComputedStyle(title).fontFamily).toContain('Georgia');
    },
};

export const ReferenceDark: Story = {
    globals: { theme: 'reference', colorScheme: 'dark' },
    args: { tones: [...BUILT_IN_TONES, 'signal', 'members'] },
    play: async ({ canvasElement }) => {
        await expect(accent(canvasElement)).toBe('rgb(143, 211, 168)');
    },
};
