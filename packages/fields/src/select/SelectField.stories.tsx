import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { type OptionValue, SelectField } from './SelectField';

const OPTIONS = [
    { value: 'square', label: 'Square', description: '1:1' },
    { value: 'portrait', label: 'Portrait', description: '4:5' },
    { value: 'story', label: 'Story', description: '9:16' },
];

const meta = {
    title: 'Fields/Select',
    component: SelectField,
    args: { label: 'Format', options: OPTIONS },
} satisfies Meta<typeof SelectField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dropdown: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<OptionValue | null>('portrait');
        return (
            <SelectField
                label={args.label}
                options={OPTIONS}
                multiple={false}
                value={value}
                onChange={setValue}
            />
        );
    },
};

export const Radios: Story = {
    render: function Render() {
        const [value, setValue] = useState<OptionValue | null>(null);
        return (
            <SelectField
                options={OPTIONS}
                widget="radios"
                multiple={false}
                value={value}
                onChange={setValue}
            />
        );
    },
};

export const Checkboxes: Story = {
    render: function Render() {
        const [value, setValue] = useState<OptionValue[] | null>(['square']);
        return (
            <SelectField
                options={OPTIONS}
                label="Formats"
                multiple
                widget="checkboxes"
                value={value}
                onChange={setValue}
            />
        );
    },
};

const LANGUAGES = [
    'Arabic',
    'Chinese',
    'English',
    'French',
    'German',
    'Hindi',
    'Italian',
    'Japanese',
    'Korean',
    'Portuguese',
    'Russian',
    'Spanish',
].map((label, index) => ({ value: index + 1, label }));

/**
 * More than 10 options: a combo box that filters them as the user types, with the same value as
 * the dropdown, and the same height and text when closed.
 */
export const Searchable: Story = {
    render: function Render() {
        const [value, setValue] = useState<OptionValue | null>(null);
        const [format, setFormat] = useState<OptionValue | null>(null);
        return (
            <div style={{ display: 'grid', gap: '1rem', maxWidth: '24rem' }}>
                <SelectField
                    label="Language"
                    options={LANGUAGES}
                    value={value}
                    onChange={setValue}
                    description={JSON.stringify(value)}
                />
                <SelectField label="Format" options={OPTIONS} value={format} onChange={setFormat} />
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const input = canvas.getByRole('combobox', { name: 'Language' });
        const dropdown = canvas.getByRole('button', { name: /Format/ });
        // Closed, it reads as the dropdown next to it
        await expect(input).toHaveAttribute('placeholder', 'Select…');
        const box = input.closest('[role="group"]') ?? input;
        await expect(
            Math.abs(box.getBoundingClientRect().height - dropdown.getBoundingClientRect().height),
        ).toBeLessThanOrEqual(1);

        await userEvent.type(input, 'ja');
        await expect(body.getAllByRole('option').map((option) => option.textContent)).toEqual([
            'Japanese',
        ]);
        await userEvent.keyboard('{ArrowDown}{Enter}');
        await expect(input).toHaveValue('Japanese');
        // The value of the option, a number
        await expect(canvas.getByText('8')).toBeInTheDocument();
    },
};
