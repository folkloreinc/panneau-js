import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '../button/Button';
import { PanneauRoot } from '../root/PanneauRoot';
import { type ToastContent, type ToastOptions, useToast, useToastOffset } from './Toast';

type Example = [label: string, content: ToastContent, options?: ToastOptions];

const EXAMPLES: Example[] = [
    ['Saved', { title: '“Spring contest” saved', tone: 'success' }, { key: 'save' }],
    [
        'Archived',
        {
            title: '3 entries archived',
            tone: 'success',
            action: { label: 'Undo', onAction: () => undefined },
        },
    ],
    [
        'Copied',
        {
            title: 'Copy of “Spring contest” created',
            tone: 'success',
            action: { label: 'Open', onAction: () => undefined },
        },
    ],
    [
        'Error',
        {
            title: 'The server could not be reached',
            description: 'Check your connection, then try again.',
            tone: 'danger',
            action: { label: 'Retry', onAction: () => undefined },
        },
    ],
    ['Warning', { title: 'Someone else is editing “Spring contest”', tone: 'warning' }],
    ['Neutral', { title: 'Link copied' }],
];

/** Buttons that show toasts, above a footer that sticks to the bottom, as a form's does. */
function ToastButtons() {
    const toasts = useToast();
    const footer = useRef<HTMLDivElement>(null);
    useToastOffset(footer);
    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {EXAMPLES.map(([label, content, options]) => (
                    <Button key={label} onPress={() => toasts.show(content, options)}>
                        {label}
                    </Button>
                ))}
            </div>
            <div
                ref={footer}
                style={{
                    position: 'fixed',
                    insetInline: 0,
                    bottom: 0,
                    padding: '0.75rem 1rem',
                    borderTop: '1px solid var(--panneau-color-border)',
                    background: 'var(--panneau-color-bg)',
                }}
            >
                A footer that sticks to the bottom
            </div>
        </div>
    );
}

const meta = {
    title: 'UI/Toast',
    component: ToastButtons,
} satisfies Meta<typeof ToastButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Several toasts: at most three, the older ones folded behind the newest. */
export const Several: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        for (const label of ['Saved', 'Archived', 'Copied', 'Warning']) {
            await userEvent.click(canvas.getByRole('button', { name: label }));
        }
        const region = await body.findByRole('region', { name: 'Notifications' });
        await expect(region).toHaveAttribute('data-placement', 'bottom');
        await waitFor(() => expect(within(region).getAllByRole('alertdialog')).toHaveLength(3));
        // The oldest waits for a place.
        await expect(within(region).queryByText('“Spring contest” saved')).toBeNull();
        // Above the footer that sticks to the bottom.
        const footer = canvas.getByText('A footer that sticks to the bottom');
        await expect(region.getBoundingClientRect().bottom).toBeLessThanOrEqual(
            footer.getBoundingClientRect().top,
        );
        // The "Undo" of the archive is reachable with the keyboard, which unfolds the stack.
        const undo = within(region).getByRole('button', { name: 'Undo' });
        undo.focus();
        await waitFor(() => expect(getComputedStyle(undo).opacity).toBe('1'));
    },
};

/** A toast with the key of one already shown replaces it: "Saved" once, however many saves. */
export const Replaced: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Saved' }));
        await userEvent.click(canvas.getByRole('button', { name: 'Saved' }));
        await userEvent.click(canvas.getByRole('button', { name: 'Saved' }));
        const region = await body.findByRole('region', { name: 'Notifications' });
        await waitFor(() =>
            expect(within(region).getAllByText('“Spring contest” saved')).toHaveLength(1),
        );
    },
};

/** An error: a colored edge, and no timeout. A success keeps the neutral look. */
export const ErrorToast: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Error' }));
        const toast = await body.findByRole('alertdialog', {
            name: /The server could not be reached/,
        });
        // An error has a colored band at its start; a neutral toast has none.
        await expect(getComputedStyle(toast, '::before').width).toBe('4px');
        // The icon, the first line of the title and the buttons share one axis.
        const middle = (rect: DOMRect | undefined) =>
            rect === undefined ? Number.NaN : rect.top + rect.height / 2;
        const line = document.createRange();
        line.selectNodeContents(within(toast).getByText('The server could not be reached'));
        const axis = middle(
            within(toast).getByRole('button', { name: 'Retry' }).getBoundingClientRect(),
        );
        await expect(Math.abs(middle(line.getClientRects()[0]) - axis)).toBeLessThan(1);
        await expect(
            Math.abs(middle(toast.querySelector('svg')?.getBoundingClientRect()) - axis),
        ).toBeLessThan(1);
        await userEvent.click(canvas.getByRole('button', { name: 'Neutral' }));
        const neutral = await body.findByRole('alertdialog', { name: /Link copied/ });
        await expect(getComputedStyle(neutral, '::before').content).toBe('none');
        await userEvent.click(await body.findByRole('button', { name: 'Retry' }));
        await waitFor(() => expect(body.queryByText('The server could not be reached')).toBeNull());
    },
};

/** On a phone, the whole width at the bottom. */
export const Phone: Story = {
    globals: { viewport: { value: 'mobile1' } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Copied' }));
        const region = await body.findByRole('region', { name: 'Notifications' });
        const view = canvasElement.ownerDocument.defaultView;
        if (view !== null && view.innerWidth <= 480) {
            await expect(region.getBoundingClientRect().width).toBeGreaterThan(
                view.innerWidth - 40,
            );
        }
    },
};

/** At the top of the end side, for a project that wants it there. */
export const TopEnd: Story = {
    decorators: [
        (Story) => (
            <PanneauRoot toastPlacement="top-end">
                <Story />
            </PanneauRoot>
        ),
    ],
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Archived' }));
        const regions = await body.findAllByRole('region', { name: 'Notifications' });
        const region = regions.find((element) => element.dataset.placement === 'top-end');
        await expect(region).toBeDefined();
        await expect(region?.getBoundingClientRect().top).toBeLessThan(100);
    },
};
