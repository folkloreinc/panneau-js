import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { JsonField, type JsonValue } from './JsonField';

const meta = {
    title: 'Fields/Json',
    component: JsonField,
    args: { label: 'Metadata' },
} satisfies Meta<typeof JsonField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<JsonValue | null>({
            source: 'import',
            tags: ['culture', 'montreal'],
            sponsored: false,
        });
        return (
            <div style={{ maxWidth: '28rem' }}>
                <JsonField
                    {...args}
                    value={value}
                    onChange={setValue}
                    description="An object or an array, indented on blur."
                />
            </div>
        );
    },
};

export const Invalid: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<JsonValue | null>('{ "source": "import", }');
        return (
            <div style={{ maxWidth: '28rem' }}>
                <JsonField {...args} value={value} onChange={setValue} />
            </div>
        );
    },
};
