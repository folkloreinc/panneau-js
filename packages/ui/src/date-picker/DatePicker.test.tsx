import { CalendarDate, CalendarDateTime } from '@internationalized/date';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PanneauRoot } from '../root/PanneauRoot';
import { DatePicker } from './DatePicker';

describe('DatePicker', () => {
    it('shows the date in segments, in the order of the locale', () => {
        render(
            <PanneauRoot locale="fr-CA">
                <DatePicker label="Published on" value={new CalendarDate(2026, 10, 15)} />
            </PanneauRoot>,
        );
        const group = screen.getByRole('group', { name: 'Published on' });
        const segments = within(group).getAllByRole('spinbutton');
        expect(segments.map((segment) => segment.textContent)).toEqual(['2026', '10', '15']);
    });

    it('picks a date in the calendar', async () => {
        const onChange = vi.fn();
        render(
            <PanneauRoot locale="en-US">
                <DatePicker
                    label="Published on"
                    defaultValue={new CalendarDate(2026, 10, 15)}
                    onChange={onChange}
                />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: /Calendar/ }));
        const grid = await screen.findByRole('grid');
        await userEvent.click(within(grid).getByRole('button', { name: /October 20, 2026/ }));
        expect(onChange).toHaveBeenCalledWith(new CalendarDate(2026, 10, 20));
    });

    it('has hours and minutes with a minute granularity', () => {
        render(
            <PanneauRoot locale="fr-CA">
                <DatePicker
                    label="Published at"
                    granularity="minute"
                    hourCycle={24}
                    value={new CalendarDateTime(2026, 10, 15, 9, 30)}
                />
            </PanneauRoot>,
        );
        const segments = within(screen.getByRole('group', { name: 'Published at' }))
            .getAllByRole('spinbutton')
            .map((segment) => segment.textContent);
        expect(segments).toEqual(['2026', '10', '15', '9', '30']);
    });

    it('picks a day and a time in the calendar of a date and time', async () => {
        const onChange = vi.fn();
        render(
            <PanneauRoot locale="en-US">
                <DatePicker
                    label="Published at"
                    granularity="minute"
                    defaultValue={new CalendarDateTime(2026, 10, 15, 9, 30)}
                    onChange={onChange}
                />
            </PanneauRoot>,
        );
        await userEvent.click(screen.getByRole('button', { name: /Calendar/ }));
        const dialog = await screen.findByRole('dialog');
        await userEvent.click(within(dialog).getByRole('button', { name: /October 20, 2026/ }));
        expect(onChange).toHaveBeenLastCalledWith(new CalendarDateTime(2026, 10, 20, 9, 30));
        // The calendar stays open, for the time
        const time = within(dialog).getByRole('group', { name: 'Time' });
        const [hour] = within(time).getAllByRole('spinbutton');
        await userEvent.click(hour as HTMLElement);
        await userEvent.keyboard('11');
        expect(onChange).toHaveBeenLastCalledWith(new CalendarDateTime(2026, 10, 20, 11, 30));
    });

    it('shows its errors', () => {
        render(<DatePicker label="Published on" errors={['Too early.']} />);
        expect(screen.getByText('Too early.')).toBeInTheDocument();
    });
});
