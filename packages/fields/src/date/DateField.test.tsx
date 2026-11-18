import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { DateField } from './DateField';

describe('DateField', () => {
    it('shows an ISO date, and gives one', async () => {
        const onChange = vi.fn();
        renderField(<DateField label="Published on" value="2026-10-15" onChange={onChange} />);
        const group = screen.getByRole('group', { name: 'Published on' });
        const segments = within(group).getAllByRole('spinbutton');
        expect(segments.map((segment) => segment.textContent)).toEqual(['10', '15', '2026']);
        await userEvent.click(segments[1] as HTMLElement);
        await userEvent.keyboard('{ArrowUp}');
        expect(onChange).toHaveBeenLastCalledWith('2026-10-16');
    });

    it('fills the date with a shortcut', async () => {
        const onChange = vi.fn();
        renderField(
            <DateField
                label="Ends on"
                value={null}
                onChange={onChange}
                shortcuts={[
                    { label: 'A year after the start', value: '2027-10-15' },
                    { label: 'Six months', value: null },
                ]}
            />,
        );
        const shortcuts = screen.getByRole('group', { name: 'Shortcuts' });
        await userEvent.click(
            within(shortcuts).getByRole('button', { name: 'A year after the start' }),
        );
        expect(onChange).toHaveBeenLastCalledWith('2027-10-15');
        expect(within(shortcuts).getByRole('button', { name: 'Six months' })).toBeDisabled();
    });

    it('disables its shortcuts with the field', () => {
        renderField(
            <DateField
                label="Ends on"
                value={null}
                disabled
                shortcuts={[{ label: 'Today', value: '2026-10-15' }]}
            />,
        );
        expect(screen.getByRole('button', { name: 'Today' })).toBeDisabled();
    });

    it('reads the date of a date-time, and ignores invalid values', () => {
        renderField(
            <>
                <DefinitionField
                    field={{ name: 'a', type: 'date', label: 'A' }}
                    path="a"
                    value="2026-01-02T10:00:00Z"
                    onChange={() => undefined}
                />
                <DefinitionField
                    field={{ name: 'b', type: 'date', label: 'B' }}
                    path="b"
                    value="not a date"
                    onChange={() => undefined}
                />
            </>,
        );
        expect(
            within(screen.getByRole('group', { name: 'A' }))
                .getAllByRole('spinbutton')
                .map((segment) => segment.textContent),
        ).toEqual(['1', '2', '2026']);
        expect(
            within(screen.getByRole('group', { name: 'B' }))
                .getAllByRole('spinbutton')
                .every((segment) => segment.getAttribute('aria-valuenow') === null),
        ).toBe(true);
    });
});
