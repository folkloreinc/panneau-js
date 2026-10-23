import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { TagsField } from './TagsField';

const SUGGESTIONS = [
    { value: 'culture', label: 'Culture' },
    { value: 'food', label: 'Food' },
    { value: 'music', label: 'Music' },
    { value: 'travel', label: 'Travel' },
];

const meta = {
    title: 'Fields/Tags',
    component: TagsField,
    args: { label: 'Tags' },
} satisfies Meta<typeof TagsField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Free: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<string[] | null>(['montreal', 'summer']);
        return (
            <div style={{ maxWidth: '28rem' }}>
                <TagsField
                    {...args}
                    value={value}
                    onChange={setValue}
                    suggestions={SUGGESTIONS}
                    description="Enter, a comma or Tab adds a tag."
                />
            </div>
        );
    },
};

export const SuggestionsOnly: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<string[] | null>(['food']);
        return (
            <div style={{ maxWidth: '28rem' }}>
                <TagsField
                    {...args}
                    label="Sections"
                    value={value}
                    onChange={setValue}
                    suggestions={SUGGESTIONS}
                    allowCustom={false}
                />
            </div>
        );
    },
};
