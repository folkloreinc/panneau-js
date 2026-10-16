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
});
