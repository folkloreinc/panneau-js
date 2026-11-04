import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { DateRangeField } from './DateRangeField';
import type { DateRangeFieldValue } from './range';

function segments(name: string) {
    return within(screen.getByRole('group', { name }))
        .getAllByRole('spinbutton')
        .map((segment) => segment.textContent);
}

describe('DateRangeField', () => {
    it('edits a range of days', async () => {
        const onChange = vi.fn();
        renderField(
            <DateRangeField
                label="Dates"
                value={{ start: '2026-11-04', end: '2026-11-06' }}
                onChange={onChange}
            />,
        );
        expect(segments('Start')).toEqual(['11', '4', '2026']);
        expect(segments('End')).toEqual(['11', '6', '2026']);
        const day = within(screen.getByRole('group', { name: 'End' })).getAllByRole(
            'spinbutton',
        )[1] as HTMLElement;
        await userEvent.click(day);
        await userEvent.keyboard('{ArrowUp}');
        expect(onChange).toHaveBeenLastCalledWith({ start: '2026-11-04', end: '2026-11-07' });
    });

    it('shows date-times in the time zone of the field, and writes them in UTC', async () => {
        const onChange = vi.fn();
        renderField(
            <DateRangeField
                label="Dates"
                time
                timeZone="America/Toronto"
                hourCycle={24}
                value={{ start: '2026-11-05T00:30:00Z', end: '2026-11-05T02:00:00Z' }}
                onChange={onChange}
            />,
        );
        expect(segments('Start')).toEqual(['11', '4', '2026', '19', '30']);
        expect(segments('End')).toEqual(['11', '4', '2026', '21', '00']);
        const minute = within(screen.getByRole('group', { name: 'End' })).getAllByRole(
            'spinbutton',
        )[4] as HTMLElement;
        await userEvent.click(minute);
        await userEvent.keyboard('{ArrowUp}');
        expect(onChange).toHaveBeenLastCalledWith({
            start: '2026-11-05T00:30:00Z',
            end: '2026-11-05T02:01:00Z',
        });
    });

    it('keeps an empty bound as null, and gives null once both are empty', async () => {
        const onChange = vi.fn();
        renderField(
            <Controlled<DateRangeFieldValue | null> initial={null} onChange={onChange}>
                {(value, setValue) => (
                    <DateRangeField label="Dates" value={value} onChange={setValue} />
                )}
            </Controlled>,
        );
        const [month] = within(screen.getByRole('group', { name: 'Start' })).getAllByRole(
            'spinbutton',
        );
        await userEvent.click(month as HTMLElement);
        await userEvent.keyboard('11042026');
        expect(onChange).toHaveBeenLastCalledWith({ start: '2026-11-04', end: null });
    });

    it('turns a range into whole days with the All day switch', async () => {
        const onChange = vi.fn();
        renderField(
            <DefinitionField
                field={{
                    name: 'dates',
                    type: 'daterange',
                    label: 'Dates',
                    settings: { time: true, allDay: true, timeZone: 'America/Toronto' },
                }}
                path="dates"
                value={{ start: '2026-11-05T00:30:00Z', end: '2026-11-06T02:00:00Z' }}
                onChange={onChange}
            />,
        );
        await userEvent.click(screen.getByRole('switch', { name: 'All day' }));
        expect(onChange).toHaveBeenLastCalledWith({
            start: '2026-11-04',
            end: '2026-11-05',
            allDay: true,
        });
    });

    it('shows an all-day range as days, and turns it back into date-times', async () => {
        const onChange = vi.fn();
        renderField(
            <DateRangeField
                label="Dates"
                time
                allDay
                timeZone="America/Toronto"
                value={{ start: '2026-11-04', end: '2026-11-05', allDay: true }}
                onChange={onChange}
            />,
        );
        expect(segments('Start')).toEqual(['11', '4', '2026']);
        await userEvent.click(screen.getByRole('switch', { name: 'All day' }));
        expect(onChange).toHaveBeenLastCalledWith({
            start: '2026-11-04T14:00:00Z',
            end: '2026-11-05T22:00:00Z',
        });
    });

    it('keeps the time zone the user chooses, with the same wall-clock times', async () => {
        const onChange = vi.fn();
        renderField(
            <DateRangeField
                label="Dates"
                time
                chooseTimeZone
                timeZone="America/Toronto"
                value={{
                    start: '2026-11-05T00:30:00Z',
                    end: '2026-11-05T02:00:00Z',
                    timeZone: 'America/Toronto',
                }}
                onChange={onChange}
            />,
        );
        const zone = screen.getByRole('combobox', { name: 'Time zone' });
        expect(zone).toHaveValue('America / Toronto');
        await userEvent.clear(zone);
        await userEvent.type(zone, 'Paris');
        await userEvent.click(await screen.findByRole('option', { name: 'Europe / Paris' }));
        expect(onChange).toHaveBeenLastCalledWith({
            start: '2026-11-04T18:30:00Z',
            end: '2026-11-04T20:00:00Z',
            timeZone: 'Europe/Paris',
        });
        // Typing filters hundreds of zones: slow on a busy machine.
    }, 15_000);
});
