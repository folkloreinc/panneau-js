import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { NumberInput } from './NumberInput';

describe('NumberInput', () => {
    it('gives numbers, and null when cleared', async () => {
        const onChange = vi.fn();
        function Controlled() {
            const [value, setValue] = useState<number | null>(4);
            return (
                <NumberInput
                    label="Quantity"
                    value={value}
                    onChange={(next) => {
                        setValue(next);
                        onChange(next);
                    }}
                />
            );
        }
        render(<Controlled />);
        const input = screen.getByRole('textbox', { name: 'Quantity' });
        expect(input).toHaveValue('4');
        await userEvent.clear(input);
        await userEvent.tab();
        expect(onChange).toHaveBeenLastCalledWith(null);
        await userEvent.type(input, '12');
        await userEvent.tab();
        expect(onChange).toHaveBeenLastCalledWith(12);
    });

    it('steps with the buttons and the arrow keys', async () => {
        const onChange = vi.fn();
        render(<NumberInput label="Quantity" defaultValue={2} step={2} onChange={onChange} />);
        await userEvent.click(screen.getByRole('button', { name: /increase/i }));
        expect(onChange).toHaveBeenLastCalledWith(4);
        await userEvent.click(screen.getByRole('textbox'));
        await userEvent.keyboard('{ArrowDown}');
        expect(onChange).toHaveBeenLastCalledWith(2);
    });

    it('shows its errors', () => {
        render(<NumberInput label="Quantity" errors={['Too many.']} />);
        expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Too many.');
    });

    it('has no steppers when read-only', () => {
        render(<NumberInput label="Quantity" value={2} isReadOnly />);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
