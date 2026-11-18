import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LineChart } from './LineChart';

const points = [
    { label: 'October 5, 2026', shortLabel: 'Oct 5', value: 4 },
    { label: 'October 6, 2026', shortLabel: 'Oct 6', value: 0 },
    { label: 'October 7, 2026', shortLabel: 'Oct 7', value: 8 },
];

/** The texts drawn on the chart, out of its table. */
function drawn(container: HTMLElement): string[] {
    return [...container.querySelectorAll('[aria-hidden="true"] span')]
        .map((node) => node.textContent)
        .filter((text) => text !== '');
}

describe('LineChart', () => {
    it('gives its values to assistive technologies in a table, with their full labels', () => {
        render(<LineChart label="Entries per day" points={points} />);
        const table = screen.getByRole('table', { name: 'Entries per day' });
        expect(
            within(table)
                .getAllByRole('row')
                .map((row) => row.textContent),
        ).toEqual(['October 5, 20264', 'October 6, 20260', 'October 7, 20268']);
    });

    it('draws a curve and its area, a scale of round values, the dates and the last value', () => {
        const { container } = render(
            <LineChart
                label="Entries"
                points={points}
                formatValue={(value) => `${value} entries`}
            />,
        );
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('aria-hidden', 'true');
        const paths = [...(svg?.querySelectorAll('path') ?? [])];
        expect(paths).toHaveLength(2);
        expect(paths[1]?.getAttribute('d')).toMatch(/^M0,60 C/);
        // 0 to 10 by 5, the short dates, and the last value
        expect(drawn(container)).toEqual([
            '10',
            '0',
            '5',
            '10',
            '8 entries',
            'Oct 5',
            'Oct 6',
            'Oct 7',
        ]);
    });

    it('joins the points straight with a linear curve', () => {
        const { container } = render(<LineChart label="Entries" points={points} curve="linear" />);
        expect(container.querySelectorAll('svg path')[1]?.getAttribute('d')).toBe(
            'M0,60 L50,100 L100,20',
        );
    });

    it('draws only a line at 0 without the scale, and nothing written with nothing to show', () => {
        const { container } = render(
            <LineChart label="Entries" points={points} showAxis={false} showLast={false} />,
        );
        expect(container.querySelectorAll('svg line')).toHaveLength(1);
        expect(drawn(container)).toEqual(['Oct 5', 'Oct 6', 'Oct 7']);
    });

    it('writes what the values are, and marks the highest one', () => {
        const { container } = render(
            <LineChart
                label="Entries"
                axisLabel="Entries"
                showLast={false}
                showMax
                points={[...points, { label: 'October 8, 2026', value: 2 }]}
            />,
        );
        expect(screen.getByText('Entries', { selector: 'div' })).toHaveAttribute(
            'aria-hidden',
            'true',
        );
        expect(drawn(container)).toContain('8');
    });

    it('fixes the bounds of the scale with a domain', () => {
        const { container } = render(
            <LineChart
                label="Judged"
                points={[{ label: 'Oct 5', value: 0.25 }]}
                domain={{ min: 0, max: 1 }}
                formatTick={(value) => `${value * 100}%`}
                showLast={false}
            />,
        );
        expect(drawn(container)).toEqual(['100%', '0%', '50%', '100%', 'Oct 5']);
    });

    it('is not focusable unless interactive', () => {
        render(<LineChart label="Entries" points={points} />);
        expect(screen.queryByRole('slider')).toBeNull();
    });

    it('shows the value of a point chosen with the keys or the pointer when interactive', () => {
        render(<LineChart label="Entries" points={points} isInteractive />);
        const plot = screen.getByRole('slider', { name: 'Entries' });
        expect(plot).toHaveAttribute('aria-valuetext', 'October 7, 2026: 8');
        fireEvent.focus(plot);
        fireEvent.keyDown(plot, { key: 'ArrowLeft' });
        expect(plot).toHaveAttribute('aria-valuenow', '1');
        expect(plot).toHaveAttribute('aria-valuetext', 'October 6, 2026: 0');
        // In the tooltip, the full label
        expect(screen.getAllByText('October 6, 2026')).toHaveLength(2);
        fireEvent.keyDown(plot, { key: 'Home' });
        expect(plot).toHaveAttribute('aria-valuenow', '0');
        fireEvent.keyDown(plot, { key: 'ArrowLeft' });
        expect(plot).toHaveAttribute('aria-valuenow', '0');
        fireEvent.blur(plot);
        expect(screen.getAllByText('October 6, 2026')).toHaveLength(1);
    });

    it('draws a skeleton of the plot while it loads', () => {
        const { container } = render(<LineChart label="Entries" />);
        expect(container.querySelector('svg')).toBeNull();
        expect(container.querySelectorAll('.panneau-skeleton').length).toBeGreaterThan(0);
    });

    it('lays a series of 0 on the baseline', () => {
        const { container } = render(
            <LineChart label="Entries" points={points.map((point) => ({ ...point, value: 0 }))} />,
        );
        expect(container.querySelectorAll('svg path')[1]?.getAttribute('d')).toMatch(/^M0,100 /);
    });

    it('hides the table, its caption included, in a wrapper', () => {
        render(<LineChart label="Entries per day" points={points} />);
        const table = screen.getByRole('table', { name: 'Entries per day' });
        expect(table.className).toBe('');
        expect(table.parentElement?.className).toMatch(/visuallyHidden/);
    });

    describe('with several lines', () => {
        const series = [
            { label: 'Emails', points },
            {
                label: 'Texts',
                points: points.map((point) => ({ ...point, value: 2 })),
                tone: 'danger' as const,
            },
        ];

        it('gives a column per line in its table', () => {
            render(<LineChart label="Messages per day" series={series} />);
            const table = screen.getByRole('table', { name: 'Messages per day' });
            expect(
                within(table)
                    .getAllByRole('row')
                    .map((row) => row.textContent),
            ).toEqual([
                'DateEmailsTexts',
                'October 5, 202642',
                'October 6, 202602',
                'October 7, 202682',
            ]);
        });

        it('draws a line per series, in its color or its tone, without values on them', () => {
            const { container } = render(<LineChart label="Messages" series={series} />);
            const lines = container.querySelectorAll('svg g g');
            expect(lines).toHaveLength(2);
            expect(lines[1]).toHaveClass('panneau-tone-danger');
            expect(drawn(container)).toEqual(['10', '0', '5', '10', 'Oct 5', 'Oct 6', 'Oct 7']);
        });

        it('stacks them, on a scale of their total', () => {
            const { container } = render(<LineChart label="Messages" series={series} stacked />);
            expect(container.querySelectorAll('svg g g path')).toHaveLength(4);
            expect(drawn(container)).toContain('10');
            // The dot of the top line is on the total of the last day: 8 + 2 of 10
            const dots = [...container.querySelectorAll<HTMLElement>('[aria-hidden="true"] span')];
            expect(dots.some((dot) => dot.style.top === '0%')).toBe(true);
        });

        it('says the value of each line at a point, from the keyboard', () => {
            render(<LineChart label="Messages" series={series} isInteractive />);
            const plot = screen.getByRole('slider', { name: 'Messages' });
            fireEvent.focus(plot);
            expect(plot).toHaveAttribute('aria-valuetext', 'October 7, 2026: Emails: 8, Texts: 2');
        });
    });
});
