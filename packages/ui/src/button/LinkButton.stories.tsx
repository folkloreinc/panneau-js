import type { Meta, StoryObj } from '@storybook/react-vite';
import { Ellipsis, Eye, Pencil, Plus } from 'lucide-react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { IconButton } from '../icon-button/IconButton';
import { Button } from './Button';
import { LinkButton } from './LinkButton';

/** The background of an element once its transitions are over (buttons fade their hover in). */
async function settledBackground(element: Element): Promise<string> {
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
    return getComputedStyle(element).backgroundColor;
}

/**
 * The background of an element while it is hovered. The hover is done again until it holds: a real
 * pointer event, when the layout shifts under the browser's own cursor, can end a simulated hover.
 */
async function hoveredBackground(element: Element): Promise<string> {
    let background = '';
    await waitFor(async () => {
        await userEvent.hover(element);
        background = await settledBackground(element);
        if (!element.hasAttribute('data-hovered')) {
            throw new Error('The hover didn’t hold.');
        }
    });
    return background;
}

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
        await expect(link.getBoundingClientRect().height).toBe(
            button.getBoundingClientRect().height,
        );
        const idle = await settledBackground(link);
        const hovered = await hoveredBackground(link);
        await expect(hovered).not.toBe(idle);
        await expect(await hoveredBackground(button)).toBe(hovered);
        await userEvent.unhover(button);
    },
};
