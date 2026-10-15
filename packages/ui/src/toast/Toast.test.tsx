import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../button/Button';
import { PanneauRoot } from '../root/PanneauRoot';
import { type ToastContent, type ToastOptions, useToast } from './Toast';

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

    it('needs a PanneauRoot', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        expect(() => render(<Show content={{ title: 'Saved' }} />)).toThrow(/PanneauRoot/);
    });
});
