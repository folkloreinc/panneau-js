import { CalendarDate, CalendarDateTime } from '@internationalized/date';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { PanneauRoot } from '../root/PanneauRoot';
import { DateRangePicker, type DateRangePickerValue } from './DateRangePicker';

function Controlled({ onChange }: { onChange: (value: DateRangePickerValue) => void }) {
    const [value, setValue] = useState<DateRangePickerValue | null>(null);
    return (
        <DateRangePicker
            label="Dates"
            value={value}
            onChange={(next) => {
                setValue(next);
                onChange(next);
            }}
        />
    );
}

describe('DateRangePicker', () => {
    it('shows both bounds in segments, in a group named by its label', () => {
        render(
            <PanneauRoot locale="fr-CA">
                <DateRangePicker
                    label="Dates"
                    value={{
                        start: new CalendarDate(2026, 11, 4),
                        end: new CalendarDate(2026, 11, 6),
                    }}
                />
            </PanneauRoot>,
        );
        const group = screen.getByRole('group', { name: 'Dates' });
        const start = within(group).getByRole('group', { name: 'Début' });
        const end = within(group).getByRole('group', { name: 'Fin' });
        const text = (bound: HTMLElement) =>
            within(bound)
                .getAllByRole('spinbutton')
                .map((segment) => segment.textContent);
        expect(text(start)).toEqual(['2026', '11', '04']);
        expect(text(end)).toEqual(['2026', '11', '06']);
    });

    it('picks both bounds in one calendar, and keeps their times', async () => {
        const onChange = vi.fn();
        render(
            <PanneauRoot locale="en-US">
                <DateRangePicker
                    label="Dates"
                    granularity="minute"
                    value={{ start: new CalendarDateTime(2026, 11, 4, 19, 30), end: null }}
                    placeholderValue={new CalendarDateTime(2026, 11, 1, 9, 0)}
                    onChange={onChange}
                />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Calendar' }));
        const grid = await screen.findByRole('grid');
        await userEvent.click(within(grid).getByRole('button', { name: /November 10, 2026/ }));
        await userEvent.click(within(grid).getByRole('button', { name: /November 12, 2026/ }));
        expect(onChange).toHaveBeenLastCalledWith({
            start: new CalendarDateTime(2026, 11, 10, 19, 30),
            end: new CalendarDateTime(2026, 11, 12, 9, 0),
        });
    });

    it('leaves a bound empty while the other is typed', async () => {
        const onChange = vi.fn();
        render(
            <PanneauRoot locale="en-US">
                <Controlled onChange={onChange} />
            </PanneauRoot>,
        );
        const start = screen.getByRole('group', { name: 'Start' });
        const [month] = within(start).getAllByRole('spinbutton');
        await userEvent.click(month as HTMLElement);
        await userEvent.keyboard('11042026');
        expect(onChange).toHaveBeenLastCalledWith({
            start: new CalendarDate(2026, 11, 4),
            end: null,
        });
    });

    it('shows its errors and content at its end, and no calendar when read-only', () => {
        const { rerender } = render(
            <DateRangePicker
                label="Dates"
                errors={['The end can’t be before the start.']}
                end={<span>All day</span>}
            />,
        );
        expect(screen.getByText('The end can’t be before the start.')).toBeInTheDocument();
        expect(screen.getByText('All day')).toBeInTheDocument();
        expect(
            within(screen.getByRole('group', { name: 'Start' })).getAllByRole('spinbutton')[0],
        ).toHaveAttribute('aria-invalid', 'true');
        rerender(<DateRangePicker label="Dates" isReadOnly />);
        expect(screen.queryByRole('button', { name: 'Calendar' })).not.toBeInTheDocument();
    });
});
