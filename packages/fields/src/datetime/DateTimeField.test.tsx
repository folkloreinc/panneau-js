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
        // In short under the control, out of it: the control stays on one line
        const published = screen.getByRole('group', { name: 'Published at' });
        expect(within(published).queryByText(/UTC/)).toBeNull();
        const zone = screen.getByTitle('Eastern Time (UTC−4)');
        expect(zone).toHaveTextContent('UTC−4 · America/Toronto');
        expect(screen.getByTitle('Eastern Time (UTC−5)')).toHaveTextContent(
            'UTC−5 · America/Toronto',
        );
        // It describes the segments by its long name, not its short one
        const month = within(published).getAllByRole('spinbutton')[0] as HTMLElement;
        expect(month).toHaveAccessibleDescription(/Eastern Time \(UTC−4\)$/);
        expect(month).not.toHaveAccessibleDescription(/America\/Toronto/);
    });

    it('keeps the help text after the time zone', () => {
        renderField(
            <DateTimeField
                label="Published at"
                timeZone="America/Toronto"
                value="2026-10-15T13:30:00Z"
                description="When the article goes live."
            />,
        );
        const month = within(screen.getByRole('group', { name: 'Published at' })).getAllByRole(
            'spinbutton',
        )[0] as HTMLElement;
        expect(month).toHaveAccessibleDescription(/When the article goes live\./);
        expect(month).toHaveAccessibleDescription(/Eastern Time \(UTC−4\)/);
        const zone = screen.getByTitle('Eastern Time (UTC−4)');
        const help = screen.getByText('When the article goes live.');
        expect(zone.compareDocumentPosition(help) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('has no time zone for values without an offset', () => {
        renderField(<DateTimeField label="Starts at" value="2026-10-15T09:30:00" />);
        expect(screen.queryByText(/UTC/)).toBeNull();
    });
});
