import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { PanneauProvider, definePlugin } from '@panneau/core';
import type { Field, LayoutNode } from '@panneau/protocol';

import { Form, type FormProps } from '../Form';
import { publicationPlugin } from '../publication/Publication';

const FIELDS: Field[] = [
    { name: 'title', type: 'text', label: 'Title', rules: [{ rule: 'required' }] },
    { name: 'summary', type: 'textarea', label: 'Summary' },
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
    { name: 'notes', type: 'textarea', label: 'Notes' },
];

/** The sidebar of a page, as WordPress has it: Save, the errors, the publication, notes. */
const LAYOUT: LayoutNode[] = [
    { type: 'field', name: 'title' },
    { type: 'field', name: 'summary' },
    { type: 'sidebar', panel: 'save' },
    { type: 'sidebar', panel: 'errors' },
    {
        type: 'sidebar',
        panel: 'publication',
        label: 'Publication',
        children: [
            { type: 'field', name: 'status' },
            { type: 'field', name: 'published_at' },
        ],
    },
    { type: 'sidebar', label: 'Notes', children: [{ type: 'field', name: 'notes' }] },
];

interface PanelsExampleProps extends FormProps {
    /** The width of the page around the form. */
    width: string;
}

function PanelsExample({ width, ...props }: PanelsExampleProps) {
    return (
        <PanneauProvider plugins={[definePlugin(publicationPlugin)]}>
            <div style={{ maxWidth: width, marginInline: 'auto' }}>
                <Form {...props} />
            </div>
        </PanneauProvider>
    );
}

const meta = {
    title: 'Forms/Sidebar panels',
    component: PanelsExample,
    args: {
        width: '80rem',
        fields: FIELDS,
        layout: LAYOUT,
        values: { title: 'About us', status: 'draft', published_at: null },
        onSubmit: fn(async (values: Record<string, unknown>) => values),
    },
} satisfies Meta<typeof PanelsExample>;

export default meta;
type Story = StoryObj<typeof meta>;

function isShown(element: Element): boolean {
    return getComputedStyle(element).display !== 'none';
}

/**
 * Beside the form, the sidebar has its state and its Save button, in place of the footer, then
 * the errors after a failed save, the publication with Publish, and the notes (decision 0075).
 */
export const Beside: Story = {
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        const sidebar = canvas.getByRole('region', { name: 'Sidebar' });
        const saves = canvas.getAllByRole('button', { name: 'Save' });
        // One in the sidebar, one in the footer: only the first shows
        await expect(saves.filter((button) => button.checkVisibility())).toHaveLength(1);
        await expect(sidebar).toContainElement(
            saves.find((button) => button.checkVisibility()) ?? null,
        );
        // A failed save lists its errors in the sidebar
        await userEvent.clear(canvas.getByRole('textbox', { name: /Title/ }));
        await userEvent.click(within(sidebar).getByRole('button', { name: 'Save' }));
        const alerts = await canvas.findAllByRole('alert');
        await expect(alerts.filter(isShown)).toHaveLength(1);
        await expect(sidebar).toContainElement(alerts.find(isShown) ?? null);
        // Publish sets the status and saves
        await userEvent.type(canvas.getByRole('textbox', { name: /Title/ }), 'About us');
        await userEvent.click(within(sidebar).getByRole('button', { name: 'Publish' }));
        await waitFor(() => expect(args.onSubmit).toHaveBeenCalled());
        await expect(
            await within(sidebar).findByRole('button', { name: 'Unpublish' }),
        ).toBeInTheDocument();
    },
};

/** Below a narrow form, the sidebar has no Save button: the footer keeps it. */
export const Below: Story = {
    args: { width: '36rem' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const sidebar = canvas.getByRole('region', { name: 'Sidebar' });
        const saves = canvas.getAllByRole('button', { name: 'Save' });
        await expect(saves.filter((button) => button.checkVisibility())).toHaveLength(1);
        await expect(sidebar).not.toContainElement(
            saves.find((button) => button.checkVisibility()) ?? null,
        );
        await expect(within(sidebar).getByRole('button', { name: 'Publish' })).toBeVisible();
    },
};
