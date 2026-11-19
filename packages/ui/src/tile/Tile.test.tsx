import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileText } from 'lucide-react';
import { RouterProvider } from 'react-aria-components';
import { describe, expect, it, vi } from 'vitest';

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
