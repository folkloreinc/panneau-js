import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { TelField } from './TelField';
import { parsePhone, readPhone } from './phone';

function renderTel(initial: string | null, country?: string) {
    const onChange = vi.fn();
    renderField(
        <Controlled initial={initial} onChange={onChange}>
            {(value, setValue) => (
                <TelField
                    label="Phone"
                    value={value}
                    onChange={setValue}
                    {...(country !== undefined ? { country } : {})}
                />
            )}
        </Controlled>,
    );
    return {
        onChange,
        input: screen.getByRole('textbox', { name: 'Phone' }),
        picker: () => screen.getByRole('button', { name: /Country of the number/ }),
    };
}

describe('phone numbers', () => {
    it('reads E.164 values that are valid numbers', () => {
        expect(parsePhone('+15145550199')).toMatchObject({
            country: 'CA',
            national: '(514) 555-0199',
            international: '+1 514 555 0199',
        });
        expect(parsePhone('+1514555')).toBeNull();
        expect(parsePhone('514 555-0199')).toBeNull();
    });

    it('turns typed numbers into E.164 once complete, and keeps them as typed until then', () => {
        expect(readPhone('514 555-0199', 'CA')).toEqual({ value: '+15145550199', country: 'CA' });
        expect(readPhone('514 555', 'CA')).toEqual({ value: '514 555', country: null });
        expect(readPhone('+33 6 12 34 56 78', 'CA')).toEqual({
            value: '+33612345678',
            country: 'FR',
        });
        expect(readPhone(' ', 'CA')).toEqual({ value: null, country: null });
    });
});

describe('TelField', () => {
    it('is a phone input with the country of the number before it', () => {
        const { input, picker } = renderTel(null, 'CA');
        expect(input).toHaveAttribute('type', 'tel');
        expect(input).toHaveAttribute('inputmode', 'tel');
        expect(input).toHaveAttribute('autocomplete', 'tel');
        expect(picker()).toHaveTextContent('🇨🇦+1');
    });

    it('formats the number as it is typed, and gives E.164 once it is complete', async () => {
        const { input, onChange } = renderTel(null, 'CA');
        await userEvent.type(input, '514555');
        expect(input).toHaveValue('(514) 555');
        expect(onChange).toHaveBeenLastCalledWith('(514) 555');
        await userEvent.type(input, '0199');
        expect(input).toHaveValue('(514) 555-0199');
        expect(onChange).toHaveBeenLastCalledWith('+15145550199');
    });

    it('follows the country of a number typed with its calling code', async () => {
        const { input, onChange, picker } = renderTel(null, 'CA');
        await userEvent.type(input, '+33612345678');
        expect(onChange).toHaveBeenLastCalledWith('+33612345678');
        expect(picker()).toHaveTextContent('🇫🇷+33');
        await userEvent.tab();
        expect(input).toHaveValue('06 12 34 56 78');
    });

    it('shows an E.164 value in the format of its country, with its flag', () => {
        const { input, picker } = renderTel('+33612345678', 'CA');
        expect(input).toHaveValue('06 12 34 56 78');
        expect(picker()).toHaveTextContent('🇫🇷+33');
    });

    it('shows a value as typed, and turns it into E.164 when the field is left', async () => {
        const { input, onChange } = renderTel('514 555-0199', 'CA');
        expect(input).toHaveValue('514 555-0199');
        await userEvent.click(input);
        await userEvent.tab();
        expect(onChange).toHaveBeenCalledWith('+15145550199');
        expect(input).toHaveValue('(514) 555-0199');
    });

    it('reads the same digits in the country picked', async () => {
        const { input, onChange, picker } = renderTel(null, 'FR');
        await userEvent.type(input, '2025550123');
        expect(onChange).toHaveBeenLastCalledWith('2025550123');
        await userEvent.click(picker());
        const listbox = await screen.findByRole('listbox');
        await userEvent.click(within(listbox).getByRole('option', { name: /United States \+1/ }));
        expect(onChange).toHaveBeenLastCalledWith('+12025550123');
        expect(input).toHaveValue('(202) 555-0123');
    });

    it('takes the region of the locale without a country', () => {
        const { picker } = renderTel(null);
        expect(picker()).toHaveTextContent('🇺🇸+1');
    });

    it('renders from a definition, with the country of its settings', () => {
        renderField(
            <DefinitionField
                field={{ name: 'phone', type: 'tel', label: 'Phone', settings: { country: 'CA' } }}
                path="phone"
                value="+15145550199"
                onChange={() => undefined}
                readOnly
            />,
        );
        expect(screen.getByRole('textbox', { name: 'Phone' })).toHaveValue('(514) 555-0199');
        expect(screen.getByRole('button', { name: /Country of the number/ })).toBeDisabled();
    });
});
