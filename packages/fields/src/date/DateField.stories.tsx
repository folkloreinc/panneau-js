import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { DateTimeField } from '../datetime/DateTimeField';
import { TextField } from '../text/TextField';
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

/** The control of a date-time, as high as a text input's: its zone is under it, not in it. */
async function expectOneLine(canvasElement: HTMLElement, name: string) {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('group', { name });
    const text = canvas.getByRole('textbox', { name: 'Title' });
    await expect(
        Math.abs(control.getBoundingClientRect().height - text.getBoundingClientRect().height),
    ).toBeLessThanOrEqual(0.5);
    const segments = within(control).getAllByRole('spinbutton');
    const top = segments[0]?.getBoundingClientRect().top ?? 0;
    for (const segment of segments) {
        await expect(Math.abs(segment.getBoundingClientRect().top - top)).toBeLessThanOrEqual(1);
    }
    await expect(within(control).queryByText(/UTC/)).toBeNull();
}

/**
 * Date-times name the zone they are typed in, under their control, with its offset on that day:
 * the same zone is UTC−4 in October and UTC−5 in November. Its name in the locale is its tooltip,
 * and what screen readers read.
 */
export const TimeZones: Story = {
    render: function Render() {
        const [october, setOctober] = useState<string | null>('2026-10-15T13:30:00Z');
        const [november, setNovember] = useState<string | null>('2026-11-15T13:30:00Z');
        return (
            <div style={{ display: 'grid', gap: '1rem', maxWidth: '28rem' }}>
                <TextField label="Title" value="Opening night" />
                <DateTimeField
                    label="Opens at"
                    timeZone="America/Toronto"
                    value={october}
                    onChange={setOctober}
                    description="When the doors open."
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
        await expectOneLine(canvasElement, 'Opens at');
        await expectOneLine(canvasElement, 'Closes at');
        const october = canvas.getByTitle('Eastern Time (UTC−4)');
        await expect(october).toBeVisible();
        await expect(canvas.getByText('UTC−4 · America/Toronto')).toBeVisible();
        await expect(canvas.getByText('UTC−5 · America/Toronto')).toBeVisible();
        // Under the control, where help text is, and before it
        const opens = canvas.getByRole('group', { name: 'Opens at' });
        await expect(october.getBoundingClientRect().top).toBeGreaterThanOrEqual(
            opens.getBoundingClientRect().bottom,
        );
        await expect(
            canvas.getByText('When the doors open.').getBoundingClientRect().top,
        ).toBeGreaterThan(october.getBoundingClientRect().top);
        const [month] = within(opens).getAllByRole('spinbutton');
        await expect(month).toHaveAccessibleDescription(/Eastern Time \(UTC−4\)/);
        // A value without an offset is in no zone: two zones for three date-times
        await expect(canvas.getAllByText(/^UTC−\d · America\/Toronto$/)).toHaveLength(2);
    },
};

/**
 * In French, in a column as narrow as a form's sidebar: the long name of the zone ("heure de l'Est
 * nord-américain") never makes the control taller, and the date and the time stay whole.
 */
export const TimeZoneInFrench: Story = {
    globals: { locale: 'fr' },
    render: function Render() {
        const [value, setValue] = useState<string | null>('2026-10-15T13:30:00Z');
        return (
            <div style={{ display: 'grid', gap: '1rem', width: '16rem' }}>
                <TextField label="Title" value="Soirée d’ouverture" />
                <DateTimeField
                    label="Opens at"
                    timeZone="America/Toronto"
                    value={value}
                    onChange={setValue}
                />
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expectOneLine(canvasElement, 'Opens at');
        const zone = canvas.getByText('UTC−4 · America/Toronto');
        await expect(zone).toBeVisible();
        await expect(zone.parentElement).toHaveAttribute(
            'title',
            expect.stringMatching(/^heure de l’Est.*\(UTC−4\)$/),
        );
        const control = canvas.getByRole('group', { name: 'Opens at' });
        await expect(control.scrollWidth).toBeLessThanOrEqual(control.clientWidth + 1);
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
