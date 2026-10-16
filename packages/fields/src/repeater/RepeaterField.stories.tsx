import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { builtInFields } from '../shared/builtIn';
import { FieldsProvider } from '../shared/context';
import { RepeaterField, type RepeaterItem } from './RepeaterField';

const meta = {
    title: 'Fields/Repeater',
    component: RepeaterField,
    args: {
        label: 'Links',
        name: 'links',
        fields: [
            { name: 'label', type: 'text', label: 'Label' },
            { name: 'url', type: 'url', label: 'URL' },
        ],
    },
    decorators: [
        (Story) => (
            <FieldsProvider components={builtInFields}>
                <Story />
            </FieldsProvider>
        ),
    ],
} satisfies Meta<typeof RepeaterField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Items: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<RepeaterItem[] | null>([
            { label: 'Site', url: 'https://example.com' },
        ]);
        return <RepeaterField {...args} value={value} onChange={setValue} />;
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Add' }));
        await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
        await userEvent.click(canvas.getByRole('button', { name: 'Move item 2 up' }));
        await expect(canvas.getAllByRole('textbox', { name: 'Label' })[1]).toHaveValue('Site');
    },
};

export const TypedBlocks: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<RepeaterItem[] | null>(null);
        return (
            <RepeaterField
                {...args}
                label="Blocks"
                fields={undefined}
                types={[
                    {
                        id: 'quote',
                        label: 'Quote',
                        fields: [{ name: 'text', type: 'textarea', label: 'Text' }],
                    },
                    {
                        id: 'video',
                        label: 'Video',
                        fields: [{ name: 'url', type: 'url', label: 'Video URL' }],
                    },
                ]}
                value={value}
                onChange={setValue}
            />
        );
    },
};
