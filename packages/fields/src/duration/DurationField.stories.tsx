import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { DurationField, type DurationFieldProps } from './DurationField';

const meta = {
    title: 'Fields/Duration',
    component: DurationField,
    args: { label: 'Duration' },
} satisfies Meta<typeof DurationField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The field and the value it stores, a whole number of its unit. */
function Stored({ initial, ...props }: DurationFieldProps & { initial: number | null }) {
    const [value, setValue] = useState<number | null>(initial);
    return (
        <div style={{ display: 'grid', gap: '1rem', maxWidth: '28rem' }}>
            <DurationField {...props} value={value} onChange={setValue} />
            <p>
                Stored value: <span data-testid="stored">{value ?? 'null'}</span> {props.unit}
            </p>
        </div>
    );
}

/** A running time kept in minutes, typed in hours and minutes. */
export const Minutes: Story = {
    args: { label: 'Running time', unit: 'minutes' },
    render: (args) => <Stored {...args} initial={null} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.queryByRole('textbox', { name: 'Seconds' })).toBeNull();
        await userEvent.type(canvas.getByRole('textbox', { name: 'Hours' }), '1');
        await userEvent.tab();
        await userEvent.type(canvas.getByRole('textbox', { name: 'Minutes' }), '45');
        await userEvent.tab();
        await expect(canvas.getByTestId('stored')).toHaveTextContent('105');
    },
};

/** A time window kept in hours, typed in days and hours: the hours stop at 23. */
export const DaysAndHours: Story = {
    args: {
        label: 'Time window',
        unit: 'hours',
        largestUnit: 'days',
        description: 'A day is 24 hours.',
    },
    render: (args) => <Stored {...args} initial={52} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const days = canvas.getByRole('textbox', { name: 'Days' });
        await expect(days).toHaveValue('2');
        await expect(canvas.getByRole('textbox', { name: 'Hours' })).toHaveValue('4');
        await userEvent.clear(days);
        await userEvent.type(days, '30');
        await userEvent.tab();
        await expect(canvas.getByTestId('stored')).toHaveTextContent('724');
    },
};

/** A half-life kept in hours, typed in hours only, without an upper bound. */
export const HoursOnly: Story = {
    args: { label: 'Half-life', unit: 'hours', largestUnit: 'hours' },
    render: (args) => <Stored {...args} initial={null} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.queryByRole('textbox', { name: 'Minutes' })).toBeNull();
        await userEvent.type(canvas.getByRole('textbox', { name: 'Hours' }), '72');
        await userEvent.tab();
        await expect(canvas.getByTestId('stored')).toHaveTextContent('72');
    },
};
