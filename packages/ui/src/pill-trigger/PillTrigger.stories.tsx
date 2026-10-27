import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ACCOUNTS, StoryAvatar } from '../__fixtures__/accounts';
import { Checkbox } from '../checkbox/Checkbox';
import { Inline } from '../inline/Inline';
import { Menu, MenuItem, MenuTrigger } from '../menu/Menu';
import { Popover, PopoverTrigger } from '../popover/Popover';
import { PillTrigger } from './PillTrigger';

const account = ACCOUNTS[1] ?? ACCOUNTS[0];

const meta = {
    title: 'UI/PillTrigger',
    component: PillTrigger,
    args: { children: account?.name, onPress: fn() },
} satisfies Meta<typeof PillTrigger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ args, canvasElement }) => {
        await userEvent.click(within(canvasElement).getByRole('button', { name: 'Ada Lovelace' }));
        await expect(args.onPress).toHaveBeenCalled();
    },
};

export const Sizes: Story = {
    render: (args) => (
        <Inline gap={2} align="center">
            <PillTrigger {...args} size="sm">
                Small
            </PillTrigger>
            <PillTrigger {...args}>Medium</PillTrigger>
            {account !== undefined ? (
                <>
                    <PillTrigger {...args} size="sm" media={<StoryAvatar account={account} />}>
                        {account.name}
                    </PillTrigger>
                    <PillTrigger {...args} media={<StoryAvatar account={account} />}>
                        {account.name}
                    </PillTrigger>
                </>
            ) : null}
            <PillTrigger {...args} isDisabled>
                Disabled
            </PillTrigger>
        </Inline>
    ),
};

/** The trigger of a menu: it says when the menu is open, and its chevron turns. */
export const OpensAMenu: Story = {
    render: (args) => (
        <MenuTrigger>
            <PillTrigger
                {...args}
                media={account !== undefined ? <StoryAvatar account={account} /> : undefined}
            />
            <Menu aria-label="Accounts">
                {ACCOUNTS.map((item) => (
                    <MenuItem key={item.id} id={item.id}>
                        {item.name}
                    </MenuItem>
                ))}
            </Menu>
        </MenuTrigger>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const trigger = canvas.getByRole('button', { name: 'Ada Lovelace' });
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await userEvent.click(trigger);
        const menu = await body.findByRole('menu');
        await waitFor(() => expect(menu).toBeVisible());
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await userEvent.keyboard('{Escape}');
        await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
        await waitFor(() => expect(trigger).toHaveFocus());
    },
};

/** The trigger of a popover, with an `aria-label` that says what its value is. */
export const OpensAPopover: Story = {
    render: (args) => (
        <PopoverTrigger>
            <PillTrigger {...args} aria-label="Columns: 2 shown">
                2 shown
            </PillTrigger>
            <Popover aria-label="Columns">
                <div style={{ display: 'grid', gap: '0.25rem' }}>
                    <Checkbox defaultSelected>Title</Checkbox>
                    <Checkbox defaultSelected>Status</Checkbox>
                    <Checkbox>Author</Checkbox>
                </div>
            </Popover>
        </PopoverTrigger>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Columns: 2 shown' }));
        const dialog = await body.findByRole('dialog', { name: 'Columns' });
        await waitFor(() => expect(dialog).toBeVisible());
    },
};
