import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Field } from '@panneau/protocol';

import { Controlled, renderField } from '../__fixtures__/render';
import type { GeocodingSource } from '../location/types';
import { DefinitionField } from '../shared/DefinitionField';
import type { FieldBinding } from '../shared/context';
import { AddressField } from './AddressField';
import { cleanAddress, formatAddress } from './address';

function renderAddress(
    field: Partial<Field> = {},
    options: { initial?: unknown; geocoding?: GeocodingSource } = {},
) {
    const onChange = vi.fn();
    renderField(
        <Controlled<unknown> initial={options.initial ?? null} onChange={onChange}>
            {(value, setValue) => (
                <DefinitionField
                    field={{ name: 'address', type: 'address', label: 'Address', ...field }}
                    path="address"
                    value={value}
                    onChange={setValue}
                />
            )}
        </Controlled>,
        options.geocoding !== undefined ? { maps: { geocoding: options.geocoding } } : {},
    );
    return onChange;
}

/** The labels of the inputs, in the order of the document. */
function inputLabels(): string[] {
    return screen
        .getAllByRole('textbox')
        .concat(screen.queryAllByRole('combobox'))
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
        .map((input) =>
            (
                input.getAttribute('aria-label') ??
                (input as HTMLInputElement).labels?.[0]?.textContent ??
                ''
            ).replace(/\*$/, ''),
        );
}

describe('formatAddress', () => {
    it('writes an address on one line, in the order of its country', () => {
        expect(
            formatAddress(
                {
                    street: '1234 Rue Saint-Denis',
                    unit: 'App. 5',
                    city: 'Montréal',
                    region: 'QC',
                    postalCode: 'h2x1y4',
                    country: 'CA',
                },
                'fr',
            ),
        ).toBe('1234 Rue Saint-Denis, App. 5, Montréal, QC H2X 1Y4');
        expect(
            formatAddress(
                { street: '12 rue de Rivoli', city: 'Paris', postalCode: '75001', country: 'FR' },
                'fr',
            ),
        ).toBe('12 rue de Rivoli, 75001 Paris');
        expect(formatAddress({ city: 'Sydney', region: 'NSW', country: 'AU' }, 'en')).toBe(
            'Sydney, New South Wales',
        );
    });

    it('cleans an address: no empty parts, and its default country', () => {
        expect(cleanAddress({ street: '', city: ' ' }, 'CA')).toBeNull();
        expect(cleanAddress({ country: 'FR' }, 'CA')).toBeNull();
        expect(cleanAddress({ city: 'Laval', region: '' }, 'CA')).toEqual({
            city: 'Laval',
            country: 'CA',
        });
    });
});

describe('AddressField', () => {
    it('sets the country of a new address with its first part', async () => {
        const onChange = renderAddress({ settings: { country: 'CA' } });
        expect(screen.getByRole('group', { name: 'Address' })).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: 'Country' })).toHaveValue('Canada');
        await userEvent.type(screen.getByRole('textbox', { name: 'City' }), 'Laval');
        expect(onChange).toHaveBeenLastCalledWith({ city: 'Laval', country: 'CA' });
    });

    it('names and orders the parts by country', () => {
        renderAddress({}, { initial: { country: 'US' } });
        expect(inputLabels().slice(-3)).toEqual(['City', 'State', 'ZIP code']);
    });

    it('puts the postal code before the city in other countries', () => {
        renderAddress({}, { initial: { country: 'FR' } });
        expect(inputLabels().slice(-3)).toEqual(['Postal code', 'City', 'Region']);
    });

    it('normalizes the postal code for its country when it loses focus', async () => {
        const onChange = renderAddress({}, { initial: { country: 'CA' } });
        const input = screen.getByRole('textbox', { name: 'Postal code' });
        await userEvent.type(input, 'h2x1y4');
        await userEvent.tab();
        expect(onChange).toHaveBeenLastCalledWith({ country: 'CA', postalCode: 'H2X 1Y4' });
        expect(input).toHaveValue('H2X 1Y4');
    });

    it('drops the region of another country, and writes the postal code as in the new one', async () => {
        const onChange = renderAddress(
            {},
            { initial: { region: 'QC', postalCode: '123456789', country: 'CA' } },
        );
        const country = screen.getByRole('combobox', { name: 'Country' });
        await userEvent.clear(country);
        await userEvent.type(country, 'united sta');
        await userEvent.click(screen.getByRole('option', { name: 'United States' }));
        expect(onChange).toHaveBeenLastCalledWith({ postalCode: '12345-6789', country: 'US' });
    });

    it('hides the country when it allows only one', () => {
        renderAddress({ settings: { countries: ['CA'] } });
        expect(screen.queryByRole('combobox', { name: 'Country' })).toBeNull();
        expect(screen.getByRole('combobox', { name: 'Province' })).toBeInTheDocument();
    });

    it('marks the required parts once the address has one', () => {
        renderAddress(
            { settings: { required: ['city', 'postalCode'] } },
            { initial: { country: 'CA' } },
        );
        expect(screen.getByRole('textbox', { name: /City/ })).toBeRequired();
        expect(screen.getByRole('textbox', { name: /Postal code/ })).toBeRequired();
        expect(screen.getByRole('textbox', { name: /^Address/ })).not.toBeRequired();
    });

    it('fills every part with a place found, and leaves out the places without parts', async () => {
        const geocoding: GeocodingSource = {
            search: () =>
                Promise.resolve([
                    {
                        label: '1234 Rue Saint-Denis, Montréal',
                        lat: 45.5191,
                        lng: -73.5668,
                        address: {
                            street: '1234 Rue Saint-Denis',
                            city: 'Montréal',
                            region: 'QC',
                            postalCode: 'H2X 3J8',
                            country: 'CA',
                        },
                    },
                    { label: 'Saint-Denis', lat: 48.93, lng: 2.35 },
                ]),
        };
        const onChange = renderAddress({ settings: { point: true } }, { geocoding });
        await userEvent.type(
            screen.getByRole('combobox', { name: 'Search an address' }),
            'Saint-Denis',
        );
        const option = await screen.findByRole('option', {
            name: '1234 Rue Saint-Denis, Montréal',
        });
        expect(screen.getAllByRole('option')).toHaveLength(1);
        await userEvent.click(option);
        await waitFor(() =>
            expect(onChange).toHaveBeenLastCalledWith({
                street: '1234 Rue Saint-Denis',
                city: 'Montréal',
                region: 'QC',
                postalCode: 'H2X 3J8',
                country: 'CA',
                point: { lat: 45.5191, lng: -73.5668 },
            }),
        );
        expect(screen.getByRole('textbox', { name: /City/ })).toHaveValue('Montréal');
    });

    it('shows the errors of each part, from the binding of its path', () => {
        const Binding: FieldBinding = ({ path, render }) =>
            render({
                value: null,
                onChange: () => undefined,
                errors: path === 'address.postalCode' ? ['Not a postal code.'] : [],
            });
        renderField(
            <AddressField
                label="Address"
                path="address"
                value={{ postalCode: '12345', country: 'CA' }}
            />,
            { binding: Binding },
        );
        expect(screen.getByRole('textbox', { name: 'Postal code' })).toHaveAccessibleDescription(
            'Not a postal code.',
        );
        expect(screen.getByRole('textbox', { name: 'City' })).not.toHaveAccessibleDescription();
    });
});
