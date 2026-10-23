import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { TextField } from '../text/TextField';
import { type SlugCheck, SlugField } from './SlugField';

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

/** A backend where `ete-a-montreal` and `ete-a-montreal-2` are taken, under a parent page. */
const check: SlugCheck = (value) =>
    Promise.resolve(
        value === 'ete-a-montreal' || value === 'ete-a-montreal-2'
            ? {
                  available: false,
                  suggestion: 'ete-a-montreal-3',
                  prefix: 'https://example.com/fr/vacances/',
                  url: null,
              }
            : {
                  available: true,
                  suggestion: null,
                  prefix: 'https://example.com/fr/vacances/',
                  url: `https://example.com/fr/vacances/${value}`,
              },
    );

/** The backend checks the slug: its URL, or a free one to use when it is taken. */
export const Checked: Story = {
    render: function Render(args) {
        const [slug, setSlug] = useState<string | null>('ete-a-montreal');
        return (
            <div style={{ maxWidth: '28rem' }}>
                <SlugField
                    {...args}
                    value={slug}
                    onChange={setSlug}
                    onCheck={check}
                    checkDelay={50}
                />
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByText('This slug is already used.')).toBeVisible();
        await userEvent.click(canvas.getByRole('button', { name: 'Use ete-a-montreal-3' }));
        await waitFor(() =>
            expect(
                canvas.getByRole('link', {
                    name: 'https://example.com/fr/vacances/ete-a-montreal-3',
                }),
            ).toBeVisible(),
        );
    },
};
