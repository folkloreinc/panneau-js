import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import type { GeocodingSource } from './types';

const geocoding: GeocodingSource = {
    search: (query) =>
        Promise.resolve(
            query.toLowerCase().includes('mont')
                ? [{ label: 'Montréal, Québec, Canada', lat: 45.5031824, lng: -73.5698065 }]
                : [],
        ),
};

function renderLocation(
    onChange: (value: unknown) => void,
    options: { initial?: unknown; geocoding?: GeocodingSource } = {},
) {
    renderField(
        <Controlled<unknown> initial={options.initial ?? null} onChange={onChange}>
            {(value, setValue) => (
                <DefinitionField
                    field={{ name: 'place', type: 'location', label: 'Place' }}
                    path="place"
                    value={value}
                    onChange={setValue}
                />
            )}
        </Controlled>,
        options.geocoding !== undefined ? { maps: { geocoding: options.geocoding } } : {},
    );
}

describe('LocationField', () => {
    it('takes a point typed in latitude and longitude', async () => {
        const onChange = vi.fn();
        renderLocation(onChange);
        expect(screen.getByRole('group', { name: 'Place' })).toBeInTheDocument();
        expect(screen.getByRole('application', { name: /Map: Place/ })).toBeInTheDocument();
        await userEvent.type(screen.getByRole('textbox', { name: 'Latitude' }), '45.5');
        await userEvent.tab();
        expect(onChange).not.toHaveBeenCalled();
        await userEvent.type(screen.getByRole('textbox', { name: 'Longitude' }), '-73.56');
        await userEvent.tab();
        expect(onChange).toHaveBeenLastCalledWith({ lat: 45.5, lng: -73.56 });

        await userEvent.type(screen.getByRole('textbox', { name: 'Address' }), 'Montréal');
        expect(onChange).toHaveBeenLastCalledWith({ lat: 45.5, lng: -73.56, address: 'Montréal' });
        await userEvent.click(screen.getByRole('button', { name: 'Remove the point' }));
        expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('sets the point and the address of a place found', async () => {
        const onChange = vi.fn();
        renderLocation(onChange, { geocoding });
        await userEvent.type(screen.getByRole('combobox', { name: 'Search an address' }), 'Montré');
        await userEvent.click(
            await screen.findByRole('option', { name: 'Montréal, Québec, Canada' }),
        );
        await waitFor(() =>
            expect(onChange).toHaveBeenLastCalledWith({
                lat: 45.503182,
                lng: -73.569806,
                address: 'Montréal, Québec, Canada',
            }),
        );
        // Focus moves to the address, which closes the results
        await waitFor(() => expect(screen.getByRole('textbox', { name: 'Address' })).toHaveFocus());
        expect(screen.queryByRole('listbox')).toBeNull();
        expect(screen.getByRole('textbox', { name: 'Latitude' })).toHaveValue('45.503182');
    });

    it('has no address search without a source', () => {
        renderLocation(vi.fn(), { initial: { lat: 1, lng: 2 } });
        expect(screen.queryByRole('combobox', { name: 'Search an address' })).toBeNull();
        expect(screen.getByRole('textbox', { name: 'Longitude' })).toHaveValue('2');
    });
});
