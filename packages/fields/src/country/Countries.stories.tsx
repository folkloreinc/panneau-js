import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CountryField } from './CountryField';

function CountriesField({
    initial,
    readOnly = false,
}: {
    initial: string[] | null;
    readOnly?: boolean;
}) {
    const [countries, setCountries] = useState(initial);
    return (
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '28rem' }}>
            <CountryField
                multiple
                label="Countries of production"
                description="In the order of the credits."
                preferred={['CA', 'FR', 'US']}
                value={countries}
                onChange={setCountries}
                readOnly={readOnly}
            />
            <output aria-label="Values" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                {JSON.stringify(countries)}
            </output>
        </div>
    );
}

const meta = {
    title: 'Fields/Countries',
    component: CountriesField,
    args: { initial: null },
} satisfies Meta<typeof CountriesField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Countries added with the combo box, which leaves out the chosen ones, and removed with their
 * buttons. The value keeps their order.
 */
export const Empty: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const input = canvas.getByRole('combobox', { name: 'Countries of production' });
        await userEvent.type(input, 'belg');
        await userEvent.click(await body.findByRole('option', { name: 'Belgium' }));
        await userEvent.keyboard('{Escape}');
        await userEvent.type(input, 'fra');
        await userEvent.click(await body.findByRole('option', { name: 'France' }));
        await userEvent.keyboard('{Escape}');
        await waitFor(() =>
            expect(canvas.getByRole('status', { name: 'Values' })).toHaveTextContent('["BE","FR"]'),
        );
        await userEvent.click(input);
        await expect(body.queryByRole('option', { name: 'France' })).not.toBeInTheDocument();
        await userEvent.keyboard('{Escape}');
        await userEvent.click(canvas.getByRole('button', { name: 'Remove Belgium' }));
        await waitFor(() =>
            expect(canvas.getByRole('status', { name: 'Values' })).toHaveTextContent('["FR"]'),
        );
    },
};

export const Filled: Story = {
    args: { initial: ['CA', 'FR', 'BE'] },
};

export const ReadOnly: Story = {
    args: { initial: ['CA', 'FR', 'BE'], readOnly: true },
};
