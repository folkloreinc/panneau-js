import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ChartLegend } from './ChartLegend';

describe('ChartLegend', () => {
    it('lists the names, values and help of the lines, in order', () => {
        render(
            <ChartLegend
                label="Messages per day"
                items={[
                    { label: 'Emails', value: '1,240', href: '/emails' },
                    { label: 'Texts', value: '86', help: '4 failed', helpTone: 'danger' },
                ]}
            />,
        );
        const list = screen.getByRole('list', { name: 'Messages per day' });
        expect(
            within(list)
                .getAllByRole('listitem')
                .map((item) => item.textContent),
        ).toEqual(['Emails1,240', 'Texts4 failed86']);
        expect(screen.getByRole('link', { name: 'Emails' })).toHaveAttribute('href', '/emails');
        expect(screen.getByText('4 failed')).toHaveClass('panneau-tone-danger');
    });

    it('draws the color of each line, or of its tone', () => {
        const { container } = render(
            <ChartLegend
                label="Runs"
                items={[{ label: 'Done' }, { label: 'Failed', tone: 'danger' }]}
            />,
        );
        const swatches = container.querySelectorAll<HTMLElement>('[aria-hidden="true"]');
        expect(swatches[0]?.style.getPropertyValue('--_panneau-chart-legend-color')).toBe(
            'var(--panneau-chart-categorical-1)',
        );
        expect(swatches[1]).toHaveClass('panneau-tone-danger');
    });
});
