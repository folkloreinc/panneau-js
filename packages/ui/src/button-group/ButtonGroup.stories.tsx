import type { Meta, StoryObj } from '@storybook/react-vite';
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    ChevronDown,
    Copy,
    Download,
    Pencil,
    Trash2,
} from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '../button/Button';
import { LinkButton } from '../button/LinkButton';
import { IconButton } from '../icon-button/IconButton';
import { Menu, MenuItem, MenuTrigger } from '../menu/Menu';
import { ButtonGroup } from './ButtonGroup';

const meta = {
    title: 'UI/ButtonGroup',
    component: ButtonGroup,
    args: { label: 'Item actions' },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Outline: Story = {
    render: (args) => (
        <ButtonGroup {...args}>
            <Button icon={Pencil}>Edit</Button>
            <Button icon={Copy}>Duplicate</Button>
            <LinkButton href="#export" icon={Download}>
                Export
            </LinkButton>
        </ButtonGroup>
    ),
    play: async ({ canvasElement }) => {
        const group = within(canvasElement).getByRole('group', { name: 'Item actions' });
        const [first, second] = Array.from(group.children);
        const left = first?.getBoundingClientRect();
        const right = second?.getBoundingClientRect();
        // One border between two buttons: they overlap by its width.
        await expect(Math.round((left?.right ?? 0) - (right?.left ?? 0))).toBe(1);
    },
};

/** A split button: a button, and an icon button that opens a menu of other ways to do it. */
export const SplitButton: Story = {
    args: { label: 'Publish' },
    render: (args) => (
        <ButtonGroup {...args}>
            <Button tone="accent">Publish</Button>
            <MenuTrigger>
                <IconButton
                    tone="accent"
                    appearance="solid"
                    icon={ChevronDown}
                    label="More ways to publish"
                    showTooltip={false}
                />
                <Menu placement="bottom end">
                    <MenuItem id="schedule">Schedule</MenuItem>
                    <MenuItem id="draft">Save as a draft</MenuItem>
                </Menu>
            </MenuTrigger>
        </ButtonGroup>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'More ways to publish' }));
        const menu = await within(canvasElement.ownerDocument.body).findByRole('menu');
        await expect(within(menu).getByRole('menuitem', { name: 'Schedule' })).toBeVisible();
        await userEvent.keyboard('{Escape}');
    },
};

export const Solid: Story = {
    render: (args) => (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <ButtonGroup {...args} label="Neutral">
                <Button appearance="solid">Day</Button>
                <Button appearance="solid">Week</Button>
                <Button appearance="solid">Month</Button>
            </ButtonGroup>
            <ButtonGroup {...args} label="Danger">
                <Button tone="danger" icon={Trash2}>
                    Delete
                </Button>
                <IconButton
                    tone="danger"
                    appearance="solid"
                    icon={ChevronDown}
                    label="More ways to delete"
                />
            </ButtonGroup>
        </div>
    ),
};

export const IconButtons: Story = {
    args: { label: 'Alignment' },
    render: (args) => (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <ButtonGroup {...args}>
                <IconButton appearance="outline" icon={AlignLeft} label="Align left" />
                <IconButton appearance="outline" icon={AlignCenter} label="Align center" />
                <IconButton appearance="outline" icon={AlignRight} label="Align right" />
            </ButtonGroup>
            <ButtonGroup {...args} label="Vertical alignment" orientation="vertical">
                <Button size="sm">Top</Button>
                <Button size="sm">Middle</Button>
                <Button size="sm">Bottom</Button>
            </ButtonGroup>
        </div>
    ),
};
