import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '../button/Button';
import { Inline } from '../inline/Inline';
import { Select } from '../select/Select';
import { Stack } from '../stack/Stack';
import { Text } from '../text/Text';
import { defineTheme } from '../theme/defineTheme';
import { PanneauRoot } from './PanneauRoot';
import { ThemeScope } from './ThemeScope';

const meta = {
    title: 'UI/ThemeScope',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const STATUSES = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
];

/** A dark sidebar in a light app: its popovers render inside it, and stay dark. */
export const DarkSidebar: Story = {
    render: () => (
        <PanneauRoot colorScheme="light" style={{ display: 'flex', minHeight: '20rem' }}>
            <ThemeScope
                as="aside"
                aria-label="Sidebar"
                colorScheme="dark"
                style={{ width: '16rem', padding: '1rem' }}
            >
                <Stack gap={3}>
                    <Text weight="bold">Sidebar</Text>
                    <Select label="Section" options={STATUSES} value="draft" />
                </Stack>
            </ThemeScope>
            <main style={{ padding: '1rem' }}>
                <Text>Content, in the light scheme.</Text>
            </main>
        </PanneauRoot>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const sidebar = canvas.getByRole('complementary', { name: 'Sidebar' });
        await expect(getComputedStyle(sidebar).backgroundColor).toBe('rgb(9, 9, 11)');
        await userEvent.click(canvas.getByRole('button', { name: /Section/ }));
        const listbox = await within(document.body).findByRole('listbox');
        await expect(sidebar.contains(listbox)).toBe(true);
        const popover = listbox.closest('.panneau-popover') ?? listbox;
        await expect(getComputedStyle(popover).backgroundColor).toBe('rgb(35, 35, 38)');
        await userEvent.keyboard('{Escape}');
    },
};

const brand = defineTheme({ tokens: { 'panneau-color-accent': '#9a3412' } });

/**
 * A scope with only a density keeps the theme around it, and a scope with a theme previews another
 * brand next to the app's.
 */
export const DensityAndTheme: Story = {
    render: () => (
        <PanneauRoot theme={brand}>
            <Stack gap={4}>
                <Inline gap={2}>
                    <Button tone="accent">Save (app)</Button>
                </Inline>
                <ThemeScope density="compact">
                    <Inline gap={2}>
                        <Button tone="accent">Save (compact)</Button>
                    </Inline>
                </ThemeScope>
                <ThemeScope
                    theme={defineTheme({ tokens: { 'panneau-color-accent': '#1d4ed8' } })}
                    style={{ padding: '1rem' }}
                >
                    <Button tone="accent">Save (preview)</Button>
                </ThemeScope>
            </Stack>
        </PanneauRoot>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const button = (name: string) => canvas.getByRole('button', { name });
        await expect(getComputedStyle(button('Save (app)')).backgroundColor).toBe(
            'rgb(154, 52, 18)',
        );
        // The compact scope keeps the accent of the theme around it.
        await expect(getComputedStyle(button('Save (compact)')).backgroundColor).toBe(
            'rgb(154, 52, 18)',
        );
        await expect(button('Save (compact)').getBoundingClientRect().height).toBe(32);
        await expect(button('Save (app)').getBoundingClientRect().height).toBe(36);
        await expect(getComputedStyle(button('Save (preview)')).backgroundColor).toBe(
            'rgb(29, 78, 216)',
        );
    },
};
