import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { DateRangeField, type DateRangeFieldProps } from './DateRangeField';
import type { DateRangeFieldValue } from './range';

/** The field with its value in state, shown under it as JSON. */
function Controlled(props: DateRangeFieldProps) {
    const [value, setValue] = useState<DateRangeFieldValue | null>(props.value ?? null);
    return (
        <div style={{ maxWidth: '36rem' }}>
            <DateRangeField
                {...props}
                value={value}
                onChange={setValue}
                description={JSON.stringify(value)}
            />
        </div>
    );
}

const meta = {
    title: 'Fields/DateRange',
    component: DateRangeField,
    render: (args) => <Controlled {...args} />,
    args: { label: 'Dates', value: { start: '2026-11-04', end: '2026-11-06' } },
} satisfies Meta<typeof DateRangeField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Days, both inclusive. */
export const Days: Story = {};

/** Date-times in the time zone of the place, with an "All day" switch. */
export const DateTimes: Story = {
    args: {
        label: 'Performance',
        time: true,
        allDay: true,
        timeZone: 'America/Toronto',
        value: { start: '2026-11-05T00:30:00Z', end: '2026-11-05T02:00:00Z' },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('switch', { name: 'All day' }));
        await expect(canvas.getByText(/"allDay":true/)).toBeVisible();
        await expect(
            within(canvas.getByRole('group', { name: 'Start' })).getAllByRole('spinbutton'),
        ).toHaveLength(3);
    },
};

/** The user picks the time zone, which the value keeps. */
export const ChooseTimeZone: Story = {
    args: {
        label: 'Draw period',
        time: true,
        chooseTimeZone: true,
        value: {
            start: '2026-11-05T00:30:00Z',
            end: '2026-11-30T04:59:00Z',
            timeZone: 'America/Toronto',
        },
    },
};

/** Open at its end: an exhibition with no end date yet. */
export const OpenEnd: Story = {
    args: { label: 'Exhibition', value: { start: '2026-11-04', end: null } },
};

export const WithErrors: Story = {
    args: {
        value: { start: '2026-11-06', end: '2026-11-04' },
        errors: ['The end can’t be before the start.'],
    },
};
