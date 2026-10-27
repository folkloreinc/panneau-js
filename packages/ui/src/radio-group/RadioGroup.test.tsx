import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RadioGroup } from './RadioGroup';

const OPTIONS = [
    { value: 1, label: 'Small' },
    { value: 2, label: 'Large', description: 'Twice the size' },
    { value: 3, label: 'Huge', disabled: true },
];

describe('RadioGroup', () => {
    it('picks an option, keeping the type of its value', async () => {
        const onChange = vi.fn();
        render(<RadioGroup label="Size" options={OPTIONS} value={1} onChange={onChange} />);
        expect(screen.getByRole('radiogroup', { name: 'Size' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Small' })).toBeChecked();
        await userEvent.click(screen.getByRole('radio', { name: /Large/ }));
        expect(onChange).toHaveBeenCalledWith(2);
        expect(screen.getByRole('radio', { name: 'Huge' })).toBeDisabled();
    });

    it('shows its errors', () => {
        render(<RadioGroup label="Size" options={OPTIONS} errors={['Pick a size.']} />);
        expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByText('Pick a size.')).toBeInTheDocument();
    });

    it('shows its options as cards, with their media, in columns', async () => {
        const onChange = vi.fn();
        render(
            <RadioGroup
                label="Account"
                appearance="cards"
                columns={3}
                options={[
                    { value: 'ada', label: 'Ada', media: <span data-testid="ada">AL</span> },
                    { value: 'grace', label: 'Grace', description: '@grace' },
                ]}
                value="ada"
                onChange={onChange}
            />,
        );
        const group = screen.getByRole('radiogroup', { name: 'Account' });
        const options = group.querySelector<HTMLElement>(
            '[style*="--_panneau-radio-group-columns"]',
        );
        expect(options?.style.getPropertyValue('--_panneau-radio-group-columns')).toBe('3');
        const ada = screen.getByRole('radio', { name: /Ada/ });
        expect(ada).toBeChecked();
        expect(ada.closest('label')).toContainElement(screen.getByTestId('ada'));

        // Keyboard behaviour is the one of a radio group.
        ada.focus();
        await userEvent.keyboard('{ArrowDown}');
        expect(onChange).toHaveBeenCalledWith('grace');
    });
});
