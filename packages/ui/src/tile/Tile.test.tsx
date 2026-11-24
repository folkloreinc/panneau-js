import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileText } from 'lucide-react';
import { useState } from 'react';
import { RouterProvider } from 'react-aria-components';
import { describe, expect, it, vi } from 'vitest';

import { ReorderMenu } from '../reorder/ReorderList';
import { Tile, TileGroup } from './Tile';

describe('Tile', () => {
    it('shows a media, a title, a description, more content and actions', () => {
        const { container } = render(
            <Tile
                icon={FileText}
                title="Report.pdf"
                description="2.4 MB"
                actions={<button>Remove</button>}
            >
                Uploaded yesterday
            </Tile>,
        );
        expect(container.firstChild?.nodeName).toBe('DIV');
        expect(screen.getByText('Report.pdf')).toBeInTheDocument();
        expect(screen.getByText('2.4 MB')).toBeInTheDocument();
        expect(screen.getByText('Uploaded yesterday')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
        expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
        expect(screen.queryByRole('link')).toBeNull();
    });

    it('makes its title a link through the router, and keeps its actions apart', async () => {
        const navigate = vi.fn();
        const onRemove = vi.fn();
        render(
            <RouterProvider navigate={navigate}>
                <Tile
                    title="Ada Lovelace"
                    href="/users/1"
                    actions={<button onClick={onRemove}>Remove</button>}
                />
            </RouterProvider>,
        );
        const link = screen.getByRole('link', { name: 'Ada Lovelace' });
        expect(link).toHaveAttribute('href', '/users/1');
        await userEvent.click(link);
        expect(navigate).toHaveBeenCalledWith('/users/1', undefined);
        await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
        expect(onRemove).toHaveBeenCalled();
        expect(navigate).toHaveBeenCalledTimes(1);
    });

    it('opens an external link in a new tab', () => {
        render(<Tile title="Docs" href="https://example.com" external />);
        expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('target', '_blank');
    });
});

describe('TileGroup', () => {
    it('is a list of its tiles', () => {
        render(
            <TileGroup label="Sessions" appearance="outline">
                <Tile title="Firefox on Linux" />
                <Tile title="Safari on iPhone" />
            </TileGroup>,
        );
        const list = screen.getByRole('list', { name: 'Sessions' });
        expect(list).toHaveClass('panneau-tile-group');
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });
});

function Files({
    onMove,
    disabled,
}: {
    onMove?: (from: number, to: number) => void;
    disabled?: boolean;
}) {
    const [names, setNames] = useState(['a.pdf', 'b.pdf', 'c.pdf']);
    return (
        <TileGroup
            label="Files"
            itemLabel={(index) => names[index] ?? ''}
            isReorderDisabled={disabled}
            onMove={(from, to) => {
                onMove?.(from, to);
                setNames(names.toSpliced(from, 1).toSpliced(to, 0, names[from] ?? ''));
            }}
        >
            {names.map((name) => (
                <Tile key={name} title={name} icon={FileText} actions={<ReorderMenu />} />
            ))}
        </TileGroup>
    );
}

describe('TileGroup with onMove', () => {
    it('gives each tile a handle before its media, and keeps its key as it moves', async () => {
        const onMove = vi.fn();
        render(<Files onMove={onMove} />);
        const [first] = screen.getAllByRole('listitem');
        expect(first?.firstElementChild).toBe(screen.getByRole('button', { name: 'Move a.pdf' }));
        expect(first).toHaveAttribute('data-reorder-id');
        const id = first?.dataset.reorderId;

        act(() => screen.getByRole('button', { name: 'Move a.pdf' }).focus());
        await userEvent.keyboard('{Enter}');
        await waitFor(() => expect(document.activeElement).toHaveAttribute('data-reorder-gap'));
        act(() => screen.getByRole('button', { name: 'After c.pdf' }).focus());
        await userEvent.keyboard('{Enter}');
        expect(onMove).toHaveBeenCalledWith(0, 2);
        expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
            'b.pdf',
            'c.pdf',
            'a.pdf',
        ]);
        expect(screen.getAllByRole('listitem')[2]?.dataset.reorderId).toBe(id);
        await waitFor(() =>
            expect(screen.getByRole('button', { name: 'Move a.pdf' })).toHaveFocus(),
        );
    });

    it('moves a tile from its menu', async () => {
        const onMove = vi.fn();
        render(<Files onMove={onMove} />);
        await userEvent.click(screen.getByRole('button', { name: 'Reorder c.pdf' }));
        await userEvent.click(screen.getByRole('menuitem', { name: 'Move to the start' }));
        expect(onMove).toHaveBeenCalledWith(2, 0);
        expect(screen.getByRole('status')).toHaveTextContent('c.pdf moved to position 1 of 3');
    });

    it('has no handle and no menu when it can’t be reordered', () => {
        render(<Files disabled />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });
});
