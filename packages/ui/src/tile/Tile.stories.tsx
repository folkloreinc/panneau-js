import type { Meta, StoryObj } from '@storybook/react-vite';
import { Ellipsis, FileText, KeyRound, Laptop, LogOut, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { RouterProvider } from 'react-aria-components';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Avatar } from '../avatar/Avatar';
import { Badge } from '../badge/Badge';
import { Button } from '../button/Button';
import { IconButton } from '../icon-button/IconButton';
import { Menu, MenuItem, MenuTrigger } from '../menu/Menu';
import { ReorderMenu } from '../reorder/ReorderList';
import { Tile, TileGroup } from './Tile';

const meta = {
    title: 'UI/Tile',
    component: Tile,
    args: { title: 'Report.pdf', description: '2.4 MB, uploaded yesterday', icon: FileText },
} satisfies Meta<typeof Tile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Appearances: Story = {
    render: (args) => (
        <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '28rem' }}
        >
            <Tile {...args} />
            <Tile {...args} appearance="outline" actions={<Button size="sm">Download</Button>} />
            <Tile {...args} appearance="subtle" size="sm" />
        </div>
    ),
};

const navigate = fn();
const onRemove = fn();

/**
 * Tiles with links, in an outlined group: the whole tile is the link, and its actions stay
 * pressable on their own.
 */
export const LinksInAGroup: Story = {
    render: () => (
        <RouterProvider navigate={navigate}>
            <div style={{ maxWidth: '28rem' }}>
                <TileGroup label="Authors" appearance="outline">
                    <Tile
                        media={<Avatar name="Ada Lovelace" />}
                        title="Ada Lovelace"
                        description="ada@example.com"
                        href="/users/1"
                        actions={
                            <IconButton
                                icon={LogOut}
                                label="Remove Ada Lovelace"
                                size="sm"
                                onPress={onRemove}
                            />
                        }
                    />
                    <Tile
                        media={<Avatar name="Grace Hopper" tone="neutral" />}
                        title="Grace Hopper"
                        description="grace@example.com"
                        href="/users/2"
                        actions={
                            <>
                                <Badge>Disabled</Badge>
                                <MenuTrigger>
                                    <IconButton
                                        icon={Ellipsis}
                                        label="Actions for Grace Hopper"
                                        size="sm"
                                    />
                                    <Menu placement="bottom end">
                                        <MenuItem id="enable">Enable</MenuItem>
                                        <MenuItem id="remove" isDanger>
                                            Remove
                                        </MenuItem>
                                    </Menu>
                                </MenuTrigger>
                            </>
                        }
                    />
                    <Tile
                        media={<Avatar name="Alan Turing" />}
                        title="Alan Turing"
                        description="alan@example.com"
                        href="/users/3"
                    />
                </TileGroup>
            </div>
        </RouterProvider>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
        await userEvent.click(canvas.getByRole('button', { name: 'Remove Ada Lovelace' }));
        await expect(onRemove).toHaveBeenCalled();
        await expect(navigate).not.toHaveBeenCalled();
        await userEvent.click(canvas.getByRole('link', { name: 'Ada Lovelace' }));
        await expect(navigate).toHaveBeenCalledWith('/users/1', undefined);
    },
};

/** The sessions of an account, without links. */
export const Sessions: Story = {
    render: () => (
        <div style={{ maxWidth: '28rem' }}>
            <TileGroup label="Sessions">
                <Tile
                    icon={Laptop}
                    title="Firefox on Linux"
                    description="Montréal, now"
                    actions={<Badge tone="success">This device</Badge>}
                />
                <Tile
                    icon={Smartphone}
                    title="Safari on iPhone"
                    description="Québec, 2 days ago"
                    actions={<Button size="sm">Sign out</Button>}
                />
                <Tile
                    icon={KeyRound}
                    title="Passkey"
                    description="Added on March 3"
                    actions={<Button size="sm">Remove</Button>}
                />
            </TileGroup>
        </div>
    ),
};

/**
 * A group with `onMove` reorders its tiles (decision 0111): a handle before the media of each tile
 * drags it, and a `ReorderMenu` in its actions moves it without dragging.
 */
export const Reorderable: Story = {
    render: function Render() {
        const [files, setFiles] = useState(['Brief.pdf', 'Budget.xlsx', 'Notes.txt']);
        return (
            <div style={{ maxWidth: '24rem' }}>
                <TileGroup
                    appearance="outline"
                    label="Files"
                    itemLabel={(index) => files[index] ?? ''}
                    onMove={(from, to) =>
                        setFiles(files.toSpliced(from, 1).toSpliced(to, 0, files[from] ?? ''))
                    }
                >
                    {files.map((file) => (
                        <Tile
                            key={file}
                            appearance="outline"
                            icon={FileText}
                            title={file}
                            description="12 KB"
                            actions={<ReorderMenu />}
                        />
                    ))}
                </TileGroup>
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        canvas.getByRole('button', { name: 'Move Notes.txt' }).focus();
        await userEvent.keyboard('{Enter}');
        await waitFor(() => expect(document.activeElement).toHaveAttribute('data-reorder-gap'));
        await userEvent.keyboard('{ArrowUp}');
        await waitFor(() =>
            expect(document.activeElement).toHaveAccessibleName('Before Brief.pdf'),
        );
        await userEvent.keyboard('{Enter}');
        await waitFor(() =>
            expect(canvas.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
                'Notes.txt12 KB',
                'Brief.pdf12 KB',
                'Budget.xlsx12 KB',
            ]),
        );
        await waitFor(() =>
            expect(canvas.getByRole('button', { name: 'Move Notes.txt' })).toHaveFocus(),
        );
    },
};
