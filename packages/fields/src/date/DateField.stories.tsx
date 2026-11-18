import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { DateTimeField } from '../datetime/DateTimeField';
import { TimeField } from '../time/TimeField';
import { DateField } from './DateField';

const meta = {
    title: 'Fields/Dates',
    component: DateField,
    args: { label: 'Published on' },
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DateTimeAndTime: Story = {
    render: function Render(args) {
        const [date, setDate] = useState<string | null>('2026-10-15');
        const [dateTime, setDateTime] = useState<string | null>('2026-10-15T13:30:00Z');
        const [time, setTime] = useState<string | null>('09:30');
        return (
            <div style={{ display: 'grid', gap: '1rem', maxWidth: '24rem' }}>
                <DateField {...args} value={date} onChange={setDate} description={date ?? '–'} />
                <DateTimeField
                    label="Published at"
                    value={dateTime}
                    onChange={setDateTime}
                    description={dateTime ?? '–'}
                />
                <TimeField
                    label="Starts at"
                    value={time}
                    onChange={setTime}
                    description={time ?? '–'}
                />
            </div>
        );
    },
};

/** Buttons under the field fill it: the second one waits for the start. */
export const WithShortcuts: Story = {
    render: function Render() {
        const [start, setStart] = useState<string | null>(null);
        const [end, setEnd] = useState<string | null>(null);
        const yearAfter =
            start !== null ? `${String(Number(start.slice(0, 4)) + 1)}${start.slice(4)}` : null;
        return (
            <div style={{ display: 'grid', gap: '1rem', maxWidth: '24rem' }}>
                <DateField
                    label="Starts on"
                    value={start}
                    onChange={setStart}
                    shortcuts={[{ label: 'October 15, 2026', value: '2026-10-15' }]}
                />
                <DateField
                    label="Ends on"
                    value={end}
                    onChange={setEnd}
                    description={end ?? '–'}
                    shortcuts={[{ label: 'A year after the start', value: yearAfter }]}
                />
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const yearAfter = canvas.getByRole('button', { name: 'A year after the start' });
        await expect(yearAfter).toBeDisabled();
        await userEvent.click(canvas.getByRole('button', { name: 'October 15, 2026' }));
        await userEvent.click(yearAfter);
        await expect(canvas.getByText('2027-10-15')).toBeInTheDocument();
    },
};
