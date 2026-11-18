import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Sparkline } from './Sparkline';

describe('Sparkline', () => {
    it('is decorative without a label', () => {
        const { container } = render(<Sparkline values={[1, 4, 2]} />);
        expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
        expect(screen.queryByRole('img')).toBeNull();
    });

    it('is an image with its label', () => {
        render(<Sparkline values={[1, 4, 2]} label="Emails per day" />);
        expect(screen.getByRole('img', { name: 'Emails per day' })).toBeInTheDocument();
    });

    it('draws from the lowest value to the highest, with a dot on the last one', () => {
        const { container } = render(<Sparkline values={[1700, 1650, 1600, 1675]} />);
        const dot = container.querySelector<HTMLElement>('span');
        expect(dot?.style.left).toBe('100%');
        expect(dot?.style.top).toBe('25%');
        expect(container.querySelectorAll('path')).toHaveLength(2);
    });

    it('draws a single value, and equal values, as a flat line: at the bottom at 0', () => {
        const { container, rerender } = render(<Sparkline values={[3]} />);
        expect(container.querySelector('path')?.getAttribute('d')).toBe('M0,50 L100,50');
        rerender(<Sparkline values={[0, 0]} />);
        expect(container.querySelector<HTMLElement>('span')?.style.top).toBe('100%');
    });

    it('draws a skeleton while the values load, and takes a tone', () => {
        const { container, rerender } = render(<Sparkline />);
        expect(container.querySelector('path')).toBeNull();
        rerender(<Sparkline values={[1, 2]} tone="danger" />);
        expect(container.firstElementChild).toHaveClass('panneau-tone-danger');
    });
});
