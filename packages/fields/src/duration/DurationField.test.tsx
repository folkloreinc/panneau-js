import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { DurationField, formatDuration, splitDuration } from './DurationField';

describe('formatDuration', () => {
    it('shows the units that have a value', () => {
        expect(formatDuration(3930)).toBe('1 h 5 min 30 s');
        expect(formatDuration(180)).toBe('3 min');
        expect(formatDuration(0)).toBe('0 s');
        expect(formatDuration(3930, { precision: 'minutes' })).toBe('1 h 6 min');
        expect(splitDuration(3930)).toEqual({ hours: 1, minutes: 5, seconds: 30 });
    });
});

describe('DurationField', () => {
    it('edits a number of seconds in hours, minutes and seconds', async () => {
        const onChange = vi.fn();
        renderField(
            <Controlled<number | null> initial={null} onChange={onChange}>
                {(value, setValue) => (
                    <DurationField label="Duration" value={value} onChange={setValue} />
                )}
            </Controlled>,
        );
        expect(screen.getByRole('group', { name: 'Duration' })).toBeInTheDocument();
        await userEvent.type(screen.getByRole('textbox', { name: 'Hours' }), '1');
        await userEvent.tab();
        await userEvent.type(screen.getByRole('textbox', { name: 'Minutes' }), '5');
        await userEvent.tab();
        await userEvent.type(screen.getByRole('textbox', { name: 'Seconds' }), '30');
        await userEvent.tab();
        expect(onChange).toHaveBeenLastCalledWith(3930);
    });

    it('hides the seconds with a precision of minutes', () => {
        renderField(
            <DefinitionField
                field={{
                    name: 'duration',
                    type: 'duration',
                    label: 'Duration',
                    settings: { precision: 'minutes' },
                }}
                path="duration"
                value={5400}
                onChange={() => undefined}
            />,
        );
        expect(screen.getByRole('textbox', { name: 'Hours' })).toHaveValue('1');
        expect(screen.getByRole('textbox', { name: 'Minutes' })).toHaveValue('30');
        expect(screen.queryByRole('textbox', { name: 'Seconds' })).toBeNull();
    });
});
