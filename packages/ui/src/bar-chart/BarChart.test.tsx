import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BarChart } from './BarChart';

const items = [
    { label: 'Running', value: 4, tone: 'info' as const },
    { label: 'Done', value: 1234, href: '/runs?filter[status]=done' },
    { label: 'Failed', value: 12, tone: 'danger' as const },
];

describe('BarChart', () => {
    it('lists the parts, the largest first, with their values for the locale', () => {
        render(<BarChart label="Runs by status" items={items} />);
        const list = screen.getByRole('list', { name: 'Runs by status' });
        expect(
            within(list)
                .getAllByRole('listitem')
                .map((item) => item.textContent),
        ).toEqual(['Done1,234', 'Failed12', 'Running4']);
    });

    it('draws bars against the largest part, in the tone of each part', () => {
        render(<BarChart label="Runs" items={items} />);
        const [done, failed] = screen.getAllByRole('listitem');
        const bar = (item: HTMLElement | undefined) =>
            item?.querySelector<HTMLElement>('[aria-hidden="true"] > div');
        expect(bar(done)?.style.width).toBe('100%');
        expect(bar(failed)?.style.width).toBe(`${(12 / 1234) * 100}%`);
        expect(failed).toHaveClass('panneau-tone-danger');
        expect(done).not.toHaveClass('panneau-tone-danger');
    });

    it('links a part to its list', () => {
        render(<BarChart label="Runs" items={items} />);
        expect(screen.getByRole('link', { name: 'Done' })).toHaveAttribute(
            'href',
            '/runs?filter[status]=done',
        );
        expect(screen.queryByRole('link', { name: 'Failed' })).toBeNull();
    });

    it('draws the rest last, as Other, with formatted values', () => {
        render(
            <BarChart
                label="Cost by tool"
                items={[
                    { label: 'Summaries', value: 2 },
                    { label: 'Translations', value: 1 },
                ]}
                other={5}
                formatValue={(value) => `${value} $`}
            />,
        );
        expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
            'Summaries2 $',
            'Translations1 $',
            'Other5 $',
        ]);
    });

    it('draws no bar for a part at 0, and no Other row without a rest', () => {
        render(<BarChart label="Runs" items={[{ label: 'Done', value: 0 }]} other={0} />);
        const [done] = screen.getAllByRole('listitem');
        expect(done?.querySelector('[aria-hidden="true"]')?.children).toHaveLength(0);
        expect(screen.queryByText('Other')).toBeNull();
    });

    it('draws a skeleton of its rows while it loads', () => {
        const { container } = render(<BarChart label="Runs" />);
        expect(screen.queryByRole('list')).toBeNull();
        expect(container.querySelectorAll('.panneau-skeleton')).toHaveLength(6);
    });
});
