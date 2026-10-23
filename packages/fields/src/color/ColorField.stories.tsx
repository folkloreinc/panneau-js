import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { BooleanField } from '../boolean/BooleanField';
import { DurationField } from '../duration/DurationField';
import { EmailField } from '../email/EmailField';
import { NumberField } from '../number/NumberField';
import { RangeField } from '../range/RangeField';
import { TelField } from '../tel/TelField';
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
        const [phone, setPhone] = useState<string | null>('+1 514 555-0123');
        const [rating, setRating] = useState<number | null>(null);
        const [opacity, setOpacity] = useState<number | null>(80);
        const [length, setLength] = useState<number | null>(3930);
        const [reading, setReading] = useState<number | null>(420);
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
                <TelField label="Phone" value={phone} onChange={setPhone} />
                <RangeField
                    label="Rating"
                    min={0}
                    max={10}
                    value={rating}
                    onChange={setRating}
                    description="Empty until the slider is moved."
                />
                <RangeField
                    label="Opacity"
                    step={5}
                    suffix="%"
                    value={opacity}
                    onChange={setOpacity}
                />
                <DurationField label="Length" value={length} onChange={setLength} />
                <DurationField
                    label="Reading time"
                    precision="minutes"
                    value={reading}
                    onChange={setReading}
                />
                <BooleanField label="Members only" value={flag} onChange={setFlag} />
                <BooleanField label="Comments" widget="switch" value={flag} onChange={setFlag} />
            </div>
        );
    },
};
