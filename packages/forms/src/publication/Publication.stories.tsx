import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { PanneauProvider, definePlugin } from '@panneau/core';
import type { Field, LayoutNode } from '@panneau/protocol';

import { Form } from '../Form';
import { publicationPlugin } from './Publication';

const FIELDS: Field[] = [
    { name: 'title', type: 'text', label: 'Title' },
    { name: 'published', type: 'boolean', label: 'Published', settings: { widget: 'switch' } },
    { name: 'published_at', type: 'datetime', label: 'Publication date' },
    {
        name: 'status',
        type: 'select',
        label: 'Status',
        options: [
            { value: 'draft', label: 'Draft' },
            { value: 'review', label: 'In review', tone: 'warning' },
            { value: 'ready', label: 'Ready', tone: 'success' },
        ],
    },
];

const LAYOUT: LayoutNode[] = [
    { type: 'field', name: 'title' },
    {
        type: 'sidebar',
        children: [
            {
                type: 'component',
                component: 'publication',
                children: [
                    { type: 'field', name: 'published' },
                    { type: 'field', name: 'published_at' },
                ],
            },
        ],
    },
];

interface PublicationStoryArgs {
    layout: LayoutNode[];
    values: Record<string, unknown>;
}

/** The `publication` component of a form layout, from its plugin (decision 0065). */
const meta = {
    title: 'Forms/Publication',
    render: (args) => (
        <PanneauProvider plugins={[definePlugin(publicationPlugin)]}>
            <Form fields={FIELDS} layout={args.layout} values={args.values} />
        </PanneauProvider>
    ),
} satisfies Meta<PublicationStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The badge says the saved state: turning the switch on is a change, said apart from the state,
 * until the form saves.
 */
export const Unpublished: Story = {
    args: { layout: LAYOUT, values: { title: 'Summer', published: false } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const heading = canvas.getByRole('heading', { name: /Publication/ });
        await expect(heading).toHaveTextContent('Not published');
        await expect(heading).not.toHaveTextContent('Unsaved changes');
        await userEvent.click(canvas.getByRole('switch', { name: 'Published' }));
        await expect(heading.textContent).toBe('PublicationNot publishedUnsaved changes');
        await userEvent.click(canvas.getByRole('switch', { name: 'Published' }));
        await expect(heading).not.toHaveTextContent('Unsaved changes');
    },
};

export const Published: Story = {
    args: {
        layout: LAYOUT,
        values: { title: 'Summer', published: true, published_at: '2026-06-21T09:00:00-04:00' },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { name: /Publication/ })).toHaveTextContent(
            'Published',
        );
        await expect(canvas.getByText(/Published on Jun 21, 2026/)).toBeVisible();
    },
};

export const Scheduled: Story = {
    args: {
        layout: LAYOUT,
        values: { title: 'Summer', published: true, published_at: '2999-06-21T09:00:00-04:00' },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('region', { name: /Publication/ })).toHaveTextContent(
            'Scheduled',
        );
    },
};

/** Scheduled in two seconds: the badge becomes Published when the date passes, without a reload. */
export const ScheduledDatePasses: Story = {
    args: { layout: LAYOUT, values: {} },
    render: function ScheduledSoon(args) {
        const [values] = useState(() => ({
            title: 'Summer',
            published: true,
            published_at: new Date(Date.now() + 2000).toISOString(),
        }));
        return (
            <PanneauProvider plugins={[definePlugin(publicationPlugin)]}>
                <Form fields={FIELDS} layout={args.layout} values={values} />
            </PanneauProvider>
        );
    },
    play: async ({ canvasElement }) => {
        const heading = within(canvasElement).getByRole('heading', { name: /Publication/ });
        await expect(heading).toHaveTextContent('Scheduled');
        await waitFor(() => expect(heading).toHaveTextContent('Published'), { timeout: 4000 });
        await expect(heading).not.toHaveTextContent('Unsaved changes');
    },
};

/** A status of the site gives the state its label and tone. */
export const WithStatus: Story = {
    args: {
        layout: [
            {
                type: 'component',
                component: 'publication',
                children: [
                    { type: 'field', name: 'status' },
                    { type: 'field', name: 'published_at' },
                ],
            },
        ],
        values: { status: 'review' },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { name: /Publication/ })).toHaveTextContent(
            'In review',
        );
    },
};
