import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import type { Action } from '@panneau/protocol';

import { pages, publish, remove } from '../__fixtures__/pages';
import type { ListActionEvent } from '../types';
import { ActionButton } from './ActionButton';
import { ConfirmDialog } from './ConfirmDialog';

const site: Action = {
    id: 'site',
    label: 'On the site',
    kind: 'link',
    scope: ['item'],
    url: '//example.com/pages/{id}',
};

const edit: Action = { id: 'edit', label: 'Edit', kind: 'link', scope: ['item'] };

/** Two selected pages to publish: one of them, already published, doesn't allow it. */
const publishEvent: ListActionEvent = {
    action: publish,
    scope: 'selection',
    count: 2,
    skipped: pages.slice(0, 1),
};

/** A page to delete, from its row. */
const deleteEvent: ListActionEvent = {
    action: remove,
    scope: 'item',
    item: pages[1],
    count: 1,
    skipped: [],
};

/**
 * Asks before running an action (decision 0017): its `confirm` title and message, or default ones,
 * and how many selected items will be skipped.
 */
const meta = {
    title: 'Lists/Actions',
    component: ConfirmDialog,
    args: { event: publishEvent, onConfirm: fn(), onCancel: fn() },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The action's own message, and the focus on the confirming button. */
export const Confirm: Story = {
    play: async ({ canvasElement, args }) => {
        const body = within(canvasElement.ownerDocument.body);
        const dialog = await body.findByRole('alertdialog', { name: 'Publish?' });
        await expect(dialog).toHaveTextContent('Publish 2 pages?');
        await expect(dialog).toHaveTextContent('1 selected item doesn’t allow it');
        const confirm = within(dialog).getByRole('button', { name: 'Publish' });
        await waitFor(() => expect(confirm).toHaveFocus());
        await userEvent.click(confirm);
        await expect(args.onConfirm).toHaveBeenCalledWith(publishEvent);
        await expect(args.onCancel).not.toHaveBeenCalled();
    },
};

/** An action that destroys: the danger color, and the focus on the safe choice (decision 0095). */
export const Destructive: Story = {
    args: { event: deleteEvent },
    play: async ({ canvasElement, args }) => {
        const body = within(canvasElement.ownerDocument.body);
        const dialog = await body.findByRole('alertdialog', { name: 'Delete?' });
        await expect(dialog).toHaveTextContent('“Delete” will apply to 1 item.');
        const cancel = within(dialog).getByRole('button', { name: 'Cancel' });
        await waitFor(() => expect(cancel).toHaveFocus());
        await expect(within(dialog).getByRole('button', { name: 'Delete' })).toHaveClass(
            'panneau-tone-danger',
        );
        await userEvent.click(cancel);
        await expect(args.onCancel).toHaveBeenCalled();
        await expect(args.onConfirm).not.toHaveBeenCalled();
    },
};

/** While the backend counts the items a query selection would skip: it can't be confirmed. */
export const Counting: Story = {
    args: { preview: { status: 'loading' } },
    play: async ({ canvasElement, args }) => {
        const body = within(canvasElement.ownerDocument.body);
        const dialog = await body.findByRole('alertdialog', { name: 'Publish?' });
        await expect(dialog).toHaveTextContent('Checking which items allow it…');
        // The confirming button is pending: it keeps the focus, and ignores presses
        const confirm = within(dialog).getAllByRole('button').at(-1);
        await waitFor(() => expect(confirm).toHaveFocus());
        await expect(confirm).toHaveAttribute('aria-disabled', 'true');
        await userEvent.click(confirm as HTMLElement);
        await expect(args.onConfirm).not.toHaveBeenCalled();
    },
};

/**
 * Actions as buttons, or links for `link` actions. In a row, only the icon, in the color of the
 * action, with the label as its name and tooltip (decision 0060).
 */
export const ButtonsInRow: StoryObj<typeof ActionButton> = {
    args: { onPress: fn() },
    render: (args) => (
        <div style={{ display: 'flex', gap: '0.25rem' }}>
            <ActionButton action={edit} href="/pages/2/edit" onPress={args.onPress} iconOnly />
            <ActionButton action={remove} href={null} onPress={args.onPress} iconOnly />
        </div>
    ),
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const editLink = canvas.getByRole('link', { name: 'Edit' });
        await expect(editLink).toHaveAttribute('href', '/pages/2/edit');
        await expect(editLink).not.toHaveTextContent('Edit');
        const deleteButton = canvas.getByRole('button', { name: 'Delete' });
        await expect(deleteButton).toHaveClass('panneau-tone-danger');
        await userEvent.tab();
        await userEvent.tab();
        await expect(deleteButton).toHaveFocus();
        await expect(await body.findByRole('tooltip')).toHaveTextContent('Delete');
        await userEvent.keyboard('{Enter}');
        await expect(args.onPress).toHaveBeenCalledTimes(1);
    },
};

/**
 * Beside the buttons of a toolbar: outlined, and solid when the action destroys. A link that leaves
 * the admin opens in a new tab.
 */
export const ButtonsInToolbar: StoryObj<typeof ActionButton> = {
    args: { onPress: fn() },
    render: (args) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <ActionButton
                action={site}
                href="//example.com/pages/2"
                size="md"
                onPress={args.onPress}
            />
            <ActionButton action={remove} href={null} size="md" onPress={args.onPress} />
        </div>
    ),
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const link = canvas.getByRole('link', { name: /On the site/ });
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveClass('panneau-tone-neutral', 'panneau-button-outline');
        const deleteButton = canvas.getByRole('button', { name: 'Delete' });
        await expect(deleteButton).toHaveClass('panneau-tone-danger', 'panneau-button-solid');
        await userEvent.click(deleteButton);
        await expect(args.onPress).toHaveBeenCalledTimes(1);
    },
};

/**
 * In the header of an item (decision 0091): outlined in the color of the action. A link that
 * leaves the admin shows the icon of an external link, and opens in a new tab.
 */
export const ButtonsInHeader: StoryObj<typeof ActionButton> = {
    args: { onPress: fn() },
    render: (args) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <ActionButton
                action={site}
                href="//example.com/pages/2"
                size="md"
                inHeader
                onPress={args.onPress}
            />
            <ActionButton action={remove} href={null} size="md" inHeader onPress={args.onPress} />
        </div>
    ),
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const link = canvas.getByRole('link', { name: /On the site/ });
        await expect(link).toHaveAttribute('target', '_blank');
        await expect(link).toHaveClass('panneau-tone-info', 'panneau-button-outline');
        await expect(link.querySelector('svg')).toHaveClass('lucide-external-link');
        const deleteButton = canvas.getByRole('button', { name: 'Delete' });
        await expect(deleteButton).toHaveClass('panneau-tone-danger', 'panneau-button-outline');
        await userEvent.click(deleteButton);
        await expect(args.onPress).toHaveBeenCalledTimes(1);
    },
};
