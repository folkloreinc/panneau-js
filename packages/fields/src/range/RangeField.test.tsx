import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';

describe('RangeField', () => {
    it('is a slider between the min and max rules, empty until moved', () => {
        const onChange = vi.fn();
        renderField(
            <DefinitionField
                field={{
                    name: 'rating',
                    type: 'range',
                    label: 'Rating',
                    rules: [
                        { rule: 'min', value: 0 },
                        { rule: 'max', value: 10 },
                    ],
                    settings: { suffix: '/ 10' },
                }}
                path="rating"
                value={null}
                onChange={onChange}
            />,
        );
        const slider = screen.getByRole('slider', { name: 'Rating' });
        expect(slider).toHaveAttribute('min', '0');
        expect(slider).toHaveAttribute('max', '10');
        expect(screen.getByText('—')).toBeInTheDocument();
        fireEvent.change(slider, { target: { value: '7' } });
        expect(onChange).toHaveBeenCalledWith(7);
    });

    it('shows its value with its suffix', () => {
        renderField(
            <DefinitionField
                field={{
                    name: 'rating',
                    type: 'range',
                    label: 'Rating',
                    settings: { suffix: '%' },
                }}
                path="rating"
                value={40}
                onChange={() => undefined}
            />,
        );
        expect(screen.getByRole('slider', { name: 'Rating' })).toHaveValue('40');
        expect(screen.getByText(/40/)).toHaveTextContent('40 %');
    });
});
