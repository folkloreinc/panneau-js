import { CalendarDate, CalendarDateTime } from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { DateRangePicker, type DateRangePickerProps } from './DateRangePicker';

/** The picker with its value in state, as a form keeps it. */
function Controlled(props: DateRangePickerProps) {
    const [value, setValue] = useState(props.value ?? null);
    return <DateRangePicker {...props} value={value} onChange={setValue} />;
}

const meta = {
    title: 'UI/DateRangePicker',
    component: DateRangePicker,
    render: (args) => <Controlled {...args} />,
    args: {
        label: 'Dates',
        value: { start: new CalendarDate(2026, 11, 4), end: new CalendarDate(2026, 11, 6) },
    },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Days: the calendar picks the start, then the end. */
export const Days: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Calendar' }));
        const grid = await body.findByRole('grid');
        await waitFor(() => expect(grid).toBeVisible());
        await userEvent.click(within(grid).getByRole('button', { name: /November 10, 2026/ }));
        await userEvent.click(within(grid).getByRole('button', { name: /November 12, 2026/ }));
        const end = canvas.getByRole('group', { name: 'End' });
        await waitFor(() =>
            expect(within(end).getAllByRole('spinbutton')[1]).toHaveTextContent('12'),
        );
    },
};

/** Dates and times: each bound has its time. */
export const DatesAndTimes: Story = {
    args: {
        granularity: 'minute',
        value: {
            start: new CalendarDateTime(2026, 11, 4, 19, 30),
            end: new CalendarDateTime(2026, 11, 4, 21, 0),
        },
    },
};

/** Open at its end: the end can stay empty. */
export const OpenEnd: Story = {
    args: { value: { start: new CalendarDate(2026, 11, 4), end: null } },
};

export const WithErrors: Story = {
    args: {
        value: { start: new CalendarDate(2026, 11, 6), end: new CalendarDate(2026, 11, 4) },
        errors: ['The end can’t be before the start.'],
    },
};

export const ReadOnly: Story = { args: { isReadOnly: true } };
