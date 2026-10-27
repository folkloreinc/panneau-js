import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { Menu, MenuItem, MenuTrigger } from '../menu/Menu';
import { Popover, PopoverTrigger } from '../popover/Popover';
import { PanneauRoot } from '../root/PanneauRoot';
import { PillTrigger } from './PillTrigger';

describe('PillTrigger', () => {
    it('opens a menu, and says so', async () => {
        render(
            <PanneauRoot>
                <MenuTrigger>
                    <PillTrigger media={<span data-testid="avatar">AL</span>}>
                        Ada Lovelace
                    </PillTrigger>
                    <Menu aria-label="Accounts">
                        <MenuItem id="ada">Ada Lovelace</MenuItem>
                    </Menu>
                </MenuTrigger>
            </PanneauRoot>,
        );
        const trigger = screen.getByRole('button', { name: /Ada Lovelace/ });
        expect(trigger).toHaveClass('panneau-pill-trigger');
        expect(trigger).toContainElement(screen.getByTestId('avatar'));
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        await userEvent.click(trigger);
        expect(await screen.findByRole('menu')).toBeInTheDocument();
        expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('opens a popover', async () => {
        render(
            <PanneauRoot>
                <PopoverTrigger>
                    <PillTrigger size="sm" aria-label="Status: Draft">
                        Draft
                    </PillTrigger>
                    <Popover aria-label="Status">Status</Popover>
                </PopoverTrigger>
            </PanneauRoot>,
        );
        const trigger = screen.getByRole('button', { name: 'Status: Draft' });
        await userEvent.click(trigger);
        expect(await screen.findByRole('dialog', { name: 'Status' })).toBeInTheDocument();
    });
});
