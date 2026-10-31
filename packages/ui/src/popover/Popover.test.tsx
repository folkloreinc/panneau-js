import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../button/Button';
import { PanneauRoot } from '../root/PanneauRoot';
import { Popover, PopoverTrigger } from './Popover';

describe('Popover', () => {
    it('opens a labelled dialog next to its trigger, and closes with Escape', async () => {
        render(
            <PanneauRoot>
                <PopoverTrigger>
                    <Button>Filters</Button>
                    <Popover aria-label="Filters">
                        <Button>Apply</Button>
                    </Popover>
                </PopoverTrigger>
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Filters' }));
        expect(await screen.findByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
        await userEvent.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        await waitFor(() => expect(screen.getByRole('button', { name: 'Filters' })).toHaveFocus());
    });

    it('keeps the submit of its forms from the form around it', async () => {
        const outer = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
        const inner = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
        render(
            <PanneauRoot>
                <form onSubmit={outer}>
                    <PopoverTrigger>
                        <Button>Rename</Button>
                        <Popover aria-label="Rename">
                            <form onSubmit={inner}>
                                <button type="submit">Save the name</button>
                            </form>
                        </Popover>
                    </PopoverTrigger>
                </form>
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Rename' }));
        await userEvent.click(await screen.findByRole('button', { name: 'Save the name' }));
        expect(inner).toHaveBeenCalledTimes(1);
        expect(outer).not.toHaveBeenCalled();
    });
});
