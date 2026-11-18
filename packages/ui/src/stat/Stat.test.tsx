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

    it('says its change from a previous value, with an arrow, in its tone', () => {
        const { container, rerender } = render(
            <Stat
                value={40}
                change={{
                    direction: 'up',
                    label: '12% from the previous 30 days',
                    tone: 'success',
                }}
            />,
        );
        const change = screen.getByText('12% from the previous 30 days').parentElement;
        expect(change).toHaveTextContent('Up 12% from the previous 30 days');
        expect(change).toHaveClass('panneau-tone-success');
        expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
        rerender(
            <Stat value={40} change={{ direction: 'none', label: 'No change from last month' }} />,
        );
        expect(screen.getByText('No change from last month').parentElement).toHaveTextContent(
            /^No change from last month$/,
        );
        expect(container.querySelector('svg')).toBeNull();
    });

    it('formats with options, and shows text as is', () => {
        const { rerender } = render(
            <Stat value={1250} format={{ style: 'currency', currency: 'CAD' }} />,
        );
        expect(screen.getByText('CA$1,250.00')).toBeInTheDocument();
        rerender(<Stat value="n/a" />);
        expect(screen.getByText('n/a')).toBeInTheDocument();
    });

    it('draws a meter of its target, in its tone or danger past it', () => {
        const { rerender } = render(<Stat label="Spent" value={600} target={1000} />);
        const meter = screen.getByRole('meter', { name: 'Spent' });
        expect(meter).toHaveAttribute('aria-valuetext', '600 of 1,000');
        expect(meter).not.toHaveClass('panneau-tone-danger');
        rerender(<Stat label="Spent" value={1200} target={1000} />);
        expect(screen.getByRole('meter')).toHaveClass('panneau-tone-danger');
        rerender(<Stat label="Spent" value={1200} target={1000} tone="warning" />);
        expect(screen.getByRole('meter')).toHaveClass('panneau-tone-warning');
        rerender(<Stat label="Spent" value={1200} target={null} />);
        expect(screen.queryByRole('meter')).toBeNull();
    });

    it('draws a skeleton of the number while it loads, without a link', () => {
        const { container } = render(<Stat label="Overdue" href="/x" help="…" />);
        expect(screen.queryByRole('link')).toBeNull();
        expect(container.querySelectorAll('.panneau-skeleton')).toHaveLength(2);
    });
});
