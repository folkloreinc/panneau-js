import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { MoneyField, type MoneyFieldProps } from './MoneyField';
import type { MoneyFieldValue } from './money';

/** The field with its value in state, shown under it as JSON. */
function Controlled(props: MoneyFieldProps) {
    const [value, setValue] = useState<MoneyFieldValue | null>(props.value ?? null);
    return (
        <div style={{ maxWidth: '20rem' }}>
            <MoneyField
                {...props}
                value={value}
                onChange={setValue}
                description={JSON.stringify(value)}
            />
        </div>
    );
}

const meta = {
    title: 'Fields/Money',
    component: MoneyField,
    render: (args) => <Controlled {...args} />,
    args: { label: 'Price', currency: 'CAD', value: { amount: 1250, currency: 'CAD' } },
} satisfies Meta<typeof MoneyField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A fixed currency: the amount is typed in its format, and kept in cents. */
export const FixedCurrency: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole('textbox', { name: 'Price' });
        await userEvent.clear(input);
        await userEvent.type(input, '19.99');
        await userEvent.tab();
        await expect(canvas.getByText('{"amount":1999,"currency":"CAD"}')).toBeVisible();
    },
};

/** Currencies to pick from, in a menu after the amount. */
export const ChosenCurrency: Story = {
    args: { currency: null, currencies: ['CAD', 'USD', 'EUR'] },
};

/** A currency without cents. */
export const Yen: Story = {
    args: { currency: 'JPY', value: { amount: 1250, currency: 'JPY' } },
};

export const WithErrors: Story = {
    args: {
        value: { amount: 50, currency: 'CAD' },
        errors: ['This amount must be at least $1.00.'],
    },
};
