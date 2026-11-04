import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { CountryField } from './CountryField';
import {
    COUNTRY_CODES,
    getCountryChoices,
    getCountryFlag,
    getCountryName,
    getLocaleCountry,
} from './countries';

describe('countries', () => {
    it('has the ISO 3166-1 codes and Kosovo', () => {
        expect(COUNTRY_CODES).toHaveLength(250);
        expect(COUNTRY_CODES).toContain('CA');
        expect(COUNTRY_CODES).toContain('XK');
        expect(COUNTRY_CODES).not.toContain('EU');
    });

    it('names countries in a locale, with their flags', () => {
        expect(getCountryName('DE', 'fr')).toBe('Allemagne');
        expect(getCountryName('DE', 'en')).toBe('Germany');
        expect(getCountryFlag('CA')).toBe('🇨🇦');
        expect(getLocaleCountry('fr-CA')).toBe('CA');
        expect(getLocaleCountry('fr')).toBe('FR');
    });

    it('lists preferred countries first, then the others by name', () => {
        const choices = getCountryChoices('fr', {
            countries: ['DE', 'CA', 'US', 'AT'],
            preferred: ['US', 'CA', 'MX'],
        });
        expect(choices.preferred.map((country) => country.code)).toEqual(['US', 'CA']);
        expect(choices.others.map((country) => country.name)).toEqual(['Allemagne', 'Autriche']);
    });
});

describe('CountryField', () => {
    it('shows the name and the flag of its country', () => {
        renderField(<CountryField label="Country" value="CA" />);
        expect(screen.getByRole('combobox', { name: 'Country' })).toHaveValue('Canada');
        expect(screen.getAllByText('🇨🇦')[0]).toHaveAttribute('aria-hidden', 'true');
    });

    it('filters countries by the start of their names, without accents, and by code', async () => {
        const onChange = vi.fn();
        renderField(
            <Controlled initial={null as string | null} onChange={onChange}>
                {(value, setValue) => (
                    <CountryField label="Country" value={value} onChange={setValue} />
                )}
            </Controlled>,
        );
        const input = screen.getByRole('combobox', { name: 'Country' });
        await userEvent.type(input, 'zeal');
        expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
            '🇳🇿New Zealand',
        ]);
        await userEvent.clear(input);
        await userEvent.type(input, 'ch');
        expect(screen.getByRole('option', { name: 'Switzerland' })).toBeInTheDocument();
        await userEvent.click(screen.getByRole('option', { name: 'Chile' }));
        expect(onChange).toHaveBeenLastCalledWith('CL');
        expect(input).toHaveValue('Chile');
    });

    it('empties its value when its text is cleared', async () => {
        const onChange = vi.fn();
        renderField(<CountryField label="Country" value="CA" onChange={onChange} />);
        await userEvent.clear(screen.getByRole('combobox', { name: 'Country' }));
        expect(onChange).toHaveBeenCalledWith(null);
    });

    it('renders from a definition, with its countries and preferred ones', async () => {
        renderField(
            <DefinitionField
                field={{
                    name: 'country',
                    type: 'country',
                    label: 'Country',
                    settings: { countries: ['FR', 'CA', 'US'], preferred: ['US'] },
                }}
                path="country"
                value={null}
                onChange={() => undefined}
            />,
        );
        await userEvent.click(screen.getByRole('button', { name: /Show options/ }));
        expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
            '🇺🇸United States',
            '🇨🇦Canada',
            '🇫🇷France',
        ]);
    });
});

describe('CountryField with multiple', () => {
    it('shows its countries with their flags, each removable, in their order', async () => {
        const onChange = vi.fn();
        renderField(
            <CountryField multiple label="Countries" value={['FR', 'CA']} onChange={onChange} />,
        );
        const group = screen.getByRole('group', { name: 'Countries' });
        expect(
            within(group)
                .getAllByRole('listitem')
                .map((item) => item.textContent),
        ).toEqual(['🇫🇷France', '🇨🇦Canada']);
        await userEvent.click(screen.getByRole('button', { name: 'Remove France' }));
        expect(onChange).toHaveBeenLastCalledWith(['CA']);
    });

    it('adds a country with its combo box, which leaves out the chosen ones', async () => {
        const onChange = vi.fn();
        renderField(
            <Controlled initial={['CA'] as string[] | null} onChange={onChange}>
                {(value, setValue) => (
                    <CountryField
                        multiple
                        label="Countries"
                        countries={['CA', 'FR', 'US']}
                        value={value}
                        onChange={setValue}
                    />
                )}
            </Controlled>,
        );
        const input = screen.getByRole('combobox', { name: 'Countries' });
        expect(input).toHaveAttribute('placeholder', 'Add a country');
        await userEvent.click(screen.getByRole('button', { name: /Show options/ }));
        expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
            '🇫🇷France',
            '🇺🇸United States',
        ]);
        await userEvent.click(screen.getByRole('option', { name: 'United States' }));
        expect(onChange).toHaveBeenLastCalledWith(['CA', 'US']);
        expect(input).toHaveValue('');
        // The list stays open, to add another country
        await userEvent.keyboard('{Escape}');
        await userEvent.click(await screen.findByRole('button', { name: 'Remove Canada' }));
        await userEvent.click(screen.getByRole('button', { name: 'Remove United States' }));
        expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('shows a code it does not know as it is, and no remove button when read-only', () => {
        renderField(<CountryField multiple readOnly label="Countries" value={['CA', 'EU']} />);
        expect(screen.getByText('Canada')).toBeInTheDocument();
        expect(screen.getByText('EU')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Remove/ })).not.toBeInTheDocument();
    });

    it('renders from a definition with multiple', () => {
        renderField(
            <DefinitionField
                field={{ name: 'countries', type: 'country', label: 'Countries', multiple: true }}
                path="countries"
                value={['JP', 'KR']}
                onChange={() => undefined}
            />,
        );
        expect(screen.getByRole('button', { name: 'Remove Japan' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Remove South Korea' })).toBeInTheDocument();
    });
});
