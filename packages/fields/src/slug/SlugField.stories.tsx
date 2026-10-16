import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { TextField } from '../text/TextField';
import { SlugField } from './SlugField';

const meta = {
    title: 'Fields/Slug',
    component: SlugField,
    args: { label: 'Slug', prefix: '/episodes/' },
} satisfies Meta<typeof SlugField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FollowsTitle: Story = {
    render: function Render(args) {
        const [title, setTitle] = useState<string | null>(null);
        const [slug, setSlug] = useState<string | null>(null);
        return (
            <div style={{ display: 'grid', gap: '1rem', maxWidth: '28rem' }}>
                <TextField label="Title" value={title} onChange={setTitle} />
                <SlugField
                    {...args}
                    source={title}
                    sourceLabel="Title"
                    value={slug}
                    onChange={setSlug}
                />
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(canvas.getByRole('textbox', { name: 'Title' }), 'Été à Montréal');
        await expect(canvas.getByRole('textbox', { name: 'Slug' })).toHaveValue('ete-a-montreal');
    },
};
