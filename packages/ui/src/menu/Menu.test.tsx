import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pencil, Trash } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '../button/Button';
import { PanneauRoot } from '../root/PanneauRoot';
import { Menu, MenuItem, MenuSection, MenuSeparator, MenuTrigger } from './Menu';

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

    it('shows the selected item with a check, in a section with a header and a footer', async () => {
        const onSelectionChange = vi.fn();
        render(
            <PanneauRoot>
                <MenuTrigger>
                    <Button>Account</Button>
                    <Menu
                        aria-label="Accounts"
                        selectionMode="single"
                        selectedKeys={['ada']}
                        onSelectionChange={onSelectionChange}
                        footer="Only this step changes."
                    >
                        <MenuSection title="Publish on">
                            <MenuItem
                                id="ada"
                                media={<span data-testid="avatar">AL</span>}
                                description="@ada"
                            >
                                Ada Lovelace
                            </MenuItem>
                            <MenuItem id="grace" description="@grace">
                                Grace Hopper
                            </MenuItem>
                        </MenuSection>
                    </Menu>
                </MenuTrigger>
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Account' }));
        const menu = await screen.findByRole('menu');
        expect(screen.getByRole('group', { name: 'Publish on' })).toBeInTheDocument();
        expect(menu).toHaveAccessibleDescription('Only this step changes.');

        const items = screen.getAllByRole('menuitemradio');
        expect(items).toHaveLength(2);
        expect(items[0]).toHaveAttribute('aria-checked', 'true');
        expect(items[0]).toHaveAttribute('data-selected', 'true');
        expect(items[0]?.querySelector('svg')).not.toBeNull();
        expect(items[1]).toHaveAttribute('aria-checked', 'false');
        expect(items[1]?.querySelector('svg')).toBeNull();
        expect(items[0]).toContainElement(screen.getByTestId('avatar'));
        expect(items[0]).toHaveAccessibleName('Ada Lovelace');

        // The footer is neither an item nor focusable.
        const footer = screen.getByText('Only this step changes.');
        expect(menu).not.toContainElement(footer);
        expect(footer).not.toHaveAttribute('tabindex');

        await userEvent.click(items[1] as HTMLElement);
        expect([...(onSelectionChange.mock.calls[0]?.[0] as Set<string>)]).toEqual(['grace']);
    });

    it('has no check column without a selection mode', async () => {
        render(
            <PanneauRoot>
                <MenuTrigger>
                    <Button>Actions</Button>
                    <Menu aria-label="Actions">
                        <MenuItem id="edit">Edit</MenuItem>
                    </Menu>
                </MenuTrigger>
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Actions' }));
        const item = await screen.findByRole('menuitem', { name: 'Edit' });
        // Only the text: no media, and no room for a check.
        expect(item.children).toHaveLength(1);
        expect(screen.getByRole('menu')).not.toHaveAttribute('aria-describedby');
    });
});
