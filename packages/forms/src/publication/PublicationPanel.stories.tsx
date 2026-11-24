import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';
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
    /** The version of the saved item: an update, whose Save needs changes. */
    version?: string;
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
                {...(args.version !== undefined ? { version: args.version } : {})}
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

/**
 * A saved draft without other changes: Publish makes the change it saves. The badge says
 * "Published" once the item is saved so, not before.
 */
export const PublishSavedItem: Story = {
    args: {
        version: '1',
        onSubmit: fn(async (values: Record<string, unknown>) => ({
            id: '1',
            version: '2',
            ...values,
        })),
    },
    play: async ({ args, canvasElement }) => {
        const panel = sidebarOf(canvasElement);
        const badge = () =>
            within(canvasElement)
                .getByRole('region', { name: 'Sidebar' })
                .querySelector('.panneau-badge');
        await expect(badge()).toHaveTextContent('Draft');
        await userEvent.click(panel.getByRole('button', { name: 'Publish' }));
        await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(1));
        await expect(await panel.findByRole('button', { name: 'Unpublish' })).toBeVisible();
        await expect(badge()).toHaveTextContent('Published');
        await expect(panel.queryByText('Unsaved changes')).toBeNull();
    },
};

/**
 * The backend refuses the save (`422`): the status and the date go back to what they were, and
 * the title typed before stays.
 */
export const RefusedPublish: Story = {
    args: {
        version: '1',
        onSubmit: fn(async (_values: Record<string, unknown>): Promise<Record<string, unknown>> => {
            throw Object.assign(new Error('Invalid'), {
                problem: {
                    type: 'about:blank',
                    title: 'Invalid',
                    status: 422,
                    errors: { title: ['This title is already used.'] },
                },
            });
        }),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const panel = sidebarOf(canvasElement);
        const title = canvas.getByRole('textbox', { name: 'Title' });
        await userEvent.clear(title);
        await userEvent.type(title, 'Winter');
        await userEvent.click(panel.getByRole('button', { name: 'Publish' }));
        await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(1));
        await expect(await canvas.findByText('This title is already used.')).toBeVisible();
        await expect(panel.getByRole('button', { name: /Status/ })).toHaveTextContent('Draft');
        await expect(panel.getByRole('button', { name: 'Publish' })).toBeVisible();
        await expect(panel.queryByText('Unsaved changes')).toBeNull();
        await expect(title).toHaveValue('Winter');
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

/**
 * A narrow sidebar (`--panneau-aside-width: 18rem`): the date-time puts its time zone under the date and,
 * narrower, its time under its date; the start of the address of a slug gives up its room to the
 * slug, cut at its start. Nothing is cut at the edge of the panel.
 */
export const NarrowSidebar: Story = {
    args: {
        fields: [
            ...STATUS_FIELDS,
            {
                name: 'slug',
                type: 'slug',
                label: 'Slug',
                settings: { prefix: 'https://example.com/fr/magazine/vacances/' },
            },
        ],
        layout: panelLayout(['status', 'published_at', 'slug']),
        values: {
            title: 'Summer',
            status: 'draft',
            published_at: '2026-10-15T13:30:00Z',
            slug: 'un-ete-a-montreal',
        },
    },
    decorators: [
        (Story) => (
            // The form puts its sidebar beside it from 56rem
            <div style={{ width: '56rem', maxWidth: '100%', '--panneau-aside-width': '18rem' } as CSSProperties}>
                <Story />
            </div>
        ),
    ],
    play: async ({ canvasElement }) => {
        const sidebar = within(canvasElement).getByRole('region', { name: 'Sidebar' });
        const panel = within(sidebar);
        const edge = sidebar.getBoundingClientRect().right;
        const fits = (element: Element) =>
            expect(element.getBoundingClientRect().right).toBeLessThanOrEqual(edge + 0.5);

        // The date and the time are whole, inside the panel, with the zone under them
        const date = panel.getByRole('group', { name: 'Publication date' });
        await fits(date);
        await expect(date.scrollWidth).toBeLessThanOrEqual(date.clientWidth + 1);
        const segments = within(date).getAllByRole('spinbutton');
        for (const segment of segments) {
            await fits(segment);
        }

        // The slug keeps room to be read and typed: the prefix is cut, not the input
        const slug = panel.getByRole('textbox', { name: 'Slug' });
        await fits(slug);
        await expect(slug.scrollWidth).toBeLessThanOrEqual(slug.clientWidth + 1);
        await expect(slug).toHaveValue('un-ete-a-montreal');
    },
};
