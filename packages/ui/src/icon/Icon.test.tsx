import { render, screen } from '@testing-library/react';
import { Pencil } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { Icon } from './Icon';

describe('Icon', () => {
    it('is decorative without a label', () => {
        const { container } = render(<Icon icon={Pencil} />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('aria-hidden', 'true');
        expect(svg).toHaveAttribute('width', '16');
    });

    it('is an image with a label', () => {
        render(<Icon icon={Pencil} label="Edit" size="lg" />);
        const icon = screen.getByRole('img', { name: 'Edit' });
        expect(icon).toHaveAttribute('width', '20');
        expect(icon).not.toHaveAttribute('aria-hidden');
    });

    it('accepts a size in pixels and a class name', () => {
        const { container } = render(<Icon icon={Pencil} size={32} className="custom" />);
        expect(container.querySelector('svg')).toHaveAttribute('width', '32');
        expect(container.querySelector('svg')).toHaveClass('custom');
    });

    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)(
        'keeps a stroke of 2 units of the grid at the %s size, so it scales with the icon',
        (size) => {
            const { container } = render(<Icon icon={Pencil} size={size} />);
            expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '2');
        },
    );
});
