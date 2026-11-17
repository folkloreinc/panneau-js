import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Meter } from './Meter';

describe('Meter', () => {
    it('is a meter with its value against the target', () => {
        render(<Meter label="Budget" value={250} target={1000} />);
        const meter = screen.getByRole('meter', { name: 'Budget' });
        expect(meter).toHaveAttribute('aria-valuenow', '250');
        expect(meter).toHaveAttribute('aria-valuemax', '1000');
        expect(meter).toHaveAttribute('aria-valuetext', '250 of 1,000');
        expect(meter.querySelector('[style]')).toHaveStyle({ width: '25%' });
    });

    it('stays full past the target, says the value, and takes its tone', () => {
        render(
            <Meter
                value={1250}
                target={1000}
                tone="danger"
                formatValue={(value) => `${value} CAD`}
            />,
        );
        const meter = screen.getByRole('meter', { name: 'Target' });
        expect(meter).toHaveAttribute('aria-valuenow', '1000');
        expect(meter).toHaveAttribute('aria-valuetext', '1250 CAD of 1000 CAD');
        expect(meter).toHaveClass('panneau-tone-danger');
    });

    it('is named by another element', () => {
        render(
            <>
                <span id="quota">Quota</span>
                <Meter aria-labelledby="quota" value={3} target={10} />
            </>,
        );
        expect(screen.getByRole('meter', { name: 'Quota' })).toBeInTheDocument();
    });
});
