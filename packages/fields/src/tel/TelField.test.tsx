import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { TelField } from './TelField';
import { joinExtension, parsePhone, readExtension, readPhone, splitExtension } from './phone';

function renderTel(initial: string | null, country?: string, extension = false) {
    const onChange = vi.fn();
    renderField(
        <Controlled initial={initial} onChange={onChange}>
            {(value, setValue) => (
                <TelField
                    label="Phone"
                    value={value}
                    onChange={setValue}
                    extension={extension}
                    {...(country !== undefined ? { country } : {})}
                />
            )}
        </Controlled>,
    );
    return {
        onChange,
        input: screen.getByRole('textbox', { name: 'Phone' }),
        picker: () => screen.getByRole('button', { name: /Country of the number/ }),
        extension: () => screen.getByRole('textbox', { name: 'Extension' }),
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

    it('splits a value into its number and its extension, and joins them', () => {
        expect(splitExtension('+15145550199;ext=123')).toEqual({
            number: '+15145550199',
            extension: '123',
        });
        expect(splitExtension('+15145550199')).toEqual({
            number: '+15145550199',
            extension: null,
        });
        expect(splitExtension('514 555;ext=12')).toEqual({ number: '514 555', extension: '12' });
        expect(splitExtension(';ext=12')).toEqual({ number: null, extension: '12' });
        expect(splitExtension('+15145550199;ext=abc')).toEqual({
            number: '+15145550199;ext=abc',
            extension: null,
        });
        expect(splitExtension(null)).toEqual({ number: null, extension: null });
        expect(joinExtension('+15145550199', '123')).toBe('+15145550199;ext=123');
        expect(joinExtension('+15145550199', null)).toBe('+15145550199');
        expect(joinExtension('+15145550199', '')).toBe('+15145550199');
        expect(joinExtension(null, null)).toBeNull();
    });

    it('reads an extension typed after a number', () => {
        const typed = { number: '514 555-0199', extension: '123' };
        expect(readExtension('514 555-0199 ext. 123')).toEqual(typed);
        expect(readExtension('514 555-0199 x123')).toEqual(typed);
        expect(readExtension('514 555-0199, poste 123')).toEqual(typed);
        expect(readExtension('514 555-0199 Ext: 123')).toEqual(typed);
        expect(readExtension('514 555-0199;ext=123')).toEqual(typed);
        expect(readExtension('(514) 555-0199x123')).toEqual({
            number: '(514) 555-0199',
            extension: '123',
        });
        expect(readExtension('514 555-0199')).toBeNull();
        expect(readExtension('514 555-0199 x')).toBeNull();
        expect(readExtension('514 555-0199 x12345678901')).toBeNull();
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

    it('keeps a value as typed when it is read-only', async () => {
        const onChange = vi.fn();
        renderField(
            <TelField
                label="Phone"
                country="CA"
                value="514 555-0199"
                onChange={onChange}
                readOnly
            />,
        );
        const input = screen.getByRole('textbox', { name: 'Phone' });
        await userEvent.click(input);
        await userEvent.tab();
        expect(onChange).not.toHaveBeenCalled();
        expect(input).toHaveValue('514 555-0199');
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

    it('shows a value with an extension as it is, without the extension setting', () => {
        renderTel('+15145550199;ext=123', 'CA');
        expect(screen.getByRole('textbox', { name: 'Phone' })).toHaveValue('+15145550199;ext=123');
        expect(screen.queryByRole('textbox', { name: 'Extension' })).not.toBeInTheDocument();
    });

    it('shows the number and its extension in their inputs', () => {
        const { input, extension, picker } = renderTel('+15145550199;ext=123', 'FR', true);
        expect(input).toHaveValue('(514) 555-0199');
        expect(extension()).toHaveValue('123');
        expect(extension()).toHaveAttribute('inputmode', 'numeric');
        expect(extension()).toHaveAttribute('autocomplete', 'tel-extension');
        expect(picker()).toHaveTextContent('🇨🇦+1');
    });

    it('adds the extension typed in its input after the number, digits only', async () => {
        const { input, extension, onChange } = renderTel(null, 'CA', true);
        await userEvent.type(input, '5145550199');
        expect(onChange).toHaveBeenLastCalledWith('+15145550199');
        await userEvent.type(extension(), '1a2');
        expect(extension()).toHaveValue('12');
        expect(onChange).toHaveBeenLastCalledWith('+15145550199;ext=12');
        await userEvent.clear(extension());
        expect(onChange).toHaveBeenLastCalledWith('+15145550199');
    });

    it('keeps the extension when the number changes', async () => {
        const { input, onChange } = renderTel('+15145550199;ext=123', 'CA', true);
        await userEvent.clear(input);
        expect(onChange).toHaveBeenLastCalledWith(';ext=123');
        await userEvent.type(input, '438555');
        expect(onChange).toHaveBeenLastCalledWith('(438) 555;ext=123');
        await userEvent.type(input, '0100');
        expect(onChange).toHaveBeenLastCalledWith('+14385550100;ext=123');
    });

    it('moves an extension typed after the number to its input when the field is left', async () => {
        const { input, extension, onChange } = renderTel(null, 'CA', true);
        await userEvent.type(input, '5145550199 ext. 123');
        expect(input).toHaveValue('(514) 555-0199 ext. 123');
        await userEvent.tab();
        expect(onChange).toHaveBeenLastCalledWith('+15145550199;ext=123');
        expect(input).toHaveValue('(514) 555-0199');
        expect(extension()).toHaveValue('123');
    });

    it('moves the extension of a pasted number to its input when the field is left', async () => {
        const { input, extension, onChange } = renderTel(null, 'CA', true);
        await userEvent.click(input);
        await userEvent.paste('514 555-0199 x123');
        expect(input).toHaveValue('514 555-0199 x123');
        await userEvent.tab();
        expect(onChange).toHaveBeenLastCalledWith('+15145550199;ext=123');
        expect(extension()).toHaveValue('123');
    });

    it('moves the extension of a value as typed when the field is left', async () => {
        const { input, extension, onChange } = renderTel('514 555-0199 poste 45', 'CA', true);
        expect(input).toHaveValue('514 555-0199 poste 45');
        await userEvent.click(input);
        await userEvent.tab();
        expect(onChange).toHaveBeenCalledWith('+15145550199;ext=45');
        expect(extension()).toHaveValue('45');
    });

    it('keeps a number that is not complete as typed, with its extension', async () => {
        const { input, extension, onChange } = renderTel(null, 'CA', true);
        await userEvent.type(input, '514555 x12');
        await userEvent.tab();
        expect(onChange).toHaveBeenLastCalledWith('(514) 555;ext=12');
        expect(input).toHaveValue('(514) 555');
        expect(extension()).toHaveValue('12');
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

    it('renders from a definition, with an extension when its settings allow one', () => {
        renderField(
            <DefinitionField
                field={{
                    name: 'phone',
                    type: 'tel',
                    label: 'Phone',
                    settings: { country: 'CA', extension: true },
                }}
                path="phone"
                value="+15145550199;ext=123"
                onChange={() => undefined}
                readOnly
            />,
        );
        expect(screen.getByRole('textbox', { name: 'Phone' })).toHaveValue('(514) 555-0199');
        expect(screen.getByRole('textbox', { name: 'Extension' })).toHaveValue('123');
        expect(screen.getByRole('textbox', { name: 'Extension' })).toHaveAttribute('readonly');
    });
});
