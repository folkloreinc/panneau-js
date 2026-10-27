import type { Meta, StoryObj } from '@storybook/react-vite';
import { Copy, Ellipsis, Pencil, Trash } from 'lucide-react';
import { useState } from 'react';
import type { Selection } from 'react-aria-components';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ACCOUNTS, StoryAvatar } from '../__fixtures__/accounts';
import { IconButton } from '../icon-button/IconButton';
import { PillTrigger } from '../pill-trigger/PillTrigger';
import { Menu, MenuItem, MenuSection, MenuSeparator, MenuTrigger } from './Menu';

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

function AccountPickerDemo({
    onSelectionChange,
}: {
    onSelectionChange?: (keys: Selection) => void;
}) {
    const [accountId, setAccountId] = useState('ada');
    const account = ACCOUNTS.find(({ id }) => id === accountId) ?? ACCOUNTS[0];
    return (
        <MenuTrigger>
            <PillTrigger
                size="sm"
                media={account !== undefined ? <StoryAvatar account={account} /> : undefined}
            >
                {account?.name}
            </PillTrigger>
            <Menu
                aria-label="Accounts"
                selectionMode="single"
                disallowEmptySelection
                selectedKeys={[accountId]}
                onSelectionChange={(keys) => {
                    onSelectionChange?.(keys);
                    const [key] = keys === 'all' ? [] : [...keys];
                    if (key !== undefined) {
                        setAccountId(String(key));
                    }
                }}
                footer="Only this step changes."
            >
                <MenuSection title="Publish on">
                    {ACCOUNTS.map((item) => (
                        <MenuItem
                            key={item.id}
                            id={item.id}
                            media={<StoryAvatar account={item} />}
                            description={item.handle}
                        >
                            {item.name}
                        </MenuItem>
                    ))}
                </MenuSection>
            </Menu>
        </MenuTrigger>
    );
}

/**
 * Picking one of several connected accounts: a pill trigger shows the current one, and the menu
 * has a section with a header, items with an avatar and a handle, a check on the selected one,
 * and a footer note.
 */
export const AccountPicker: Story = {
    render: (args) => <AccountPickerDemo onSelectionChange={args.onSelectionChange} />,
    args: { onSelectionChange: fn() },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Ada Lovelace' }));
        const section = await body.findByRole('group', { name: 'Publish on' });
        await waitFor(() => expect(section).toBeVisible());
        await expect(body.getByText('Only this step changes.')).toBeVisible();
        const selected = body.getByRole('menuitemradio', { name: 'Ada Lovelace' });
        await expect(selected).toHaveAttribute('aria-checked', 'true');
        await expect(selected).toHaveAttribute('data-selected', 'true');

        // Arrow keys move between items, never to the footer.
        await userEvent.keyboard('{ArrowDown}');
        await expect(body.getByRole('menuitemradio', { name: 'Grace Hopper' })).toHaveFocus();
        await userEvent.keyboard('{ArrowDown}');
        await expect(body.getByRole('menuitemradio', { name: 'Studio Lumen' })).toHaveFocus();
        await userEvent.keyboard('{ArrowUp}{Enter}');
        await expect(args.onSelectionChange).toHaveBeenCalled();
        await expect(
            await canvas.findByRole('button', { name: 'Grace Hopper' }),
        ).toBeInTheDocument();
    },
};

/** Several choices at once: each selected item has a check. */
export const MultipleSelection: Story = {
    render: (args) => (
        <MenuTrigger>
            <PillTrigger>Columns</PillTrigger>
            <Menu
                {...args}
                aria-label="Columns"
                selectionMode="multiple"
                defaultSelectedKeys={['title', 'status']}
            >
                <MenuSection title="Show">
                    <MenuItem id="title">Title</MenuItem>
                    <MenuItem id="status">Status</MenuItem>
                    <MenuItem id="author">Author</MenuItem>
                </MenuSection>
            </Menu>
        </MenuTrigger>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Columns' }));
        const author = await body.findByRole('menuitemcheckbox', { name: 'Author' });
        await expect(author).toHaveAttribute('aria-checked', 'false');
        await userEvent.click(author);
        await expect(author).toHaveAttribute('aria-checked', 'true');
        await expect(body.getByRole('menuitemcheckbox', { name: 'Title' })).toHaveAttribute(
            'aria-checked',
            'true',
        );
    },
};
