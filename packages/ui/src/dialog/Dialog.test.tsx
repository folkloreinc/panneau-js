import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../button/Button';
import { PanneauRoot } from '../root/PanneauRoot';
import { Dialog, DialogTrigger } from './Dialog';

describe('Dialog', () => {
    it('opens from a trigger, is labelled by its title, and closes', async () => {
        render(
            <PanneauRoot data-testid="root">
                <DialogTrigger>
                    <Button>Open</Button>
                    <Dialog
                        title="Delete the page?"
                        footer={(close) => <Button onPress={close}>Cancel</Button>}
                    >
                        It can't be undone.
                    </Dialog>
                </DialogTrigger>
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Open' }));
        const dialog = await screen.findByRole('dialog', { name: 'Delete the page?' });
        expect(dialog).toHaveTextContent("It can't be undone.");
        expect(screen.getByTestId('root')).toContainElement(dialog);
        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('is controlled, closes with its close button and Escape', async () => {
        const onOpenChange = vi.fn();
        render(
            <PanneauRoot>
                <Dialog title="Settings" isOpen onOpenChange={onOpenChange}>
                    Content
                </Dialog>
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(onOpenChange).toHaveBeenLastCalledWith(false);
        onOpenChange.mockClear();
        await userEvent.keyboard('{Escape}');
        expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('shows content in its header, between the title and the close button', async () => {
        const onOpenChange = vi.fn();
        render(
            <PanneauRoot>
                <Dialog
                    title="Choose media"
                    isOpen
                    onOpenChange={onOpenChange}
                    size="xl"
                    fullScreenOnPhone
                    headerContent={(close) => <Button onPress={close}>Done</Button>}
                >
                    Content
                </Dialog>
            </PanneauRoot>,
        );
        const dialog = screen.getByRole('dialog', { name: 'Choose media' });
        const heading = screen.getByRole('heading', { name: 'Choose media' });
        const done = screen.getByRole('button', { name: 'Done' });
        const closeButton = screen.getByRole('button', { name: 'Close' });
        expect(dialog).toContainElement(done);
        expect(
            heading.compareDocumentPosition(done) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
        expect(
            done.compareDocumentPosition(closeButton) & Node.DOCUMENT_POSITION_FOLLOWING,
        ).toBeTruthy();
        await userEvent.click(done);
        expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('can require an answer, as an alert dialog', () => {
        render(
            <PanneauRoot>
                <Dialog title="Conflict" isOpen role="alertdialog" isDismissable={false}>
                    Someone else saved this page.
                </Dialog>
            </PanneauRoot>,
        );
        expect(screen.getByRole('alertdialog', { name: 'Conflict' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Close' })).not.toBeInTheDocument();
    });

    it('keeps the submit of its forms from the form around it', async () => {
        const outer = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
        const inner = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
        render(
            <PanneauRoot>
                <form onSubmit={outer}>
                    <Dialog title="New key" isOpen>
                        <form onSubmit={inner}>
                            <button type="submit">Create</button>
                        </form>
                    </Dialog>
                </form>
            </PanneauRoot>,
        );
        await userEvent.click(await screen.findByRole('button', { name: 'Create' }));
        expect(inner).toHaveBeenCalledTimes(1);
        expect(outer).not.toHaveBeenCalled();
    });
    it('is suspended for a moment: hidden, the page usable, its content kept', async () => {
        const onOpenChange = vi.fn();
        const onOutside = vi.fn();
        function Counter() {
            const [count, setCount] = useState(0);
            return <Button onPress={() => setCount(count + 1)}>Count {count}</Button>;
        }
        function Page({ isSuspended }: { isSuspended: boolean }) {
            return (
                <PanneauRoot>
                    <button type="button" onClick={onOutside}>
                        Outside
                    </button>
                    <Dialog
                        title="Import"
                        isOpen
                        isSuspended={isSuspended}
                        onOpenChange={onOpenChange}
                    >
                        <Counter />
                    </Dialog>
                </PanneauRoot>
            );
        }
        const { rerender } = render(<Page isSuspended={false} />);
        await userEvent.click(await screen.findByRole('button', { name: 'Count 0' }));
        expect(screen.getByRole('button', { name: 'Count 1' })).toBeInTheDocument();
        // Open, the page around it is hidden from assistive technologies
        expect(screen.queryByRole('button', { name: 'Outside' })).not.toBeInTheDocument();

        rerender(<Page isSuspended />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        const outside = screen.getByRole('button', { name: 'Outside' });
        await userEvent.click(outside);
        expect(onOutside).toHaveBeenCalledOnce();
        expect(outside).toHaveFocus();
        expect(onOpenChange).not.toHaveBeenCalled();

        rerender(<Page isSuspended={false} />);
        expect(await screen.findByRole('dialog', { name: 'Import' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Count 1' })).toBeInTheDocument();
    });
});
