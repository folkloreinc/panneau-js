import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { RegionField } from './RegionField';

function RegionStory({
    country,
    initial,
    readOnly = false,
}: {
    country: string | null;
    initial: string | null;
    readOnly?: boolean;
}) {
    const [region, setRegion] = useState(initial);
    return (
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '28rem' }}>
            <RegionField
                label="Province or state"
                country={country}
                value={region}
                onChange={setRegion}
                readOnly={readOnly}
            />
            <output aria-label="Value" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {JSON.stringify(region)}
            </output>
        </div>
    );
}

const meta = {
    title: 'Fields/Region',
    component: RegionStory,
    args: { country: 'CA', initial: null },
} satisfies Meta<typeof RegionStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The provinces and territories of Canada, with their flags: images that load with the first
 * region field of a country, and that the names next to them describe.
 */
export const Canada: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.type(canvas.getByRole('combobox', { name: 'Province or state' }), 'bruns');
        const option = await body.findByRole('option', { name: 'New Brunswick' });
        await waitFor(() => expect(option.querySelector('img')).toHaveAttribute('alt', ''));
        await userEvent.click(option);
        await waitFor(() =>
            expect(canvas.getByRole('status', { name: 'Value' })).toHaveTextContent('"NB"'),
        );
        await expect(canvasElement.querySelector('img')).toHaveAttribute('alt', '');
    },
};

/** The states of the United States, their district and their territories. */
export const UnitedStates: Story = {
    args: { country: 'US', initial: 'NY' },
};

export const ReadOnly: Story = {
    args: { country: 'CA', initial: 'QC', readOnly: true },
};

/** The regions of the other countries have no flags. */
export const WithoutFlags: Story = {
    args: { country: 'MX', initial: 'JAL' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('combobox', { name: 'Province or state' })).toHaveValue(
            'Jalisco',
        );
        await expect(canvasElement.querySelector('img')).toBeNull();
    },
};
