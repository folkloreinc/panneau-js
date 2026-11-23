import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { SelectField } from './SelectField';

const OPTIONS = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
];

describe('SelectField', () => {
    it('picks one option', async () => {
        const onChange = vi.fn();
        renderField(
            <SelectField label="Status" options={OPTIONS} value={null} onChange={onChange} />,
        );
        await userEvent.click(screen.getByRole('button', { name: /Status/ }));
        await userEvent.click(await screen.findByRole('option', { name: 'Published' }));
        expect(onChange).toHaveBeenCalledWith('published');
    });

    it('shows radios with the radios widget', async () => {
        const onChange = vi.fn();
        renderField(
            <DefinitionField
                field={{
                    name: 'status',
                    type: 'select',
                    label: 'Status',
                    options: OPTIONS,
                    settings: { widget: 'radios' },
                }}
                path="status"
                value="draft"
                onChange={onChange}
            />,
        );
        expect(screen.getByRole('radio', { name: 'Draft' })).toBeChecked();
        await userEvent.click(screen.getByRole('radio', { name: 'Archived' }));
        expect(onChange).toHaveBeenCalledWith('archived');
    });

    it('selects several values in the order of the options, with checkboxes', async () => {
        const onChange = vi.fn();
        renderField(
            <DefinitionField
                field={{
                    name: 'statuses',
                    type: 'select',
                    label: 'Statuses',
                    multiple: true,
                    options: OPTIONS,
                    settings: { widget: 'checkboxes' },
                }}
                path="statuses"
                value={['archived']}
                onChange={onChange}
            />,
        );
        expect(screen.getByRole('group', { name: 'Statuses' })).toBeInTheDocument();
        await userEvent.click(screen.getByRole('checkbox', { name: 'Draft' }));
        expect(onChange).toHaveBeenLastCalledWith(['draft', 'archived']);
    });

    it('gives null when nothing is selected anymore', async () => {
        const onChange = vi.fn();
        renderField(
            <SelectField
                multiple
                widget="checkboxes"
                label="Statuses"
                options={OPTIONS}
                value={['draft']}
                onChange={onChange}
            />,
        );
        await userEvent.click(screen.getByRole('checkbox', { name: 'Draft' }));
        expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('selects several values in a dropdown', async () => {
        const onChange = vi.fn();
        renderField(
            <SelectField
                multiple
                label="Statuses"
                options={OPTIONS}
                value={['published']}
                onChange={onChange}
            />,
        );
        await userEvent.click(screen.getByRole('button', { name: /Statuses/ }));
        await userEvent.click(await screen.findByRole('option', { name: 'Draft' }));
        expect(onChange).toHaveBeenLastCalledWith(['draft', 'published']);
    });

    describe('with search', () => {
        const MANY = Array.from({ length: 12 }, (_, index) => ({
            value: index + 1,
            label:
                [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                ][index] ?? '',
        }));

        it('is a combo box with more than 10 options, with the same values', async () => {
            const onChange = vi.fn();
            renderField(
                <DefinitionField
                    field={{ name: 'month', type: 'select', label: 'Month', options: MANY }}
                    path="month"
                    value={null}
                    onChange={onChange}
                />,
            );
            const input = screen.getByRole('combobox', { name: 'Month' });
            expect(input).toHaveAttribute('placeholder', 'Select…');
            await userEvent.type(input, 'ju');
            expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
                'June',
                'July',
            ]);
            await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
            // A number stays a number
            expect(onChange).toHaveBeenLastCalledWith(7);
        });

        it('shows the label of the value, and clears it with its text', async () => {
            const onChange = vi.fn();
            renderField(
                <SelectField
                    label="Month"
                    options={MANY}
                    value={3}
                    onChange={onChange}
                    errors={['Pick a month.']}
                />,
            );
            const input = screen.getByRole('combobox', { name: 'Month' });
            expect(input).toHaveValue('March');
            expect(input.closest('[data-invalid]')).not.toBeNull();
            await userEvent.clear(input);
            expect(onChange).toHaveBeenLastCalledWith(null);
        });

        it('follows the search setting of the field', () => {
            renderField(
                <>
                    <DefinitionField
                        field={{
                            name: 'month',
                            type: 'select',
                            label: 'Month',
                            options: MANY,
                            settings: { search: false },
                        }}
                        path="month"
                        value={null}
                        onChange={() => undefined}
                    />
                    <DefinitionField
                        field={{
                            name: 'status',
                            type: 'select',
                            label: 'Status',
                            options: OPTIONS,
                            settings: { search: true },
                        }}
                        path="status"
                        value="draft"
                        onChange={() => undefined}
                    />
                </>,
            );
            expect(screen.getByRole('button', { name: /Month/ })).toBeInTheDocument();
            expect(screen.queryByRole('combobox', { name: 'Month' })).toBeNull();
            expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('Draft');
        });
    });
});
