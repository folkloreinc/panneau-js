import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PanneauRoot } from '../root/PanneauRoot';
import { Slider } from './Slider';

describe('Slider', () => {
    it('shows its value, and a dash until it is set', () => {
        const onChange = vi.fn();
        const { rerender } = render(
            <PanneauRoot>
                <Slider label="Volume" value={null} onChange={onChange} />
            </PanneauRoot>,
        );
        const slider = screen.getByRole('slider', { name: 'Volume' });
        expect(screen.getByText('—')).toBeInTheDocument();
        fireEvent.change(slider, { target: { value: '30' } });
        expect(onChange).toHaveBeenCalledWith(30);

        rerender(
            <PanneauRoot>
                <Slider label="Volume" value={30} suffix="%" errors={['Too loud.']} />
            </PanneauRoot>,
        );
        expect(screen.getByText(/30/)).toHaveTextContent('30 %');
        expect(slider).toHaveAccessibleDescription('Too loud.');
    });
});
