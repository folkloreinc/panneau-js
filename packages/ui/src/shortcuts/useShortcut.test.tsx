import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode, useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Button } from '../button/Button';
import { Dialog, DialogTrigger } from '../dialog/Dialog';
import { PanneauRoot } from '../root/PanneauRoot';
import type { ShortcutOptions } from './registry';
import { useShortcut } from './useShortcut';

function Shortcut(props: ShortcutOptions) {
    useShortcut(props);
    return null;
}

/** A region with a shortcut scoped to it. */
function Scoped({
    name,
    perform,
    keys = 'Mod+S',
    children,
}: {
    name: string;
    perform: () => void;
    keys?: string;
    children?: ReactNode;
}) {
    const ref = useRef<HTMLDivElement>(null);
    useShortcut({ keys, label: name, scope: ref, perform });
    return (
        <div ref={ref} role="group" aria-label={name}>
            <button type="button">{`In ${name}`}</button>
            {children}
        </div>
    );
}

/** Presses a key on an element, as the browser would: whether its default was prevented. */
function press(element: Element, key: string, init: KeyboardEventInit = {}): boolean {
    return !fireEvent.keyDown(element, { key, ...init });
}

beforeEach(() => {
    window.localStorage.clear();
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('useShortcut', () => {
    it('does nothing without a PanneauRoot', () => {
        const perform = vi.fn();
        render(<Shortcut keys="Mod+K" label="Go to" perform={perform} />);
        expect(press(document.body, 'k', { ctrlKey: true })).toBe(false);
        expect(perform).not.toHaveBeenCalled();
    });

    it('calls a shortcut of the page, and leaves the key once it is unmounted', () => {
        const perform = vi.fn();
        const { rerender } = render(
            <PanneauRoot>
                <Shortcut keys="Mod+K" label="Go to" perform={perform} />
            </PanneauRoot>,
        );
        expect(press(document.body, 'k', { ctrlKey: true })).toBe(true);
        expect(perform).toHaveBeenCalledOnce();
        // Not when the key repeats, nor once something handled it
        expect(press(document.body, 'k', { ctrlKey: true, repeat: true })).toBe(true);
        const handled = document.createElement('div');
        document.body.append(handled);
        handled.addEventListener('keydown', (event) => event.preventDefault());
        press(handled, 'k', { ctrlKey: true });
        handled.remove();
        expect(perform).toHaveBeenCalledOnce();

        rerender(<PanneauRoot />);
        expect(press(document.body, 'k', { ctrlKey: true })).toBe(false);
        expect(perform).toHaveBeenCalledOnce();
    });

    it('gives the key to the scope that holds the focus, then to the last of the page', () => {
        const first = vi.fn();
        const second = vi.fn();
        render(
            <PanneauRoot>
                <button type="button">Outside</button>
                <Scoped name="First" perform={first} />
                <Scoped name="Second" perform={second} />
            </PanneauRoot>,
        );
        press(screen.getByRole('button', { name: 'In First' }), 's', { ctrlKey: true });
        expect(first).toHaveBeenCalledOnce();
        expect(second).not.toHaveBeenCalled();
        press(screen.getByRole('button', { name: 'Outside' }), 's', { ctrlKey: true });
        expect(second).toHaveBeenCalledOnce();
    });

    it('gives the key to the innermost scope', () => {
        const outer = vi.fn();
        const inner = vi.fn();
        render(
            <PanneauRoot>
                <Scoped name="Outer" perform={outer}>
                    <Scoped name="Nested" perform={inner} />
                </Scoped>
            </PanneauRoot>,
        );
        press(screen.getByRole('button', { name: 'In Nested' }), 's', { ctrlKey: true });
        expect(inner).toHaveBeenCalledOnce();
        expect(outer).not.toHaveBeenCalled();
        press(screen.getByRole('button', { name: 'In Outer' }), 's', { ctrlKey: true });
        expect(outer).toHaveBeenCalledOnce();
    });

    it('gives the key to the open dialog, never to the page under it', async () => {
        const page = vi.fn();
        const pageScoped = vi.fn();
        const dialog = vi.fn();
        render(
            <PanneauRoot>
                <Shortcut keys="Mod+K" label="Go to" perform={page} />
                <Scoped name="Page" perform={pageScoped} />
                <DialogTrigger>
                    <Button>Open</Button>
                    <Dialog title="Parameters">
                        <Scoped name="Dialog" perform={dialog} />
                        <button type="button">Elsewhere in the dialog</button>
                    </Dialog>
                </DialogTrigger>
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Open' }));
        const open = await screen.findByRole('dialog', { name: 'Parameters' });
        const elsewhere = within(open).getByRole('button', { name: 'Elsewhere in the dialog' });
        // The scope of the dialog, from outside of it but in the dialog
        expect(press(elsewhere, 's', { ctrlKey: true })).toBe(true);
        expect(dialog).toHaveBeenCalledOnce();
        expect(pageScoped).not.toHaveBeenCalled();
        // A shortcut of the page: not under a dialog, and the browser doesn't get the key either
        expect(press(elsewhere, 'k', { ctrlKey: true })).toBe(true);
        expect(page).not.toHaveBeenCalled();
        // Nor from what the dialog hides of the page
        press(screen.getByRole('button', { name: 'In Page', hidden: true }), 'k', {
            ctrlKey: true,
        });
        expect(page).not.toHaveBeenCalled();
        expect(pageScoped).not.toHaveBeenCalled();
    });

    it('ignores single keys in text fields, selects and editors, and lets modified ones through', () => {
        const single = vi.fn();
        const modified = vi.fn();
        const notTyping = vi.fn();
        render(
            <PanneauRoot>
                <Shortcut keys="?" label="Help" perform={single} />
                <Shortcut keys="Mod+K" label="Go to" perform={modified} />
                <Shortcut keys="Mod+\" label="Sidebar" inInputs={false} perform={notTyping} />
                <input aria-label="Title" />
                <textarea aria-label="Summary" />
                <select aria-label="Status">
                    <option>Draft</option>
                </select>
                <div
                    contentEditable
                    role="textbox"
                    aria-label="Body"
                    suppressContentEditableWarning
                />
                <input type="checkbox" aria-label="Published" />
            </PanneauRoot>,
        );
        ['Title', 'Summary', 'Status', 'Body'].forEach((name) => {
            const field =
                name === 'Status'
                    ? screen.getByRole('combobox', { name })
                    : screen.getByRole('textbox', { name });
            expect(press(field, '?', { shiftKey: true })).toBe(false);
            press(field, 'k', { ctrlKey: true });
            expect(press(field, '\\', { ctrlKey: true })).toBe(false);
        });
        expect(single).not.toHaveBeenCalled();
        expect(notTyping).not.toHaveBeenCalled();
        expect(modified).toHaveBeenCalledTimes(4);
        // A checkbox takes no typing
        press(screen.getByRole('checkbox', { name: 'Published' }), '?', { shiftKey: true });
        expect(single).toHaveBeenCalledOnce();
    });

    it('ignores single keys once the user turned them off, and remembers it', async () => {
        const single = vi.fn();
        const { unmount } = render(
            <PanneauRoot>
                <Shortcut keys="j" label="Next" perform={single} />
            </PanneauRoot>,
        );
        press(document.body, 'j');
        expect(single).toHaveBeenCalledOnce();
        // In the help, which `?` opens
        press(document.body, '?', { shiftKey: true });
        const help = await screen.findByRole('dialog', { name: 'Keyboard shortcuts' });
        await userEvent.click(within(help).getByRole('switch', { name: 'Single-key shortcuts' }));
        expect(window.localStorage.getItem('panneau:single-key-shortcuts')).toBe('off');
        press(document.body, 'j');
        expect(single).toHaveBeenCalledOnce();
        unmount();

        render(
            <PanneauRoot>
                <Shortcut keys="j" label="Next" perform={single} />
                <Shortcut keys="Mod+K" label="Go to" perform={single} />
            </PanneauRoot>,
        );
        expect(press(document.body, 'j')).toBe(false);
        expect(single).toHaveBeenCalledOnce();
        press(document.body, 'k', { ctrlKey: true });
        expect(single).toHaveBeenCalledTimes(2);
    });

    it('uses the registry of an outer root', () => {
        const perform = vi.fn();
        render(
            <PanneauRoot>
                <PanneauRoot>
                    <Shortcut keys="Mod+K" label="Go to" perform={perform} />
                </PanneauRoot>
            </PanneauRoot>,
        );
        press(document.body, 'k', { ctrlKey: true });
        expect(perform).toHaveBeenCalledOnce();
    });
});
