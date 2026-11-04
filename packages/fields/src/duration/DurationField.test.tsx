import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import {
    DurationField,
    formatDuration,
    resolveDurationUnits,
    splitDuration,
} from './DurationField';

describe('formatDuration', () => {
    it('shows the units that have a value', () => {
        expect(formatDuration(3930)).toBe('1 h 5 min 30 s');
        expect(formatDuration(180)).toBe('3 min');
        expect(formatDuration(0)).toBe('0 s');
        expect(formatDuration(3930, { precision: 'minutes' })).toBe('1 h 6 min');
        expect(splitDuration(3930)).toEqual({ hours: 1, minutes: 5, seconds: 30 });
    });

    it('reads the value in its unit, and shows days', () => {
        expect(formatDuration(90, { unit: 'minutes' })).toBe('1 h 30 min');
        expect(formatDuration(52, { unit: 'hours', largestUnit: 'days' })).toBe('2 d 4 h');
        expect(formatDuration(52, { unit: 'hours' })).toBe('52 h');
        expect(formatDuration(30, { unit: 'days' })).toBe('30 d');
        expect(formatDuration(0, { unit: 'minutes' })).toBe('0 min');
        expect(formatDuration(100, { unit: 'minutes', precision: 'hours' })).toBe('2 h');
        expect(formatDuration(2 * 86_400 + 3600, { largestUnit: 'days', precision: 'hours' })).toBe(
            '2 d 1 h',
        );
        expect(
            formatDuration(52, { unit: 'hours', largestUnit: 'days', labels: { days: 'j' } }),
        ).toBe('2 j 4 h');
    });

    it('splits a value from its largest unit to its precision', () => {
        expect(splitDuration(90, { unit: 'minutes' })).toEqual({ hours: 1, minutes: 30 });
        expect(splitDuration(52, { unit: 'hours', largestUnit: 'days' })).toEqual({
            days: 2,
            hours: 4,
        });
        expect(splitDuration(3930, { largestUnit: 'minutes' })).toEqual({
            minutes: 65,
            seconds: 30,
        });
    });
});

describe('resolveDurationUnits', () => {
    it('defaults to seconds, shown in hours, minutes and seconds', () => {
        expect(resolveDurationUnits()).toEqual({
            unit: 'seconds',
            precision: 'seconds',
            largestUnit: 'hours',
        });
        expect(resolveDurationUnits({ precision: 'minutes' })).toEqual({
            unit: 'seconds',
            precision: 'minutes',
            largestUnit: 'hours',
        });
    });

    it('defaults the precision to the unit, and the largest unit to hours or the precision', () => {
        expect(resolveDurationUnits({ unit: 'minutes' })).toEqual({
            unit: 'minutes',
            precision: 'minutes',
            largestUnit: 'hours',
        });
        expect(resolveDurationUnits({ unit: 'days' })).toEqual({
            unit: 'days',
            precision: 'days',
            largestUnit: 'days',
        });
    });

    it('raises a precision finer than the unit, and a largest unit smaller than the precision', () => {
        expect(resolveDurationUnits({ unit: 'hours', precision: 'seconds' })).toEqual({
            unit: 'hours',
            precision: 'hours',
            largestUnit: 'hours',
        });
        expect(
            resolveDurationUnits({ unit: 'minutes', precision: 'hours', largestUnit: 'minutes' }),
        ).toEqual({ unit: 'minutes', precision: 'hours', largestUnit: 'hours' });
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

    it('keeps definitions without a unit as they were: seconds, hours unbounded', () => {
        const onChange = vi.fn();
        renderField(
            <DefinitionField
                field={{ name: 'duration', type: 'duration', label: 'Duration' }}
                path="duration"
                value={100 * 3600 + 30}
                onChange={onChange}
            />,
        );
        expect(screen.queryByRole('textbox', { name: 'Days' })).toBeNull();
        expect(screen.getByRole('textbox', { name: 'Hours' })).toHaveValue('100');
        expect(screen.getByRole('textbox', { name: 'Minutes' })).toHaveValue('0');
        expect(screen.getByRole('textbox', { name: 'Seconds' })).toHaveValue('30');
    });

    it('keeps the hidden seconds of a precision of minutes when a part changes', async () => {
        const onChange = vi.fn();
        renderField(
            <Controlled<number | null> initial={3930} onChange={onChange}>
                {(value, setValue) => (
                    <DurationField
                        label="Duration"
                        precision="minutes"
                        value={value}
                        onChange={setValue}
                    />
                )}
            </Controlled>,
        );
        const minutes = screen.getByRole('textbox', { name: 'Minutes' });
        await userEvent.clear(minutes);
        await userEvent.type(minutes, '10');
        await userEvent.tab();
        expect(onChange).toHaveBeenLastCalledWith(3600 + 600 + 30);
    });

    it('edits a number of minutes in hours and minutes', async () => {
        const onChange = vi.fn();
        renderField(
            <Controlled<number | null> initial={null} onChange={onChange}>
                {(value, setValue) => (
                    <DurationField
                        label="Running time"
                        unit="minutes"
                        value={value}
                        onChange={setValue}
                    />
                )}
            </Controlled>,
        );
        expect(screen.queryByRole('textbox', { name: 'Seconds' })).toBeNull();
        await userEvent.type(screen.getByRole('textbox', { name: 'Hours' }), '1');
        await userEvent.tab();
        await userEvent.type(screen.getByRole('textbox', { name: 'Minutes' }), '30');
        await userEvent.tab();
        expect(onChange).toHaveBeenLastCalledWith(90);
    });

    it('edits a number of hours in days and hours, with hours up to 23', async () => {
        const onChange = vi.fn();
        renderField(
            <DefinitionField
                field={{
                    name: 'window',
                    type: 'duration',
                    label: 'Window',
                    settings: { unit: 'hours', largestUnit: 'days' },
                }}
                path="window"
                value={52}
                onChange={onChange}
            />,
        );
        expect(screen.getByRole('textbox', { name: 'Days' })).toHaveValue('2');
        const hours = screen.getByRole('textbox', { name: 'Hours' });
        expect(hours).toHaveValue('4');
        expect(screen.queryByRole('textbox', { name: 'Minutes' })).toBeNull();
        await userEvent.clear(hours);
        await userEvent.type(hours, '30');
        await userEvent.tab();
        // Hours stop at 23 below days
        expect(onChange).toHaveBeenLastCalledWith(2 * 24 + 23);
    });

    it('edits a number of days in days only, without an upper bound', async () => {
        const onChange = vi.fn();
        renderField(
            <Controlled<number | null> initial={null} onChange={onChange}>
                {(value, setValue) => (
                    <DurationField label="Window" unit="days" value={value} onChange={setValue} />
                )}
            </Controlled>,
        );
        expect(screen.queryByRole('textbox', { name: 'Hours' })).toBeNull();
        await userEvent.type(screen.getByRole('textbox', { name: 'Days' }), '400');
        await userEvent.tab();
        expect(onChange).toHaveBeenLastCalledWith(400);
    });

    it('raises a precision finer than the unit to the unit', () => {
        renderField(
            <DurationField
                label="Half-life"
                unit="hours"
                precision="seconds"
                value={36}
                onChange={() => undefined}
            />,
        );
        expect(screen.getByRole('textbox', { name: 'Hours' })).toHaveValue('36');
        expect(screen.queryByRole('textbox', { name: 'Minutes' })).toBeNull();
    });
});
