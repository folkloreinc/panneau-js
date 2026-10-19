import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { PanneauRoot } from '../root/PanneauRoot';
import { defineTheme } from '../theme/defineTheme';
import { Heading } from './Heading';

const meta = {
    title: 'UI/Heading',
    component: Heading,
    args: { children: 'Members', level: 2 },
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Every size: the level of the element and its size are independent. */
export const Sizes: Story = {
    render: () => (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <Heading level={1} size="display-1">
                Display 1
            </Heading>
            <Heading level={2} size="display-2">
                Display 2
            </Heading>
            <Heading level={2} size={1}>
                Size 1
            </Heading>
            <Heading level={3} size={2}>
                Size 2
            </Heading>
            <Heading level={4} size={3}>
                Size 3
            </Heading>
            <Heading level={5}>Size 4</Heading>
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const display = canvas.getByRole('heading', { name: 'Display 1' });
        await expect(getComputedStyle(display).fontSize).toBe('48px');
        await expect(getComputedStyle(canvas.getByText('Size 4')).fontSize).toBe('16px');
    },
};

/** A theme with its own heading font, declared as a font face, and tighter headings. */
const serifTheme = defineTheme({
    fonts: [{ family: 'Panneau Serif', src: 'local("Georgia"), local("Times New Roman")' }],
    tokens: {
        'panneau-font-family-heading': '"Panneau Serif", Georgia, serif',
        'panneau-heading-1-letter-spacing': '-0.03em',
    },
});

export const ThemeFont: Story = {
    render: () => (
        <PanneauRoot theme={serifTheme}>
            <Heading level={1} size={1}>
                A serif heading
            </Heading>
            <p>Body text keeps the body font.</p>
        </PanneauRoot>
    ),
    play: async ({ canvasElement }) => {
        const heading = within(canvasElement).getByRole('heading', { name: 'A serif heading' });
        await expect(getComputedStyle(heading).fontFamily).toContain('Panneau Serif');
        await expect(document.head.innerHTML).toContain('font-family:"Panneau Serif"');
    },
};
