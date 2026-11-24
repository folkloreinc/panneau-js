import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '../button/Button';
import { Tooltip } from './Tooltip';

const meta = {
    title: 'UI/Tooltip',
    component: Tooltip,
    args: { content: 'Saves without publishing', children: <Button>Save draft</Button> },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnFocus: Story = {
    play: async ({ canvasElement }) => {
        await userEvent.tab();
        const body = within(canvasElement.ownerDocument.body);
        await expect(await body.findByRole('tooltip')).toHaveTextContent(
            'Saves without publishing',
        );
    },
};

/** The keys of a shortcut that does the same, at the end of the tooltip (decision 0112). */
export const WithShortcut: Story = {
    args: { content: 'Save', shortcut: 'Mod+S', children: <Button>Save</Button> },
    play: async ({ canvasElement }) => {
        await userEvent.tab();
        const body = within(canvasElement.ownerDocument.body);
        const tooltip = await body.findByRole('tooltip');
        await expect(tooltip).toHaveTextContent(/^Save(⌘S|Ctrl\+S)$/);
        await expect(within(tooltip).getByText(/⌘S|Ctrl\+S/).tagName).toBe('KBD');
    },
};
