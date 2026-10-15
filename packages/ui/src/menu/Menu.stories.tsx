import type { Meta, StoryObj } from '@storybook/react-vite';
import { Copy, Ellipsis, Pencil, Trash } from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { IconButton } from '../icon-button/IconButton';
import { Menu, MenuItem, MenuSeparator, MenuTrigger } from './Menu';

const meta = {
    title: 'UI/Menu',
    component: Menu,
    args: { onAction: fn(), 'aria-label': 'Page actions' },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Actions: Story = {
    render: (args) => (
        <MenuTrigger>
            <IconButton icon={Ellipsis} label="More actions" showTooltip={false} />
            <Menu {...args}>
                <MenuItem id="edit" icon={Pencil}>
                    Edit
                </MenuItem>
                <MenuItem id="duplicate" icon={Copy} description="With its blocks">
                    Duplicate
                </MenuItem>
                <MenuSeparator />
                <MenuItem id="delete" icon={Trash} isDanger>
                    Delete
                </MenuItem>
            </Menu>
        </MenuTrigger>
    ),
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'More actions' }));
        await userEvent.click(await canvas.findByRole('menuitem', { name: /Duplicate/ }));
        await expect(args.onAction).toHaveBeenCalled();
    },
};
