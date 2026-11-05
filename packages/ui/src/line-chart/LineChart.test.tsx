import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LineChart } from './LineChart';

const points = [
    { label: 'Oct 5', value: 4 },
    { label: 'Oct 6', value: 0 },
    { label: 'Oct 7', value: 8 },
];

describe('LineChart', () => {
    it('gives its values to assistive technologies in a table', () => {
        render(<LineChart label="Entries per day" points={points} />);
        const table = screen.getByRole('table', { name: 'Entries per day' });
        expect(
            within(table)
                .getAllByRole('row')
                .map((row) => row.textContent),
        ).toEqual(['Oct 54', 'Oct 60', 'Oct 78']);
    });

    it('draws the line, a dot per point, the top of the scale and the first and last labels', () => {
        const { container } = render(
            <LineChart
                label="Entries"
                points={points}
                formatValue={(value) => `${value} entries`}
            />,
        );
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('aria-hidden', 'true');
        expect(svg?.querySelectorAll('path')).toHaveLength(2 + points.length);
        expect(svg?.querySelector('title')?.textContent).toBe('Oct 5: 4 entries');
        // Shown, and in the table
        expect(screen.getAllByText('8 entries')).toHaveLength(2);
        expect(screen.getAllByText('Oct 5')).toHaveLength(2);
        expect(screen.getAllByText('Oct 7')).toHaveLength(2);
        expect(screen.getAllByText('Oct 6')).toHaveLength(1);
    });

    it('draws only the last dot of a long series', () => {
        const long = Array.from({ length: 60 }, (_, index) => ({
            label: `Day ${index + 1}`,
            value: index,
        }));
        const { container } = render(<LineChart label="Entries" points={long} />);
        expect(container.querySelectorAll('svg path')).toHaveLength(3);
    });

    it('draws a skeleton of the plot while it loads', () => {
        const { container } = render(<LineChart label="Entries" />);
        expect(container.querySelector('svg')).toBeNull();
        expect(container.querySelectorAll('.panneau-skeleton').length).toBeGreaterThan(0);
    });
});
