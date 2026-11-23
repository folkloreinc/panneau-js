import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { DateTimeField } from '../datetime/DateTimeField';
import { TimeField } from '../time/TimeField';
import { DateField, DateFieldEntry } from './DateField';

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

/**
 * Date-times name the zone they are typed in, with its offset on that day: the same zone is
 * UTC−4 in October and UTC−5 in November.
 */
export const TimeZones: Story = {
    render: function Render() {
        const [october, setOctober] = useState<string | null>('2026-10-15T13:30:00Z');
        const [november, setNovember] = useState<string | null>('2026-11-15T13:30:00Z');
        return (
            <div style={{ display: 'grid', gap: '1rem', maxWidth: '28rem' }}>
                <DateTimeField
                    label="Opens at"
                    timeZone="America/Toronto"
                    value={october}
                    onChange={setOctober}
                />
                <DateTimeField
                    label="Closes at"
                    timeZone="America/Toronto"
                    value={november}
                    onChange={setNovember}
                />
                <DateTimeField label="Starts at (wall time)" value="2026-10-15T09:30:00" />
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const opens = canvas.getByRole('group', { name: 'Opens at' });
        await expect(within(opens).getByText('Eastern Time (UTC−4)')).toBeVisible();
        const closes = canvas.getByRole('group', { name: 'Closes at' });
        await expect(within(closes).getByText('Eastern Time (UTC−5)')).toBeVisible();
        // A value without an offset is in no zone
        const wall = canvas.getByRole('group', { name: 'Starts at (wall time)' });
        await expect(within(wall).queryByText(/UTC/)).toBeNull();
    },
};

/**
 * A definition turns the shortcuts on (`settings.shortcuts`): today, or a date worked out from
 * another field of the form, disabled while that field is empty.
 */
export const ShortcutsFromTheDefinition: Story = {
    render: function Render() {
        const [values, setValues] = useState<Record<string, unknown>>({
            starts_on: null,
            ends_on: null,
        });
        const set = (name: string) => (value: unknown) =>
            setValues((current) => ({ ...current, [name]: value }));
        return (
            <div style={{ display: 'grid', gap: '1rem', maxWidth: '24rem' }}>
                <DateFieldEntry
                    field={{
                        name: 'starts_on',
                        type: 'date',
                        label: 'Starts on',
                        settings: { shortcuts: ['today', 'tomorrow'] },
                    }}
                    path="starts_on"
                    value={values.starts_on}
                    parentValue={values}
                    onChange={set('starts_on')}
                />
                <DateFieldEntry
                    field={{
                        name: 'ends_on',
                        type: 'date',
                        label: 'Ends on',
                        help: typeof values.ends_on === 'string' ? values.ends_on : '–',
                        settings: {
                            shortcuts: [
                                { label: 'A year after the start', from: 'starts_on', years: 1 },
                            ],
                        },
                    }}
                    path="ends_on"
                    value={values.ends_on}
                    parentValue={values}
                    onChange={set('ends_on')}
                />
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const yearAfter = canvas.getByRole('button', { name: 'A year after the start' });
        await expect(yearAfter).toBeDisabled();
        await userEvent.click(canvas.getByRole('button', { name: 'Today' }));
        await expect(yearAfter).toBeEnabled();
        await userEvent.click(yearAfter);
        await expect(canvas.getByText(/^\d{4}-\d{2}-\d{2}$/)).toBeInTheDocument();
    },
};
