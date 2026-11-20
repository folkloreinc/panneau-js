import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { type SubmitContext, useForm } from '@panneau/core';
import type { Field, LayoutNode } from '@panneau/protocol';

import { FormView } from './FormView';

const FIELDS: Field[] = [
    { name: 'title', type: 'text', label: 'Title', rules: [{ rule: 'required' }] },
    { name: 'summary', type: 'textarea', label: 'Summary' },
    { name: 'featured', type: 'boolean', label: 'Featured' },
    {
        name: 'featured_until',
        type: 'date',
        label: 'Featured until',
        rules: [{ rule: 'required' }],
        visibleWhen: { field: 'featured', equals: true },
    },
    { name: 'meta_title', type: 'text', label: 'Meta title' },
];

const LAYOUT: LayoutNode[] = [
    {
        type: 'tabs',
        children: [
            {
                type: 'tab',
                label: 'Content',
                children: [
                    { type: 'field', name: 'title' },
                    { type: 'field', name: 'summary' },
                    {
                        type: 'section',
                        label: 'Promotion',
                        children: [
                            { type: 'field', name: 'featured' },
                            { type: 'field', name: 'featured_until' },
                        ],
                    },
                ],
            },
            {
                type: 'tab',
                label: 'SEO',
                children: [{ type: 'field', name: 'meta_title' }],
            },
        ],
    },
];

interface EditorProps {
    onSubmit: (values: Record<string, unknown>, context: SubmitContext) => Promise<unknown>;
    isLoading?: boolean;
}

/** A form made elsewhere, with `useForm()`: the page shows whether it has unsaved changes. */
function Editor({ onSubmit, isLoading = false }: EditorProps) {
    const { form, dirty } = useForm({
        fields: FIELDS,
        values: { title: 'The river festival returns', featured: false },
        onSubmit,
    });
    return (
        <>
            <p>{dirty ? 'Edited' : 'As loaded'}</p>
            <FormView
                form={form}
                fields={FIELDS}
                layout={LAYOUT}
                isLoading={isLoading}
                aria-label="Article"
            />
        </>
    );
}

/**
 * The view of a form state of `@panneau/core`. `FormBinding` binds each field to it by path: its
 * value, its changes, its errors and its `visibleWhen`, which these stories cover.
 */
const meta = {
    title: 'Forms/FormView',
    component: Editor,
    args: { onSubmit: fn(async (values: Record<string, unknown>) => values) },
} satisfies Meta<typeof Editor>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Fields in tabs and a section, bound to the form: edited, then saved. */
export const Layout: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const form = canvas.getByRole('form', { name: 'Article' });
        await expect(canvas.getByText('As loaded')).toBeInTheDocument();
        await userEvent.type(within(form).getByRole('textbox', { name: 'Summary' }), 'Music');
        await expect(canvas.getByText('Edited')).toBeInTheDocument();
        await userEvent.click(within(form).getByRole('tab', { name: 'SEO' }));
        await userEvent.type(
            await within(form).findByRole('textbox', { name: 'Meta title' }),
            'Festival',
        );
        await userEvent.click(within(form).getByRole('button', { name: 'Save' }));
        await waitFor(() =>
            expect(args.onSubmit).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'The river festival returns',
                    summary: 'Music',
                    meta_title: 'Festival',
                }),
                expect.anything(),
            ),
        );
        await expect(await within(form).findByText('Saved')).toBeInTheDocument();
    },
};

/**
 * The binding of a field: a field shows when its `visibleWhen` holds, and its errors show on it
 * after a failed save, which links to it from the summary.
 */
export const Binding: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.queryByText('Featured until')).toBeNull();
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Featured' }));
        await expect(await canvas.findByText('Featured until')).toBeInTheDocument();
        await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
        const summary = await canvas.findByRole('alert');
        await expect(summary).toHaveTextContent('1 error prevents saving');
        await expect(args.onSubmit).not.toHaveBeenCalled();
        await expect(
            canvasElement.querySelector(
                '[data-panneau-path="featured_until"] [aria-invalid="true"]',
            ),
        ).not.toBeNull();
        // Unchecked, the field hides, and its error no longer prevents saving
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Featured' }));
        await expect(
            canvasElement.querySelector('[data-panneau-path="featured_until"]'),
        ).toBeNull();
        await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(args.onSubmit).toHaveBeenCalledTimes(1));
    },
};

/** The values load: a skeleton of the tabs and fields, in a busy region with a status message. */
export const Loading: Story = {
    args: { isLoading: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('status')).toHaveTextContent('Loading the form…');
        const region = canvasElement.querySelector('[aria-busy="true"]');
        await expect(region).not.toBeNull();
        await expect(region?.querySelectorAll('.panneau-skeleton').length).toBeGreaterThan(0);
        await expect(canvas.queryByRole('form')).toBeNull();
        await expect(canvas.queryByRole('textbox')).toBeNull();
    },
};
