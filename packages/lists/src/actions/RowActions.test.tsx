import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import type { ItemAction } from '@panneau/core';
import type { Action } from '@panneau/protocol';

import { renderList } from '../__fixtures__/render';
import { RowActions, orderRowActions } from './RowActions';
import { RowActionsFit, useRowActionsFit } from './fit';

const view: ItemAction = {
    action: { id: 'show', label: 'View', kind: 'link', scope: ['item'] },
    href: '/pages/2',
};
const edit: ItemAction = {
    action: { id: 'edit', label: 'Edit', kind: 'link', scope: ['item'] },
    href: '/pages/2/edit',
};
const duplicate: ItemAction = {
    action: { id: 'duplicate', label: 'Duplicate', kind: 'server', scope: ['item'] },
    href: null,
};
const remove: ItemAction = {
    action: {
        id: 'delete',
        label: 'Delete',
        kind: 'server',
        scope: ['item'],
        destructive: true,
    } satisfies Action,
    href: null,
};

function renderActions(
    level: number,
    menu: readonly ItemAction[] = [duplicate, remove],
    primary: string | null = 'show',
) {
    const onRun = vi.fn();
    renderList(
        <RowActionsFit value={level}>
            <RowActions
                itemLabel="Contact"
                actions={[view, edit]}
                menu={menu}
                pending={null}
                onRun={onRun}
                primary={primary}
            />
        </RowActionsFit>,
    );
    return onRun;
}

describe('RowActions', () => {
    it('orders the actions of the row, then those of the menu, then those that destroy', () => {
        expect(
            orderRowActions([remove, view], [duplicate, view]).map(({ action }) => action.id),
        ).toEqual(['show', 'duplicate', 'delete']);
    });

    it('shows every action as an icon in its color, but the main one, which keeps its label', async () => {
        const user = userEvent.setup();
        const onRun = renderActions(0);
        const show = screen.getByRole('link', { name: 'View: Contact' });
        expect(show).toHaveTextContent('View');
        expect(show.className).toMatch(/tone-info/);
        const link = screen.getByRole('link', { name: 'Edit: Contact' });
        expect(link).toHaveTextContent('');
        expect(link.querySelector('svg')).toHaveClass('lucide-pencil');
        expect(screen.getByRole('button', { name: 'Duplicate: Contact' })).toHaveTextContent('');
        const button = screen.getByRole('button', { name: 'Delete: Contact' });
        expect(button).toHaveTextContent('');
        expect(button.querySelector('svg')).toHaveClass('lucide-trash-2');
        expect(button.className).toMatch(/tone-danger/);
        expect(screen.queryByRole('button', { name: 'Actions for Contact' })).toBeNull();
        await user.click(button);
        expect(onRun).toHaveBeenCalledWith(remove.action);
    });

    it('shows every action as an icon without a main one', () => {
        renderActions(0, [duplicate, remove], null);
        expect(screen.getByRole('link', { name: 'View: Contact' })).toHaveTextContent('');
    });

    it('then moves the last actions to a menu, at least two', async () => {
        const user = userEvent.setup();
        const onRun = renderActions(2);
        expect(screen.getByRole('link', { name: 'View: Contact' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Edit: Contact' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Delete: Contact' })).toBeNull();
        await user.click(screen.getByRole('button', { name: 'Actions for Contact' }));
        const menu = await screen.findByRole('menu');
        expect(
            within(menu)
                .getAllByRole('menuitem')
                .map((item) => item.textContent),
        ).toEqual(['Duplicate', 'Delete']);
        await user.click(within(menu).getByRole('menuitem', { name: 'Delete' }));
        expect(onRun).toHaveBeenCalledWith(remove.action);
    });

    it('never puts a single action in the menu', () => {
        renderActions(2, []);
        // Two actions, both in the menu
        expect(screen.getByRole('button', { name: 'Actions for Contact' })).toBeInTheDocument();
        expect(screen.queryByRole('link')).toBeNull();
    });

    it('keeps a lone action as a button, at every level', () => {
        const onRun = vi.fn();
        renderList(
            <RowActionsFit value={5}>
                <RowActions
                    itemLabel="Contact"
                    actions={[]}
                    menu={[remove]}
                    pending={null}
                    onRun={onRun}
                />
            </RowActionsFit>,
        );
        expect(screen.getByRole('button', { name: 'Delete: Contact' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Actions for Contact' })).toBeNull();
    });
});

/** A list whose height and overflow at each level are given: jsdom lays nothing out. */
function Fitted({ content, count = 4 }: { content: string; count?: number }) {
    const [level, measure] = useRowActionsFit(content);
    return (
        <div ref={measure} data-testid="list" data-level={level}>
            <div data-row-actions={count}>
                <button type="button">Edit</button>
            </div>
        </div>
    );
}

function withSizes(sizes: readonly { height: number; overflow?: number }[], run: () => void) {
    const size = (element: HTMLElement) =>
        sizes[
            Math.min(
                Number(element.closest<HTMLElement>('[data-level]')?.dataset.level ?? 0),
                sizes.length - 1,
            )
        ] ?? { height: 0 };
    const height = vi
        .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
        .mockImplementation(function (this: HTMLElement) {
            return size(this).height;
        });
    const width = vi
        .spyOn(HTMLElement.prototype, 'scrollWidth', 'get')
        .mockImplementation(function (this: HTMLElement) {
            return 100 + (size(this).overflow ?? 0);
        });
    const client = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(100);
    try {
        run();
    } finally {
        height.mockRestore();
        width.mockRestore();
        client.mockRestore();
    }
}

describe('useRowActionsFit', () => {
    it('keeps every action out of the menu while the icons fit', () => {
        withSizes([{ height: 300 }, { height: 300 }], () => {
            render(<Fitted content="a" />);
            expect(screen.getByTestId('list')).toHaveAttribute('data-level', '0');
        });
    });

    it('opens no menu for the room of the content on rows of four actions', () => {
        withSizes([{ height: 300 }, { height: 300 }, { height: 200 }], () => {
            render(<Fitted content="a" />);
            expect(screen.getByTestId('list')).toHaveAttribute('data-level', '0');
        });
    });

    it('moves actions to the menu while they crowd, and keeps the level that crowds least', () => {
        withSizes(
            [
                { height: 100, overflow: 120 },
                { height: 100, overflow: 120 },
                { height: 100, overflow: 10 },
                { height: 100, overflow: 10 },
            ],
            () => {
                render(<Fitted content="a" />);
                expect(screen.getByTestId('list')).toHaveAttribute('data-level', '2');
            },
        );
    });

    it('moves actions to the menu for the room of the content on rows of many actions', () => {
        withSizes(
            [{ height: 300 }, { height: 280 }, { height: 280 }, { height: 250 }, { height: 250 }],
            () => {
                render(<Fitted content="a" count={9} />);
                // Four of the nine stay out of the menu, at most: the shortest rows with the
                // fewest actions in the menu
                expect(screen.getByTestId('list')).toHaveAttribute('data-level', '3');
            },
        );
    });

    it('starts over when the content changes', () => {
        let rerender: ((ui: ReactElement) => void) | undefined;
        withSizes(
            [
                { height: 100, overflow: 120 },
                { height: 100, overflow: 120 },
                { height: 100, overflow: 0 },
            ],
            () => {
                rerender = render(<Fitted content="a" />).rerender;
            },
        );
        expect(screen.getByTestId('list')).toHaveAttribute('data-level', '2');
        // Other items, whose actions fit
        withSizes([{ height: 100 }], () => {
            act(() => rerender?.(<Fitted content="b" />));
        });
        expect(screen.getByTestId('list')).toHaveAttribute('data-level', '0');
    });
});
