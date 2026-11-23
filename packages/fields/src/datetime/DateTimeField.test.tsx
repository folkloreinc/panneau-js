import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderField } from '../__fixtures__/render';
import { DateTimeField } from './DateTimeField';

function segments(name: string) {
    return within(screen.getByRole('group', { name }))
        .getAllByRole('spinbutton')
        .map((segment) => segment.textContent);
}

describe('DateTimeField', () => {
    it('shows a UTC value in the time zone, and writes it back in UTC', async () => {
        const onChange = vi.fn();
        renderField(
            <DateTimeField
                label="Published at"
                timeZone="America/Toronto"
                hourCycle={24}
                value="2026-10-15T13:30:00Z"
                onChange={onChange}
            />,
        );
        expect(segments('Published at')).toEqual(['10', '15', '2026', '09', '30']);
        const minute = within(screen.getByRole('group', { name: 'Published at' })).getAllByRole(
            'spinbutton',
        )[4] as HTMLElement;
        await userEvent.click(minute);
        await userEvent.keyboard('{ArrowUp}');
        expect(onChange).toHaveBeenLastCalledWith('2026-10-15T13:31:00Z');
    });

    it('keeps values without an offset without one', async () => {
        const onChange = vi.fn();
        renderField(
            <DateTimeField
                label="Starts at"
                hourCycle={24}
                value="2026-10-15 09:30:00"
                onChange={onChange}
            />,
        );
        expect(segments('Starts at')).toEqual(['10', '15', '2026', '09', '30']);
        const minute = within(screen.getByRole('group', { name: 'Starts at' })).getAllByRole(
            'spinbutton',
        )[4] as HTMLElement;
        await userEvent.click(minute);
        await userEvent.keyboard('{ArrowUp}');
        expect(onChange).toHaveBeenLastCalledWith('2026-10-15T09:31:00');
    });

    it('names the time zone, with its offset at the date of the value', () => {
        renderField(
            <>
                <DateTimeField
                    label="Published at"
                    timeZone="America/Toronto"
                    value="2026-10-15T13:30:00Z"
                />
                <DateTimeField
                    label="Unpublished at"
                    timeZone="America/Toronto"
                    value="2026-11-15T13:30:00Z"
                />
            </>,
        );
        const published = screen.getByRole('group', { name: 'Published at' });
        expect(within(published).getByText('Eastern Time (UTC−4)')).toHaveAttribute(
            'title',
            'America/Toronto',
        );
        const unpublished = screen.getByRole('group', { name: 'Unpublished at' });
        expect(within(unpublished).getByText('Eastern Time (UTC−5)')).toBeInTheDocument();
        // The zone describes the segments, which are the date and the time only
        expect(segments('Published at')).not.toContain('EDT');
        const month = within(published).getAllByRole('spinbutton')[0] as HTMLElement;
        expect(month).toHaveAccessibleDescription(/Eastern Time \(UTC−4\)/);
    });

    it('has no time zone for values without an offset', () => {
        renderField(<DateTimeField label="Starts at" value="2026-10-15T09:30:00" />);
        expect(screen.queryByText(/UTC/)).toBeNull();
    });
});
