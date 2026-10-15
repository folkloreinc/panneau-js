import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

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
});
