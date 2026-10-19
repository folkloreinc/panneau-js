import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus } from 'lucide-react';
import { expect, within } from 'storybook/test';

import { Alert } from '../alert/Alert';
import { Badge } from '../badge/Badge';
import { Button, type ButtonAppearance } from '../button/Button';
import { PanneauRoot } from '../root/PanneauRoot';
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

/** A theme that adds a derived tone, a tone with every value, and a named badge variant. */
const theme: Theme = {
    tokens: {},
    tones: {
        signal: '#f25c05',
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
};

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
