import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from 'lucide-react';
import { expect, within } from 'storybook/test';

import { Alert } from '../alert/Alert';
import { Badge } from '../badge/Badge';
import { Button, type ButtonAppearance } from '../button/Button';
import { PanneauRoot } from '../root/PanneauRoot';
import { type Rgb, contrastRatio } from './color';
import { defineTheme } from './defineTheme';
import type { ColorScheme, Theme } from './theme';
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

/**
 * A theme with a light accent, as a yellow brand color gives: dark text on its filled buttons. It
 * doesn't set the accent as text (`panneau-color-accent-strong`): Panneau derives a readable one.
 */
const yellowTheme = defineTheme({
    tokens: {
        'panneau-color-accent': '#ffea00',
        'panneau-color-accent-hover': '#e6d300',
        'panneau-color-accent-text': '#18181b',
        'panneau-color-accent-subtle': '#fffbd1',
    },
    dark: { 'panneau-color-accent-subtle': '#3a3500' },
});

const ACCENT_THEMES: { name: string; theme: Theme | null }[] = [
    { name: 'Default accent', theme: null },
    { name: 'Yellow accent', theme: yellowTheme },
];
const TEXT_APPEARANCES: ButtonAppearance[] = ['outline', 'subtle', 'ghost'];

/** The accent as text, on the page and on a panel, with each accent in both schemes. */
function AccentText() {
    return (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
            {ACCENT_THEMES.flatMap(({ name, theme: accentTheme }) =>
                (['light', 'dark'] as const).map((scheme) => (
                    <PanneauRoot
                        key={`${name}-${scheme}`}
                        theme={accentTheme}
                        colorScheme={scheme}
                        role="group"
                        aria-label={`${name}, ${scheme}`}
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem',
                            padding: '1rem',
                            background: 'var(--panneau-color-bg)',
                        }}
                    >
                        {TEXT_APPEARANCES.map((appearance) => (
                            <Button key={appearance} tone="accent" appearance={appearance}>
                                Edit
                            </Button>
                        ))}
                        <div
                            style={{
                                display: 'flex',
                                gap: '0.5rem',
                                padding: '0.5rem',
                                background: 'var(--panneau-color-surface)',
                                border: '1px solid var(--panneau-color-border)',
                            }}
                        >
                            {TEXT_APPEARANCES.map((appearance) => (
                                <Button key={appearance} tone="accent" appearance={appearance}>
                                    Edit
                                </Button>
                            ))}
                            <Button tone="accent">Save</Button>
                        </div>
                    </PanneauRoot>
                )),
            )}
        </div>
    );
}

/** A computed color as sRGB with its opacity, through a canvas, which reads any CSS color. */
function readColor(value: string): { color: Rgb; alpha: number } {
    const context = document.createElement('canvas').getContext('2d', {
        willReadFrequently: true,
    });
    if (context === null) {
        throw new Error('No 2D canvas to read colors with.');
    }
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    const [r = 0, g = 0, b = 0, a = 0] = context.getImageData(0, 0, 1, 1).data;
    return { color: { r, g, b }, alpha: a / 255 };
}

/** The background under an element: the first one, up its ancestors, that isn't transparent. */
function backgroundOf(element: Element): Rgb {
    for (let current: Element | null = element; current !== null; current = current.parentElement) {
        const { color, alpha } = readColor(getComputedStyle(current).backgroundColor);
        if (alpha === 1) {
            return color;
        }
    }
    return { r: 255, g: 255, b: 255 };
}

/**
 * Outline, subtle and ghost buttons of the accent tone write the accent as text: readable (4.5:1)
 * on the page and on panels, with the default accent and with a light one, in both schemes. Filled
 * buttons keep the accent as their background.
 */
export const AccentAsText: StoryObj<typeof AccentText> = {
    render: () => <AccentText />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        for (const { name } of ACCENT_THEMES) {
            for (const scheme of ['light', 'dark']) {
                const group = within(canvas.getByRole('group', { name: `${name}, ${scheme}` }));
                const buttons = group.getAllByRole('button', { name: 'Edit' });
                await expect(buttons).toHaveLength(TEXT_APPEARANCES.length * 2);
                for (const button of buttons) {
                    const text = readColor(getComputedStyle(button).color).color;
                    const ratio = contrastRatio(text, backgroundOf(button));
                    await expect(
                        ratio,
                        `${name}, ${scheme}: ${button.className}`,
                    ).toBeGreaterThanOrEqual(4.5);
                }
            }
        }
        // The filled button keeps the yellow, with dark text on it.
        const save = within(canvas.getByRole('group', { name: 'Yellow accent, light' })).getByRole(
            'button',
            { name: 'Save' },
        );
        await expect(readColor(getComputedStyle(save).backgroundColor).color).toEqual({
            r: 255,
            g: 234,
            b: 0,
        });
    },
};
