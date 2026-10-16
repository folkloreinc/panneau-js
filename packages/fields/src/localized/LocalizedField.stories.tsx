import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { TextField } from '../text/TextField';
import { LocalizedField, type LocalizedValue } from './LocalizedField';

const meta = {
    title: 'Fields/Localized',
    component: LocalizedField<string>,
    args: { label: 'Title', locales: ['fr', 'en'], children: () => null },
} satisfies Meta<typeof LocalizedField<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<LocalizedValue<string> | null>({ fr: 'Été' });
        return (
            <LocalizedField<string> {...args} value={value} onChange={setValue}>
                {(input) => (
                    <TextField label={input.label} value={input.value} onChange={input.onChange} />
                )}
            </LocalizedField>
        );
    },
};
