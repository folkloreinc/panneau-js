import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

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
