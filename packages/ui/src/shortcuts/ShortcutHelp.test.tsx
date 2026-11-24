import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Button } from '../button/Button';
import { PanneauRoot } from '../root/PanneauRoot';
import type { ShortcutOptions } from './registry';
import { useShortcut, useShortcutHelp } from './useShortcut';

function Shortcut(props: ShortcutOptions) {
    useShortcut(props);
    return null;
}

function HelpButton() {
    const openHelp = useShortcutHelp();
    return openHelp !== null ? <Button onPress={openHelp}>Help</Button> : null;
}

/** The rows of a group of the help: label and keys. */
function rows(help: HTMLElement, group: string): string[] {
    const heading = within(help).getByRole('heading', { name: group });
    const section = heading.closest('section');
    return [...(section?.querySelectorAll('dt') ?? [])].map(
        (term) => `${term.textContent} ${term.nextElementSibling?.textContent ?? ''}`,
    );
}

afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
});

describe('ShortcutHelp', () => {
    it('opens with ?, and lists what is registered now, by group, once', async () => {
        const perform = vi.fn();
        const { rerender } = render(
            <PanneauRoot>
                <Shortcut id="goTo" keys="Mod+K" label="Go to…" perform={perform} />
                <Shortcut
                    id="save"
                    keys={['Mod+S', 'Mod+Enter']}
                    label="Save"
                    group="Forms"
                    perform={perform}
                />
                <Shortcut
                    id="save"
                    keys={['Mod+S', 'Mod+Enter']}
                    label="Save"
                    group="Forms"
                    perform={perform}
                />
            </PanneauRoot>,
        );
        act(() => {
            fireEvent.keyDown(document.body, { key: '?', shiftKey: true });
        });
        const help = await screen.findByRole('dialog', { name: 'Keyboard shortcuts' });
        expect(rows(help, 'General')).toEqual(['Show keyboard shortcuts ?', 'Go to… Ctrl+K']);
        expect(rows(help, 'Forms')).toEqual(['Save Ctrl+S or Ctrl+Enter']);
        expect(perform).not.toHaveBeenCalled();

        // A shortcut that goes leaves the help
        rerender(
            <PanneauRoot>
                <Shortcut id="goTo" keys="Mod+K" label="Go to…" perform={perform} />
            </PanneauRoot>,
        );
        expect(within(help).queryByRole('heading', { name: 'Forms' })).toBeNull();
    });

    it('shows the keys of Apple platforms', async () => {
        vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');
        render(
            <PanneauRoot>
                <Shortcut keys="Mod+\" label="Collapse or expand the sidebar" perform={vi.fn()} />
                <HelpButton />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Help' }));
        const help = await screen.findByRole('dialog', { name: 'Keyboard shortcuts' });
        expect(rows(help, 'General')).toContain('Collapse or expand the sidebar ⌘\\');
    });

    it('is not offered without a PanneauRoot', () => {
        render(<HelpButton />);
        expect(screen.queryByRole('button', { name: 'Help' })).toBeNull();
    });
});
