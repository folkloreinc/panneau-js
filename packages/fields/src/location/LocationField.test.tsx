import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
    return renderField(
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
    afterEach(() => {
        vi.useRealTimers();
    });

    it('takes a point typed in latitude and longitude', async () => {
        const onChange = vi.fn();
        renderLocation(onChange);
        expect(await screen.findByRole('group', { name: 'Place' })).toBeInTheDocument();
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
        await userEvent.type(
            await screen.findByRole('combobox', { name: 'Search an address' }),
            'Montré',
        );
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

    it('has no address search without a source', async () => {
        renderLocation(vi.fn(), { initial: { lat: 1, lng: 2 } });
        expect(screen.queryByRole('combobox', { name: 'Search an address' })).toBeNull();
        expect(await screen.findByRole('textbox', { name: 'Longitude' })).toHaveValue('2');
    });

    it('lets the wheel scroll the page until the map is focused, or with ⌘ or Ctrl', async () => {
        renderLocation(vi.fn(), { initial: { lat: 1, lng: 2 } });
        const map = await screen.findByRole('application', { name: /Map: Place/ });
        const hint = screen.getByText(/To zoom, scroll while holding/);
        // Leaflet listens to the wheel on the map
        const leaflet = vi.fn();
        map.addEventListener('wheel', leaflet);
        const inside = map.firstElementChild ?? map;

        fireEvent.wheel(inside, { deltaY: 100 });
        expect(leaflet).not.toHaveBeenCalled();
        expect(hint.parentElement).toHaveAttribute('data-visible', 'true');

        fireEvent.wheel(inside, { deltaY: 100, ctrlKey: true });
        fireEvent.wheel(inside, { deltaY: 100, metaKey: true });
        expect(leaflet).toHaveBeenCalledTimes(2);

        map.focus();
        fireEvent.focus(map);
        expect(hint.parentElement).not.toHaveAttribute('data-visible');
        fireEvent.wheel(inside, { deltaY: 100 });
        expect(leaflet).toHaveBeenCalledTimes(3);

        fireEvent.blur(map);
        fireEvent.wheel(inside, { deltaY: 100 });
        expect(leaflet).toHaveBeenCalledTimes(3);
    });

    it('drops a zoom of the wheel still waiting when the map goes away', async () => {
        const { unmount } = renderLocation(vi.fn(), { initial: { lat: 1, lng: 2 } });
        const map = await screen.findByRole('application', { name: /Map: Place/ });
        vi.useFakeTimers();
        // Leaflet waits for the wheel to stop before it zooms
        fireEvent.wheel(map.firstElementChild ?? map, { deltaY: 100, ctrlKey: true });
        unmount();
        // That zoom would read the panes of the removed map, and throw
        expect(() => vi.runAllTimers()).not.toThrow();
    });
});
