import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

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
