import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { RegionField } from '../region/RegionField';
import { TelField } from '../tel/TelField';
import { CountryField } from './CountryField';

interface Address {
    country: string | null;
    province: string | null;
    phone: string | null;
}

function AddressFields({ initial, readOnly = false }: { initial: Address; readOnly?: boolean }) {
    const [address, setAddress] = useState(initial);
    const set = (key: keyof Address) => (value: string | null) =>
        setAddress((current) => ({ ...current, [key]: value }));
    return (
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '28rem' }}>
            <CountryField
                label="Country"
                preferred={['CA', 'US']}
                value={address.country}
                onChange={set('country')}
                readOnly={readOnly}
            />
            <RegionField
                label="Province or state"
                country={address.country}
                value={address.province}
                onChange={set('province')}
                readOnly={readOnly}
            />
            <TelField
                label="Phone"
                country="CA"
                value={address.phone}
                onChange={set('phone')}
                readOnly={readOnly}
            />
            <output aria-label="Values" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {JSON.stringify(address)}
            </output>
        </div>
    );
}

const meta = {
    title: 'Fields/Address',
    component: AddressFields,
    args: { initial: { country: null, province: null, phone: null } },
} satisfies Meta<typeof AddressFields>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A country picked by its name gives the regions of the province field, and a phone number typed
 * in its country's format gives E.164.
 */
export const Empty: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.type(canvas.getByRole('combobox', { name: 'Country' }), 'cana');
        await userEvent.click(await body.findByRole('option', { name: 'Canada' }));
        await userEvent.type(canvas.getByRole('combobox', { name: 'Province or state' }), 'queb');
        await userEvent.click(await body.findByRole('option', { name: 'Quebec' }));
        const phone = canvas.getByRole('textbox', { name: 'Phone' });
        await userEvent.type(phone, '5145550199');
        await expect(phone).toHaveValue('(514) 555-0199');
        await waitFor(() =>
            expect(canvas.getByRole('status', { name: 'Values' })).toHaveTextContent(
                '{"country":"CA","province":"QC","phone":"+15145550199"}',
            ),
        );
    },
};

/** A French number shows its flag and its calling code, and its own format. */
export const Filled: Story = {
    args: { initial: { country: 'US', province: 'NY', phone: '+33612345678' } },
};

/** A country whose regions Panneau doesn't know has a text for its region. */
export const UnknownRegions: Story = {
    args: { initial: { country: 'DE', province: 'Bayern', phone: null } },
};

/** A phone number kept as typed shows as it is, until the field is left. */
export const NumberAsTyped: Story = {
    args: { initial: { country: 'CA', province: 'ON', phone: '514 555-0199' } },
};

export const ReadOnly: Story = {
    args: {
        initial: { country: 'CA', province: 'QC', phone: '+15145550199' },
        readOnly: true,
    },
};
