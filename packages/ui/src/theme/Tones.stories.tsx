import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from 'lucide-react';
import { expect, within } from 'storybook/test';

import { Alert } from '../alert/Alert';
import { Badge } from '../badge/Badge';
import { Button, type ButtonAppearance } from '../button/Button';
import { PanneauRoot } from '../root/PanneauRoot';
import { defineTheme } from './defineTheme';
import type { ColorScheme } from './theme';
import { BUILT_IN_TONES, type Tone } from './tones';

declare module './tones' {
    interface PanneauTones {
        signal: true;
        members: true;
    }
}

declare module '../badge/Badge' {
    interface BadgeVariants {
        tag: true;
    }
}

/**
 * A theme that adds a tone derived from a palette color, a tone with every value, and a named badge
 * variant.
 */
const theme = defineTheme({
    palette: { orange: '#f25c05' },
    tones: {
        signal: 'var(--panneau-palette-orange)',
        members: {
            text: '#2f5d46',
            subtle: '#e3ede5',
            border: '#9cc3a8',
            outline: '#2f5d46',
            solid: '#2f5d46',
            solidHover: '#244a37',
            solidText: '#ffffff',
            dark: { text: '#a7d3b8', subtle: 'rgb(47 93 70 / 0.35)', border: '#2f5d46' },
        },
    },
    components: {
        badge: { variants: { tag: { 'panneau-badge-radius': 'var(--panneau-radius-sm)' } } },
    },
});

const TONES: Tone[] = [...BUILT_IN_TONES, 'signal', 'members'];
const APPEARANCES: ButtonAppearance[] = ['solid', 'outline', 'subtle', 'ghost'];

/** Every tone (built-in and added by a theme) in every appearance. */
function Grid({ colorScheme = 'light' }: { colorScheme?: ColorScheme }) {
    return (
        <PanneauRoot
            theme={theme}
            colorScheme={colorScheme}
            style={{ display: 'grid', gap: '1.5rem', padding: '1rem' }}
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${APPEARANCES.length}, max-content)`,
                    gap: '0.5rem',
                }}
            >
                {TONES.flatMap((tone) =>
                    APPEARANCES.map((appearance) => (
                        <Button
                            key={`${tone}-${appearance}`}
                            tone={tone}
                            appearance={appearance}
                            icon={Plus}
                        >
                            {tone}
                        </Button>
                    )),
                )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {TONES.map((tone) => (
                    <Badge key={tone} tone={tone}>
                        {tone}
                    </Badge>
                ))}
                {TONES.map((tone) => (
                    <Badge key={`${tone}-solid`} tone={tone} appearance="solid">
                        {tone}
                    </Badge>
                ))}
                <Badge tone="signal" variant="tag">
                    tag variant
                </Badge>
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
                <Alert tone="signal" title="Live">
                    A tone added by the theme, derived from one color.
                </Alert>
                <Alert tone="members" appearance="outline" title="Members only">
                    A tone with every value set.
                </Alert>
                <Alert tone="danger" appearance="solid" title="Solid">
                    An alert in the solid appearance.
                </Alert>
            </div>
        </PanneauRoot>
    );
}

const meta = {
    title: 'UI/Tones',
    component: Grid,
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Light: Story = {
    args: { colorScheme: 'light' },
    play: async ({ canvasElement }) => {
        const signal = within(canvasElement).getAllByRole('button', { name: 'signal' })[0];
        await expect(signal?.className).toContain('panneau-tone-signal');
        await expect(getComputedStyle(signal as Element).backgroundColor).toBe('rgb(242, 92, 5)');
    },
};

export const Dark: Story = { args: { colorScheme: 'dark' } };

/** What each built-in tone means for a state, with examples (the table of `docs/protocol.md`). */
const MEANINGS: { tone: Tone; means: string; examples: string[] }[] = [
    {
        tone: 'neutral',
        means: 'Not started, waiting, a category',
        examples: ['Draft', 'Pending', 'Idea'],
    },
    { tone: 'info', means: 'In progress or coming', examples: ['In progress', 'Scheduled', 'New'] },
    {
        tone: 'success',
        means: 'Done, live, in good shape',
        examples: ['Published', 'Active', 'Paid'],
    },
    {
        tone: 'warning',
        means: 'Needs attention soon',
        examples: ['Expires soon', 'Low stock', 'Possible duplicate'],
    },
    { tone: 'danger', means: 'A problem to fix now', examples: ['Failed', 'Expired', 'Overdue'] },
    {
        tone: 'muted',
        means: 'Over, no longer active',
        examples: ['Closed', 'Archived', 'Cancelled', 'Ended'],
    },
];

/** Each tone of a state with its meaning, in the subtle appearance that badges of states use. */
function Meanings({ colorScheme = 'light' }: { colorScheme?: ColorScheme }) {
    return (
        <PanneauRoot colorScheme={colorScheme} style={{ padding: '1rem' }}>
            <table style={{ borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ textAlign: 'start', padding: '0.25rem 1rem 0.25rem 0' }}>
                            Tone
                        </th>
                        <th style={{ textAlign: 'start', padding: '0.25rem 1rem 0.25rem 0' }}>
                            Means
                        </th>
                        <th style={{ textAlign: 'start', padding: '0.25rem 0' }}>Examples</th>
                    </tr>
                </thead>
                <tbody>
                    {MEANINGS.map(({ tone, means, examples }) => (
                        <tr key={tone}>
                            <th
                                scope="row"
                                style={{ textAlign: 'start', padding: '0.25rem 1rem 0.25rem 0' }}
                            >
                                <code>{tone}</code>
                            </th>
                            <td style={{ padding: '0.25rem 1rem 0.25rem 0' }}>{means}</td>
                            <td style={{ padding: '0.25rem 0' }}>
                                <span style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                    {examples.map((example) => (
                                        <Badge key={example} tone={tone}>
                                            {example}
                                        </Badge>
                                    ))}
                                </span>
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <th
                            scope="row"
                            style={{ textAlign: 'start', padding: '0.25rem 1rem 0.25rem 0' }}
                        >
                            <code>accent</code>
                        </th>
                        <td style={{ padding: '0.25rem 1rem 0.25rem 0' }}>
                            Never a state: the main action of a screen
                        </td>
                        <td style={{ padding: '0.25rem 0' }}>
                            <Button tone="accent">Save</Button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </PanneauRoot>
    );
}

/** The tones of states, what each one means, and examples. */
export const Meaning: StoryObj<typeof Meanings> = {
    render: (args) => <Meanings {...args} />,
    args: { colorScheme: 'light' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getAllByRole('row')).toHaveLength(MEANINGS.length + 2);
        // What is over has no fill, only an outline: it steps back from what is still alive.
        const archived = canvas.getByText('Archived');
        const style = getComputedStyle(archived.closest('.panneau-tone-muted') ?? archived);
        await expect(archived.closest('.panneau-tone-muted')).not.toBeNull();
        await expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
        await expect(style.borderTopColor).toBe('rgb(139, 139, 148)');
        const draft = canvas.getByText('Draft').closest('.panneau-tone-neutral');
        await expect(getComputedStyle(draft as Element).backgroundColor).toBe('rgb(244, 244, 245)');
    },
};

/** The same, in the dark scheme. */
export const MeaningDark: StoryObj<typeof Meanings> = {
    render: (args) => <Meanings {...args} />,
    args: { colorScheme: 'dark' },
};
