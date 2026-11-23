import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { LocationValue } from '@panneau/protocol';

import { FieldsProvider } from '../shared/context';
import { LocationField } from './LocationField';
import type { GeocodingSource, MapTiles } from './types';

/** Plain tiles drawn locally, so that the stories need no network. */
const TILES: MapTiles = {
    url: `data:image/svg+xml,${encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#eef2ee"/><path d="M0 128H256M128 0V256" stroke="#d5ddd5" stroke-width="2"/></svg>',
    )}`,
    attribution: 'Story tiles',
};

const PLACES = [
    { label: 'Montréal, Québec, Canada', lat: 45.503182, lng: -73.569807 },
    { label: 'Mont-Royal, Montréal, Québec, Canada', lat: 45.50625, lng: -73.587 },
];

const geocoding: GeocodingSource = {
    search: (query) =>
        Promise.resolve(
            PLACES.filter((place) => place.label.toLowerCase().includes(query.toLowerCase())),
        ),
};

function Controlled({ initial }: { initial: LocationValue | null }) {
    const [value, setValue] = useState<LocationValue | null>(initial);
    return (
        <FieldsProvider maps={{ tiles: TILES, geocoding }}>
            <div style={{ maxWidth: '36rem' }}>
                <LocationField label="Place" value={value} onChange={setValue} />
            </div>
        </FieldsProvider>
    );
}

const meta = {
    title: 'Fields/Location',
    component: Controlled,
    args: { initial: null },
} satisfies Meta<typeof Controlled>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A place found by its address sets the point and the address. */
export const Empty: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.type(canvas.getByRole('combobox', { name: 'Search an address' }), 'Montr');
        await userEvent.click(await body.findByRole('option', { name: PLACES[0]?.label }));
        await waitFor(() =>
            expect(canvas.getByRole('textbox', { name: 'Address' })).toHaveValue(PLACES[0]?.label),
        );
        await waitFor(() => expect(body.queryByRole('listbox')).toBeNull());
    },
};

export const WithPoint: Story = {
    args: { initial: { lat: 45.503182, lng: -73.569807, address: 'Montréal, Québec, Canada' } },
};

/**
 * The wheel scrolls the page over the map, with a hint to hold ⌘ or Ctrl. Once clicked or focused,
 * the map zooms with the wheel.
 */
export const ScrollOverTheMap: Story = {
    args: WithPoint.args,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const map = canvas.getByRole('application', { name: /Map: Place/ });
        await waitFor(() => expect(map.querySelector('.leaflet-pane')).not.toBeNull());
        const pane = map.querySelector('.leaflet-pane') ?? map;
        const leaflet: WheelEvent[] = [];
        const listen = (event: WheelEvent) => leaflet.push(event);
        map.addEventListener('wheel', listen);
        const wheel = (init: WheelEventInit = {}) =>
            pane.dispatchEvent(
                new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true, ...init }),
            );

        wheel();
        await expect(leaflet).toHaveLength(0);
        const hint = canvas.getByText(/To zoom, scroll while holding/);
        await waitFor(() =>
            expect(Number(getComputedStyle(hint.parentElement ?? hint).opacity)).toBeGreaterThan(0),
        );

        wheel({ ctrlKey: true });
        await expect(leaflet).toHaveLength(1);

        await userEvent.click(map);
        await expect(map).toHaveFocus();
        wheel();
        await expect(leaflet).toHaveLength(2);
        map.removeEventListener('wheel', listen);
    },
};
