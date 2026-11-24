import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { PanneauRoot } from '../root/PanneauRoot';
import { ReorderHandle, ReorderItem, ReorderList } from './ReorderList';

const NAMES = ['Intro', 'Quote', 'Gallery'];

function List({ onMove }: { onMove?: (from: number, to: number) => void }) {
    const [names, setNames] = useState(NAMES);
    return (
        <PanneauRoot>
            <ReorderList
                itemCount={names.length}
                itemLabel={(index) => names[index] ?? ''}
                onMove={(from, to) => {
                    onMove?.(from, to);
                    const next = [...names];
                    const [name] = next.splice(from, 1);
                    next.splice(to, 0, name ?? '');
                    setNames(next);
                }}
            >
                {names.map((name, index) => (
                    <ReorderItem key={name} id={name} index={index}>
                        <ReorderHandle />
                        <label>
                            {name} <input defaultValue={name} />
                        </label>
                    </ReorderItem>
                ))}
            </ReorderList>
        </PanneauRoot>
    );
}

const order = () => screen.getAllByRole('listitem').map((item) => item.dataset.reorderId);

describe('ReorderList', () => {
    it('renders a list of items, each with a handle named after it', () => {
        render(<List />);
        expect(screen.getByRole('list')).toBeInTheDocument();
        expect(order()).toEqual(NAMES);
        const handle = screen.getByRole('button', { name: 'Move Quote' });
        expect(handle).toHaveAttribute('draggable', 'true');
        expect(handle).toHaveAttribute('tabindex', '0');
        // The places only show while an item is dragged
        expect(document.querySelectorAll('[data-reorder-gap]')).toHaveLength(0);
    });

    it('moves an item with the keyboard, and gives the focus back to its handle', async () => {
        const onMove = vi.fn();
        const user = userEvent.setup();
        render(<List onMove={onMove} />);
        await user.click(screen.getByRole('textbox', { name: 'Gallery' }));
        await user.tab({ shift: true });
        expect(screen.getByRole('button', { name: 'Move Gallery' })).toHaveFocus();
        await user.keyboard('{Enter}');
        // Every place but the two around the item
        await waitFor(() =>
            expect(
                [...document.querySelectorAll('[data-reorder-gap]')].map((gap) =>
                    gap.getAttribute('aria-label'),
                ),
            ).toEqual(['Before Intro', 'Before Quote']),
        );
        await waitFor(() => expect(document.activeElement).toHaveAttribute('data-reorder-gap'));
        act(() => screen.getByRole('button', { name: 'Before Intro' }).focus());
        await user.keyboard('{Enter}');
        expect(onMove).toHaveBeenCalledWith(2, 0);
        expect(order()).toEqual(['Gallery', 'Intro', 'Quote']);
        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Move Gallery' })).toHaveFocus(),
        );
        expect(screen.getByRole('status')).toHaveTextContent('Gallery moved to position 1 of 3');
        expect(document.querySelectorAll('[data-reorder-gap]')).toHaveLength(0);
    });

    it('puts the item back on Escape', async () => {
        const onMove = vi.fn();
        const user = userEvent.setup();
        render(<List onMove={onMove} />);
        screen.getByRole('button', { name: 'Move Intro' }).focus();
        await user.keyboard('{Enter}');
        await waitFor(() => expect(document.activeElement).toHaveAttribute('data-reorder-gap'));
        await user.keyboard('{Escape}');
        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Move Intro' })).toHaveFocus(),
        );
        expect(onMove).not.toHaveBeenCalled();
        expect(order()).toEqual(NAMES);
    });

    it('puts the item back when the list goes while an item is held', async () => {
        const user = userEvent.setup();
        const { unmount } = render(
            <>
                <List />
                <button type="button">Outside</button>
            </>,
        );
        screen.getByRole('button', { name: 'Move Intro' }).focus();
        await user.keyboard('{Enter}');
        await waitFor(() => expect(document.activeElement).toHaveAttribute('data-reorder-gap'));
        unmount();
        // No drag is left: another list can start one, and nothing stays inert
        expect(document.querySelectorAll('[inert], [aria-hidden="true"]')).toHaveLength(0);
        render(<List />);
        screen.getByRole('button', { name: 'Move Quote' }).focus();
        await user.keyboard('{Enter}');
        await waitFor(() => expect(document.activeElement).toHaveAttribute('data-reorder-gap'));
        await user.keyboard('{Escape}');
    });

    it('disables the handles of a disabled list or of a single item', () => {
        const { rerender } = render(
            <ReorderList itemCount={1} onMove={() => {}}>
                <ReorderItem id="a" index={0}>
                    <ReorderHandle label="Move A" />
                </ReorderItem>
            </ReorderList>,
        );
        const handle = screen.getByRole('button', { name: 'Move A' });
        expect(handle).toHaveAttribute('aria-disabled', 'true');
        expect(handle).not.toHaveAttribute('tabindex');
        rerender(
            <ReorderList itemCount={2} onMove={() => {}} isDisabled>
                <ReorderItem id="a" index={0}>
                    <ReorderHandle label="Move A" />
                </ReorderItem>
                <ReorderItem id="b" index={1}>
                    <ReorderHandle label="Move B" />
                </ReorderItem>
            </ReorderList>,
        );
        expect(screen.getByRole('button', { name: 'Move B' })).toHaveAttribute(
            'aria-disabled',
            'true',
        );
    });

    it('asks for a list around its items', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() =>
            render(
                <ReorderItem id="a" index={0}>
                    A
                </ReorderItem>,
            ),
        ).toThrow('ReorderItem and ReorderHandle go inside a ReorderList.');
        vi.restoreAllMocks();
    });
});
