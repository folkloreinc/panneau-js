import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { MoneyField } from './MoneyField';
import { formatMoney, toMoneyValue } from './money';

describe('MoneyField', () => {
    it('reads and writes minor units, in the currency format of the locale', async () => {
        const onChange = vi.fn();
        renderField(
            <MoneyField
                label="Price"
                currency="CAD"
                value={{ amount: 1250, currency: 'CAD' }}
                onChange={onChange}
            />,
        );
        const input = screen.getByRole('textbox', { name: 'Price' });
        expect(input).toHaveValue('CA$12.50');
        await userEvent.clear(input);
        await userEvent.type(input, '19.99');
        await userEvent.tab();
        expect(onChange).toHaveBeenLastCalledWith({ amount: 1999, currency: 'CAD' });
        expect(screen.queryByRole('button', { name: /Currency/ })).not.toBeInTheDocument();
    });

    it('gives null when the amount is cleared', async () => {
        const onChange = vi.fn();
        renderField(
            <MoneyField
                label="Price"
                currency="CAD"
                value={{ amount: 1250, currency: 'CAD' }}
                onChange={onChange}
            />,
        );
        await userEvent.clear(screen.getByRole('textbox', { name: 'Price' }));
        await userEvent.tab();
        expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('uses the digits of the currency', async () => {
        const onChange = vi.fn();
        renderField(<MoneyField label="Price" currency="JPY" value={null} onChange={onChange} />);
        await userEvent.type(screen.getByRole('textbox', { name: 'Price' }), '1250');
        await userEvent.tab();
        expect(onChange).toHaveBeenLastCalledWith({ amount: 1250, currency: 'JPY' });
    });

    it('picks the currency among those of the field, and keeps the amount', async () => {
        const onChange = vi.fn();
        renderField(
            <DefinitionField
                field={{
                    name: 'price',
                    type: 'money',
                    label: 'Price',
                    settings: { currencies: ['CAD', 'EUR'] },
                }}
                path="price"
                value={{ amount: 1250, currency: 'CAD' }}
                onChange={onChange}
            />,
        );
        await userEvent.click(screen.getByRole('button', { name: /Currency/ }));
        const listbox = await screen.findByRole('listbox');
        expect(within(listbox).getAllByRole('option')).toHaveLength(2);
        await userEvent.click(within(listbox).getByRole('option', { name: /EUR/ }));
        expect(onChange).toHaveBeenLastCalledWith({ amount: 1250, currency: 'EUR' });
    });

    it('keeps an amount without a currency, which the money rule refuses', async () => {
        const onChange = vi.fn();
        renderField(<MoneyField label="Price" value={null} onChange={onChange} />);
        await userEvent.type(screen.getByRole('textbox', { name: 'Price' }), '5');
        await userEvent.tab();
        expect(onChange).toHaveBeenLastCalledWith({ amount: 500, currency: null });
    });

    it('formats amounts for lists', () => {
        expect(formatMoney({ amount: 125000, currency: 'CAD' }, 'fr-CA')).toMatch(
            /^1\s250,00\s\$$/,
        );
        expect(formatMoney({ amount: 1250, currency: 'JPY' }, 'en-US')).toBe('¥1,250');
        expect(formatMoney({ amount: 1250, currency: 'KWD' }, 'en-US')).toMatch(/^KWD\s1\.250$/);
        expect(formatMoney(1250, 'en-US')).toBeNull();
        expect(toMoneyValue(0.29, 'CAD')).toEqual({ amount: 29, currency: 'CAD' });
    });
});
