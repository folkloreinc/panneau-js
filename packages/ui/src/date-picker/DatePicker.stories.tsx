import { CalendarDate, CalendarDateTime } from '@internationalized/date';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { DatePicker } from './DatePicker';

const meta = {
    title: 'UI/DatePicker',
    component: DatePicker,
    args: { label: 'Published on', defaultValue: new CalendarDate(2026, 10, 15) },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Date: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: /Calendar/ }));
        const grid = await body.findByRole('grid');
        await waitFor(() => expect(grid).toBeVisible());
        await userEvent.keyboard('{Escape}');
    },
};

/** With a time: the calendar has a field for it, and stays open after a day is picked. */
export const DateAndTime: Story = {
    args: {
        label: 'Published at',
        granularity: 'minute',
        defaultValue: new CalendarDateTime(2026, 10, 15, 9, 30),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: /Calendar/ }));
        const dialog = await body.findByRole('dialog');
        await userEvent.click(within(dialog).getByRole('button', { name: /October 20, 2026/ }));
        await expect(within(dialog).getByRole('group', { name: 'Time' })).toBeVisible();
        await userEvent.keyboard('{Escape}');
    },
};

export const WithErrors: Story = { args: { errors: ['This date is too early.'] } };
