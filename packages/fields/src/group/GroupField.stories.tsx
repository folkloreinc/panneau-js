import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { builtInFields } from '../shared/builtIn';
import { FieldsProvider } from '../shared/context';
import { GroupField, type GroupValue } from './GroupField';

const meta = {
    title: 'Fields/Group',
    component: GroupField,
    args: {
        label: 'Sharing',
        name: 'sharing',
        fields: [
            { name: 'title', type: 'text', label: 'Share title' },
            { name: 'description', type: 'textarea', label: 'Share description' },
        ],
    },
} satisfies Meta<typeof GroupField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<GroupValue | null>(null);
        return (
            <FieldsProvider components={builtInFields}>
                <GroupField {...args} value={value} onChange={setValue} />
            </FieldsProvider>
        );
    },
};
