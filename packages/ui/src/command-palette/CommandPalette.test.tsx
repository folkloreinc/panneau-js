import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { RouterProvider } from 'react-aria-components';
import { describe, expect, it, vi } from 'vitest';

import { PanneauRoot } from '../root/PanneauRoot';
import { CommandPalette } from './CommandPalette';
import type { CommandPaletteGroup } from './match';
import { useCommandShortcut } from './useCommandShortcut';

function Palette({
    groups,
    navigate = vi.fn(),
}: {
    groups: CommandPaletteGroup[];
    navigate?: (href: string) => void;
}) {
    const [isOpen, setOpen] = useState(false);
    useCommandShortcut(() => setOpen((open) => !open), { isOpen });
    return (
        <PanneauRoot>
            <RouterProvider navigate={navigate}>
                <button type="button" onClick={() => setOpen(true)}>
                    Go to…
                </button>
                <CommandPalette
                    isOpen={isOpen}
                    onOpenChange={setOpen}
                    groups={groups}
                    aria-label="Go to…"
                />
            </RouterProvider>
        </PanneauRoot>
    );
}

const groups: CommandPaletteGroup[] = [
    {
        id: 'nav',
        label: 'Navigation',
        items: [
            { id: 'pages', label: 'Pages', href: '/pages' },
            { id: 'authors', label: 'Authors', href: '/authors', description: 'People' },
        ],
    },
];

describe('CommandPalette', () => {
    it('opens with Ctrl+K, matches as the user types, and goes to the chosen item', async () => {
        const user = userEvent.setup();
        const navigate = vi.fn();
        const onAction = vi.fn();
        render(
            <Palette
                navigate={navigate}
                groups={[
                    ...groups,
                    {
                        id: 'actions',
                        label: 'Actions',
                        items: [{ id: 'dark', label: 'Dark appearance', onAction }],
                    },
                ]}
            />,
        );
        await user.keyboard('{Control>}k{/Control}');
        const dialog = await screen.findByRole('dialog', { name: 'Go to…' });
        const field = within(dialog).getByRole('searchbox', { name: 'Go to…' });
        expect(field).toHaveFocus();
        expect(within(dialog).getAllByRole('menuitem')).toHaveLength(3);
        expect(within(dialog).getByRole('status')).toHaveTextContent('3 results');

        await user.type(field, 'auth');
        expect(
            within(dialog)
                .getAllByRole('menuitem')
                .map((item) => item.textContent),
        ).toEqual(['AuthorsPeople']);
        await user.keyboard('{ArrowDown}{Enter}');
        expect(navigate).toHaveBeenCalledWith('/authors', undefined);
        expect(screen.queryByRole('dialog')).toBeNull();

        await user.click(screen.getByRole('button', { name: 'Go to…' }));
        // The field is empty again.
        expect(await screen.findByRole('searchbox', { name: 'Go to…' })).toHaveValue('');
        await user.click(screen.getByRole('menuitem', { name: 'Dark appearance' }));
        expect(onAction).toHaveBeenCalledOnce();
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('says when nothing matches', async () => {
        const user = userEvent.setup();
        render(<Palette groups={groups} />);
        await user.click(screen.getByRole('button', { name: 'Go to…' }));
        await user.type(await screen.findByRole('searchbox'), 'zzz');
        expect(screen.getByRole('status')).toHaveTextContent('No results');
    });

    it('leaves the shortcut to what already handled it', () => {
        render(<Palette groups={groups} />);
        const editor = document.createElement('div');
        document.body.append(editor);
        editor.addEventListener('keydown', (event) => event.preventDefault());
        act(() => {
            fireEvent.keyDown(editor, { key: 'k', ctrlKey: true, bubbles: true });
        });
        expect(screen.queryByRole('dialog')).toBeNull();
        editor.remove();
    });

    it('narrows the search to a scope, until Backspace or its button removes it', async () => {
        const user = userEvent.setup();
        function Scoped() {
            const [scope, setScope] = useState<string | null>(null);
            return (
                <PanneauRoot>
                    <CommandPalette
                        isOpen
                        onOpenChange={vi.fn()}
                        aria-label="Go to…"
                        scope={scope}
                        onScopeRemove={() => setScope(null)}
                        groups={
                            scope === null
                                ? [
                                      {
                                          id: 'scopes',
                                          label: 'Search in',
                                          items: [
                                              {
                                                  id: 'pages',
                                                  label: 'Pages',
                                                  keepsOpen: true,
                                                  onAction: () => setScope('Pages'),
                                              },
                                          ],
                                      },
                                  ]
                                : []
                        }
                    />
                </PanneauRoot>
            );
        }
        render(<Scoped />);
        await user.click(await screen.findByRole('menuitem', { name: 'Pages' }));
        // The palette stays open, narrowed to pages.
        const field = screen.getByRole('searchbox', { name: 'Go to…: Pages' });
        await user.click(field);
        await user.keyboard('{Backspace}');
        expect(screen.getByRole('searchbox', { name: 'Go to…' })).toBeInTheDocument();

        await user.click(screen.getByRole('menuitem', { name: 'Pages' }));
        await user.click(screen.getByRole('button', { name: 'Stop searching in Pages' }));
        expect(screen.getByRole('menuitem', { name: 'Pages' })).toBeInTheDocument();
    });
});
