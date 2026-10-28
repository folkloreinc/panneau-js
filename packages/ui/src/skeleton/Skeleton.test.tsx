import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LoadingRegion } from './LoadingRegion';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
    it('is hidden from assistive technologies, with its panneau-skeleton class', () => {
        const { container } = render(<Skeleton />);
        const block = container.firstElementChild;
        expect(block).toHaveAttribute('aria-hidden', 'true');
        expect(block).toHaveClass('panneau-skeleton');
    });

    it('draws as many lines as asked', () => {
        const { container } = render(<Skeleton lines={3} width="20rem" />);
        const block = container.firstElementChild as HTMLElement;
        expect(block.children).toHaveLength(3);
        expect(block.style.width).toBe('20rem');
    });

    it('sizes a rectangle by its height or its aspect ratio', () => {
        const { container } = render(
            <>
                <Skeleton shape="rect" height={40} />
                <Skeleton shape="rect" aspectRatio="16 / 9" />
            </>,
        );
        const [byHeight, byRatio] = [...container.children] as HTMLElement[];
        expect(byHeight?.style.height).toBe('40px');
        expect(byRatio?.style.aspectRatio).toBe('16 / 9');
    });

    it('ignores a height on lines of text, which take the height of a line', () => {
        const { container } = render(<Skeleton height={80} />);
        expect((container.firstElementChild as HTMLElement).style.height).toBe('');
    });
});

describe('LoadingRegion', () => {
    it('is busy, and says the content loads in a status message', () => {
        const { container } = render(
            <LoadingRegion>
                <Skeleton />
            </LoadingRegion>,
        );
        expect(screen.getByRole('status')).toHaveTextContent('Loading…');
        const region = container.querySelector('[aria-busy="true"]');
        expect(region).toHaveClass('panneau-loading-region');
        expect(region?.querySelector('.panneau-skeleton')).not.toBeNull();
    });

    it('takes its own status message', () => {
        render(<LoadingRegion label="Loading the articles…" />);
        expect(screen.getByRole('status')).toHaveTextContent('Loading the articles…');
    });
});
