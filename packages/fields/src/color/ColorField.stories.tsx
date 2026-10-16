import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { BooleanField } from '../boolean/BooleanField';
import { EmailField } from '../email/EmailField';
import { NumberField } from '../number/NumberField';
import { UrlField } from '../url/UrlField';
import { ColorField } from './ColorField';

const meta = {
    title: 'Fields/Other inputs',
    component: ColorField,
    args: { label: 'Accent color' },
} satisfies Meta<typeof ColorField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inputs: Story = {
    render: function Render(args) {
        const [color, setColor] = useState<string | null>('#1d4ed8');
        const [duration, setDuration] = useState<number | null>(42);
        const [url, setUrl] = useState<string | null>('example.com');
        const [email, setEmail] = useState<string | null>(null);
        const [flag, setFlag] = useState<boolean | null>(false);
        return (
            <div style={{ display: 'grid', gap: '1rem', maxWidth: '28rem' }}>
                <ColorField {...args} value={color} onChange={setColor} />
                <NumberField
                    label="Duration"
                    suffix="min"
                    value={duration}
                    onChange={setDuration}
                />
                <UrlField
                    label="Website"
                    value={url}
                    onChange={setUrl}
                    description="https:// is added on blur."
                />
                <EmailField label="Contact email" value={email} onChange={setEmail} />
                <BooleanField label="Members only" value={flag} onChange={setFlag} />
                <BooleanField label="Comments" widget="switch" value={flag} onChange={setFlag} />
            </div>
        );
    },
};
