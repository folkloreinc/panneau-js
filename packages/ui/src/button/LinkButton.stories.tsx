import type { Meta, StoryObj } from '@storybook/react-vite';
import { Ellipsis, Eye, Pencil, Plus } from 'lucide-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { IconButton } from '../icon-button/IconButton';
import { Button } from './Button';
import { LinkButton } from './LinkButton';

const meta = {
    title: 'UI/LinkButton',
    component: LinkButton,
    args: { href: '#/pages/new', children: 'Create a page' },
} satisfies Meta<typeof LinkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const link = within(canvasElement).getByRole('link', { name: 'Create a page' });
        await expect(link).toHaveAttribute('href', '#/pages/new');
        await expect(link).toHaveClass('panneau-button', 'panneau-button-outline');
    },
};

export const TonesAndAppearances: Story = {
    render: (args) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <LinkButton {...args} tone="accent" icon={Plus} />
            <LinkButton {...args}>View</LinkButton>
            <LinkButton {...args} appearance="ghost" icon={Pencil}>
                Edit
            </LinkButton>
            <LinkButton {...args} variant="primary" size="sm">
                Small
            </LinkButton>
        </div>
    ),
};

/**
 * Links and buttons side by side, as in the rows of a list: the same box, hover and focus ring,
 * whether it's a link or a button.
 */
export const BesideButtons: Story = {
    render: (args) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LinkButton {...args} size="sm" appearance="ghost" icon={Eye}>
                View
            </LinkButton>
            <LinkButton {...args} size="sm" appearance="ghost" icon={Pencil}>
                Edit
            </LinkButton>
            <Button size="sm" appearance="ghost" icon={Pencil}>
                Rename
            </Button>
            <IconButton icon={Ellipsis} size="sm" label="More actions" />
        </div>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const link = canvas.getByRole('link', { name: 'Edit' });
        const button = canvas.getByRole('button', { name: 'Rename' });
        const backgroundOf = (element: Element) => getComputedStyle(element).backgroundColor;
        await expect(link.getBoundingClientRect().height).toBe(
            button.getBoundingClientRect().height,
        );
        await userEvent.hover(link);
        await waitFor(() => expect(link).toHaveAttribute('data-hovered'));
        const hovered = backgroundOf(link);
        await userEvent.hover(button);
        await waitFor(() => expect(backgroundOf(button)).toBe(hovered));
        await userEvent.unhover(button);
    },
};
