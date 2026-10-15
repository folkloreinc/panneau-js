import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pencil, Trash } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../button/Button';
import { PanneauRoot } from '../root/PanneauRoot';
import { Menu, MenuItem, MenuSeparator, MenuTrigger } from './Menu';

describe('Menu', () => {
    it('runs the action of an item', async () => {
        const onAction = vi.fn();
        render(
            <PanneauRoot>
                <MenuTrigger>
                    <Button>Actions</Button>
                    <Menu onAction={onAction} aria-label="Actions">
                        <MenuItem id="edit" icon={Pencil}>
                            Edit
                        </MenuItem>
                        <MenuSeparator />
                        <MenuItem id="delete" icon={Trash} isDanger description="Can't be undone">
                            Delete
                        </MenuItem>
                    </Menu>
                </MenuTrigger>
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
        const items = await screen.findAllByRole('menuitem');
        expect(items).toHaveLength(2);
        expect(items[1]).toHaveAttribute('data-danger', 'true');
        await userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
        expect(onAction.mock.calls[0]?.[0]).toBe('delete');
    });
});
