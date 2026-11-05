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
                canvas.getByRole('link', { name: 'Open the page in a new window' }),
            ).toHaveAttribute('href', 'https://example.com/fr/vacances/ete-a-montreal-3'),
        );
        await expect(canvas.getByText('example.com/fr/vacances/')).toBeVisible();
    },
};

/** Read-only, for a user who can't edit it: the address and the link to the page stay. */
export const ReadOnly: Story = {
    args: { value: 'ete-a-montreal-3', readOnly: true, onCheck: check, checkDelay: 0 },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            await canvas.findByRole('link', { name: 'Open the page in a new window' }),
        ).toHaveAttribute('target', '_blank');
        await expect(canvas.getByRole('textbox', { name: 'Slug' })).toHaveAttribute('readonly');
    },
};

/** Disabled: the field is greyed out, with its address. */
export const Disabled: Story = {
    args: { value: 'ete-a-montreal-3', disabled: true, onCheck: check, checkDelay: 0 },
};

/** The home page, whose slug doesn't apply: the backend's check makes the field read-only. */
export const Locked: Story = {
    args: {
        value: 'accueil',
        onCheck: () => Promise.resolve({ available: true, disabled: true }),
        checkDelay: 0,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByText('This address can’t be changed.')).toBeVisible();
        await expect(canvas.getByRole('textbox', { name: 'Slug' })).toHaveAttribute('readonly');
    },
};
