import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { PanneauProvider, definePlugin } from '@panneau/core';
import type { Field, LayoutNode } from '@panneau/protocol';

import { Form } from '../Form';
import { publicationPlugin } from './Publication';

const STATUS_FIELDS: Field[] = [
    { name: 'title', type: 'text', label: 'Title' },
    {
        name: 'status',
        type: 'select',
        label: 'Status',
        options: [
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published', tone: 'success' },
        ],
    },
    { name: 'published_at', type: 'datetime', label: 'Publication date' },
];

const FLAG_FIELDS: Field[] = [
    { name: 'title', type: 'text', label: 'Title' },
    { name: 'published', type: 'boolean', label: 'Published', settings: { widget: 'switch' } },
    { name: 'published_at', type: 'datetime', label: 'Publication date' },
];

const panelLayout = (names: string[]): LayoutNode[] => [
    { type: 'field', name: 'title' },
    {
        type: 'sidebar',
        panel: 'publication',
        label: 'Publication',
        children: names.map((name) => ({ type: 'field', name })),
    },
];

interface PanelStoryArgs {
    fields: Field[];
    layout: LayoutNode[];
    values: Record<string, unknown>;
    onSubmit: (values: Record<string, unknown>) => Promise<unknown>;
}

/**
 * The `publication` panel of a form's sidebar (decision 0075), from its plugin: the state of the
 * item, its fields, and Publish or Unpublish, which sets the publication and saves.
 */
const meta = {
    title: 'Forms/PublicationPanel',
    render: (args) => (
        <PanneauProvider plugins={[definePlugin(publicationPlugin)]}>
            <Form
                fields={args.fields}
                layout={args.layout}
                values={args.values}
                onSubmit={args.onSubmit}
            />
        </PanneauProvider>
    ),
    args: {
        fields: STATUS_FIELDS,
        layout: panelLayout(['status', 'published_at']),
        values: { title: 'Summer', status: 'draft', published_at: null },
        onSubmit: fn(async (values: Record<string, unknown>) => values),
    },
} satisfies Meta<PanelStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

const sidebarOf = (canvasElement: HTMLElement) =>
    within(within(canvasElement).getByRole('region', { name: 'Sidebar' }));

/** A draft: Publish sets the status, dates it now, and saves; the panel then offers Unpublish. */
export const PublishWithStatus: Story = {
    play: async ({ args, canvasElement }) => {
        const panel = sidebarOf(canvasElement);
        const badge = () =>
            within(canvasElement)
                .getByRole('region', { name: 'Sidebar' })
                .querySelector('.panneau-badge');
        await expect(badge()).toHaveTextContent('Draft');
        await userEvent.click(panel.getByRole('button', { name: 'Publish' }));
        await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(1));
        await expect(args.onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 'published',
                published_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/),
            }),
            expect.anything(),
        );
        await expect(await panel.findByRole('button', { name: 'Unpublish' })).toBeVisible();
        await expect(badge()).toHaveTextContent('Published');
    },
};

/** Published with a `published` field: Unpublish turns it off, keeps the date, and saves. */
export const UnpublishWithFlag: Story = {
    args: {
        fields: FLAG_FIELDS,
        layout: panelLayout(['published', 'published_at']),
        values: { title: 'Summer', published: true, published_at: '2026-01-02T10:00:00Z' },
    },
    play: async ({ args, canvasElement }) => {
        const panel = sidebarOf(canvasElement);
        await expect(panel.getByRole('switch', { name: 'Published' })).toBeChecked();
        await userEvent.click(panel.getByRole('button', { name: 'Unpublish' }));
        await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(1));
        await expect(args.onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({ published: false, published_at: '2026-01-02T10:00:00Z' }),
            expect.anything(),
        );
        await expect(panel.getByRole('switch', { name: 'Published' })).not.toBeChecked();
        await expect(panel.getByText('Not published')).toBeVisible();
        await expect(await panel.findByRole('button', { name: 'Publish' })).toBeVisible();
    },
};

/** Without a `published` field nor a published status, the panel shows the state only. */
export const WithoutButton: Story = {
    args: {
        fields: [{ name: 'title', type: 'text', label: 'Title' }],
        layout: [
            { type: 'field', name: 'title' },
            { type: 'sidebar', panel: 'publication' },
        ],
        values: { title: 'Summer' },
    },
    play: async ({ canvasElement }) => {
        const panel = sidebarOf(canvasElement);
        await expect(panel.getByText('Not published')).toBeVisible();
        await expect(panel.queryByRole('button', { name: 'Publish' })).toBeNull();
    },
};
