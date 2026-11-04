import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Stat } from './Stat';

describe('Stat', () => {
    it('shows the number for the locale, what it counts and its help', () => {
        render(<Stat label="Entries to judge" value={1234} help="3 more than last week" />);
        expect(screen.getByText('1,234')).toBeInTheDocument();
        expect(screen.getByText('Entries to judge')).toBeInTheDocument();
        expect(screen.getByText('3 more than last week')).toBeInTheDocument();
    });

    it('is a link with everything it says as its name', () => {
        render(<Stat label="Overdue" value={3} help="Since Monday" tone="danger" href="/x" />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/x');
        expect(link).toHaveAccessibleName('Overdue 3 Since Monday');
        expect(link).toHaveClass('panneau-tone-danger');
    });

    it('formats with options, and shows text as is', () => {
        const { rerender } = render(
            <Stat value={1250} format={{ style: 'currency', currency: 'CAD' }} />,
        );
        expect(screen.getByText('CA$1,250.00')).toBeInTheDocument();
        rerender(<Stat value="n/a" />);
        expect(screen.getByText('n/a')).toBeInTheDocument();
    });

    it('draws a skeleton of the number while it loads, without a link', () => {
        const { container } = render(<Stat label="Overdue" href="/x" help="…" />);
        expect(screen.queryByRole('link')).toBeNull();
        expect(container.querySelectorAll('.panneau-skeleton')).toHaveLength(2);
    });
});
