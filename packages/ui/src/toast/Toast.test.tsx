import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../button/Button';
import { PanneauRoot } from '../root/PanneauRoot';
import {
    type ToastContent,
    type ToastOptions,
    getToastTimeout,
    useToast,
    useToastOffset,
} from './Toast';

function Show({ content, options }: { content: ToastContent; options?: ToastOptions }) {
    const toasts = useToast();
    return <Button onPress={() => toasts.show(content, options)}>Show</Button>;
}

describe('Toast', () => {
    it('shows a toast in a labelled region that carries the tokens', async () => {
        render(
            <PanneauRoot colorScheme="dark">
                <Show
                    content={{ title: 'Saved', description: 'The page is saved.', tone: 'success' }}
                />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Show' }));
        const region = await screen.findByRole('region', { name: 'Notifications' });
        expect(region).toHaveAttribute('data-color-scheme', 'dark');
        expect(screen.getByRole('alertdialog')).toHaveTextContent('Saved');
        expect(screen.getByText('The page is saved.')).toBeInTheDocument();
    });

    it('runs its action and closes', async () => {
        const onAction = vi.fn();
        render(
            <PanneauRoot>
                <Show
                    content={{
                        title: 'Network error',
                        tone: 'danger',
                        action: { label: 'Retry', onAction },
                    }}
                />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Show' }));
        await userEvent.click(await screen.findByRole('button', { name: 'Retry' }));
        expect(onAction).toHaveBeenCalled();
        expect(screen.queryByText('Network error')).not.toBeInTheDocument();
    });

    it('closes by itself after its timeout', async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        render(
            <PanneauRoot>
                <Show content={{ title: 'Saved' }} options={{ timeout: 1000 }} />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Show' }));
        expect(await screen.findByText('Saved')).toBeInTheDocument();
        act(() => {
            vi.advanceTimersByTime(1500);
        });
        expect(screen.queryByText('Saved')).not.toBeInTheDocument();
        vi.useRealTimers();
    });

    it('replaces the toast of the same key instead of adding another', async () => {
        render(
            <PanneauRoot>
                <Show content={{ title: 'Saved' }} options={{ key: 'save' }} />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Show' }));
        await userEvent.click(screen.getByRole('button', { name: 'Show' }));
        await userEvent.click(screen.getByRole('button', { name: 'Show' }));
        expect(await screen.findAllByText('Saved')).toHaveLength(1);
    });

    it('shows at most three toasts, and the next one when one closes', async () => {
        function Many() {
            const toasts = useToast();
            return (
                <Button
                    onPress={() =>
                        ['First', 'Second', 'Third', 'Fourth'].forEach((title) =>
                            toasts.show({ title }, { key: title }),
                        )
                    }
                >
                    Show
                </Button>
            );
        }
        render(
            <PanneauRoot>
                <Many />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Show' }));
        expect(await screen.findAllByRole('alertdialog')).toHaveLength(3);
        expect(screen.queryByText('First')).not.toBeInTheDocument();
        expect(screen.getByText('Fourth')).toBeInTheDocument();
        await userEvent.click(screen.getAllByRole('button', { name: 'Close' })[0] as HTMLElement);
        expect(await screen.findByText('First')).toBeInTheDocument();
    });

    it('shows at the bottom by default, or where the root places it', async () => {
        const { unmount } = render(
            <PanneauRoot>
                <Show content={{ title: 'Saved' }} />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Show' }));
        expect(await screen.findByRole('region', { name: 'Notifications' })).toHaveAttribute(
            'data-placement',
            'bottom',
        );
        unmount();
        render(
            <PanneauRoot toastPlacement="top-end">
                <Show content={{ title: 'Saved' }} />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Show' }));
        expect(await screen.findByRole('region', { name: 'Notifications' })).toHaveAttribute(
            'data-placement',
            'top-end',
        );
    });

    it('rises above what sticks to the bottom of the page', async () => {
        function Footer() {
            const ref = useRef<HTMLDivElement>(null);
            useToastOffset(ref);
            return <div ref={ref}>Footer</div>;
        }
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
            height: 64,
        } as DOMRect);
        render(
            <PanneauRoot>
                <Footer />
                <Show content={{ title: 'Saved' }} />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Show' }));
        const region = await screen.findByRole('region', { name: 'Notifications' });
        expect(region.style.getPropertyValue('--panneau-bottom-offset')).toBe('64px');
        vi.restoreAllMocks();
    });

    it('needs a PanneauRoot', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        expect(() => render(<Show content={{ title: 'Saved' }} />)).toThrow(/PanneauRoot/);
    });
});

describe('getToastTimeout', () => {
    it('gives about 5 seconds, longer for a longer text', () => {
        expect(getToastTimeout({ title: 'Saved' })).toBe(5000);
        const long = getToastTimeout({
            title: '“Spring contest” saved',
            description:
                'The entries of the contest are now open to the public, and the jury can start rating them from its own page.',
        });
        expect(long).toBeGreaterThan(5000);
        expect(long).toBeLessThanOrEqual(10000);
    });

    it('gives about 10 seconds with an action, instead of never', () => {
        expect(
            getToastTimeout({
                title: '3 entries archived',
                action: { label: 'Undo', onAction() {} },
            }),
        ).toBe(10000);
    });

    it('gives no timeout to an error', () => {
        expect(getToastTimeout({ title: 'The network is down', tone: 'danger' })).toBeNull();
    });
});
