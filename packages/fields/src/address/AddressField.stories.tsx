import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { AddressValue } from '@panneau/protocol';

import type { GeocodingSource, MapTiles } from '../location/types';
import { FieldsProvider } from '../shared/context';
import { AddressField } from './AddressField';

/** Plain tiles drawn locally, so that the stories need no network. */
const TILES: MapTiles = {
    url: `data:image/svg+xml,${encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#eef2ee"/></svg>',
    )}`,
    attribution: 'Story tiles',
};

const PLACE = {
    label: '1234 Rue Saint-Denis, Montréal, Québec, Canada',
    lat: 45.5191,
    lng: -73.5668,
    address: {
        street: '1234 Rue Saint-Denis',
        city: 'Montréal',
        region: 'QC',
        postalCode: 'H2X 3J8',
        country: 'CA',
    },
};

const geocoding: GeocodingSource = {
    search: (query) =>
        Promise.resolve(PLACE.label.toLowerCase().includes(query.toLowerCase()) ? [PLACE] : []),
};

function Controlled({
    initial,
    point = false,
    readOnly = false,
}: {
    initial: AddressValue | null;
    point?: boolean;
    readOnly?: boolean;
}) {
    const [value, setValue] = useState<AddressValue | null>(initial);
    return (
        <FieldsProvider maps={{ tiles: TILES, geocoding }}>
            <div style={{ display: 'grid', gap: '1rem', maxWidth: '40rem' }}>
                <AddressField
                    label="Venue"
                    country="CA"
                    preferred={['CA', 'US']}
                    point={point}
                    readOnly={readOnly}
                    value={value}
                    onChange={setValue}
                />
                <output aria-label="Value" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {JSON.stringify(value)}
                </output>
            </div>
        </FieldsProvider>
    );
}

const meta = {
    title: 'Fields/Postal address',
    component: Controlled,
    args: { initial: null },
} satisfies Meta<typeof Controlled>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Typed by hand: the country of the field is set, and the postal code normalized on blur. */
export const Empty: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.type(canvas.getByRole('textbox', { name: 'Address' }), '1 Rue Sherbrooke');
        await userEvent.type(canvas.getByRole('textbox', { name: /City/ }), 'Montréal');
        await userEvent.type(canvas.getByRole('combobox', { name: 'Province' }), 'queb');
        await userEvent.click(await body.findByRole('option', { name: 'Quebec' }));
        const postalCode = canvas.getByRole('textbox', { name: 'Postal code' });
        await userEvent.type(postalCode, 'h2x1y4');
        await userEvent.tab();
        await expect(postalCode).toHaveValue('H2X 1Y4');
        await waitFor(() =>
            expect(canvas.getByRole('status', { name: 'Value' })).toHaveTextContent(
                '{"country":"CA","street":"1 Rue Sherbrooke","city":"Montréal","region":"QC","postalCode":"H2X 1Y4"}',
            ),
        );
    },
};

/** A place found fills every part, and the point on the map. */
export const Search: Story = {
    args: { point: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.type(
            canvas.getByRole('combobox', { name: 'Search an address' }),
            'saint-denis',
        );
        await userEvent.click(await body.findByRole('option', { name: PLACE.label }));
        await waitFor(() =>
            expect(canvas.getByRole('textbox', { name: /City/ })).toHaveValue('Montréal'),
        );
        await expect(canvas.getByRole('combobox', { name: 'Province' })).toHaveValue('Quebec');
        await waitFor(() => expect(body.queryByRole('listbox')).toBeNull());
    },
};

/** An address in the United States: a state and a ZIP code. */
export const UnitedStates: Story = {
    args: {
        initial: {
            street: '350 Fifth Avenue',
            city: 'New York',
            region: 'NY',
            postalCode: '10118',
            country: 'US',
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('combobox', { name: /State/ })).toHaveValue('New York');
        await expect(canvas.getByRole('textbox', { name: /ZIP code/ })).toHaveValue('10118');
    },
};

/** In France, the postal code comes before the city, and the region is a text. */
export const France: Story = {
    args: {
        initial: { street: '12 rue de Rivoli', city: 'Paris', postalCode: '75004', country: 'FR' },
    },
};

export const ReadOnly: Story = {
    args: { ...UnitedStates.args, readOnly: true },
};
