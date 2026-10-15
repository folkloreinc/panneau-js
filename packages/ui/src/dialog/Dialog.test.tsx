import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
});
