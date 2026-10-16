import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import type { Field, LayoutNode } from '@panneau/protocol';
import { Button } from '@panneau/ui';

import { Form } from './Form';
import { useLeaveConfirmation } from './unsaved';

/** A form as a product builds it: fields from its own data, saved by its own API. */
const PROFILE_FIELDS: Field[] = [
    { name: 'name', type: 'text', label: 'Name', rules: [{ rule: 'required' }] },
    {
        name: 'email',
        type: 'email',
        label: 'Email',
        rules: [{ rule: 'required' }, { rule: 'email' }],
    },
    { name: 'website', type: 'url', label: 'Website', rules: [{ rule: 'url' }] },
    { name: 'bio', type: 'textarea', label: 'Bio', rules: [{ rule: 'max', value: 160 }] },
    { name: 'newsletter', type: 'boolean', label: 'Newsletter', settings: { widget: 'switch' } },
];

const meta = {
    title: 'Forms/Form',
    component: Form,
    args: { fields: PROFILE_FIELDS, onSubmit: fn(async () => undefined) },
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithoutDefinition: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(canvas.getByRole('textbox', { name: /Name/ }), 'Ada');
        await userEvent.type(canvas.getByRole('textbox', { name: /Email/ }), 'ada@example.com');
        await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(args.onSubmit).toHaveBeenCalled());
    },
};

export const ClientErrors: Story = {
    args: { values: { email: 'not an email', website: 'nope' } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
        await expect(await canvas.findByRole('alert')).toHaveTextContent('3 errors prevent saving');
    },
};

const LAYOUT_FIELDS: Field[] = [
    { name: 'title', type: 'text', label: 'Title', rules: [{ rule: 'required' }] },
    {
        name: 'status',
        type: 'select',
        label: 'Status',
        options: [
            { value: 'draft', label: 'Draft' },
            { value: 'scheduled', label: 'Scheduled' },
        ],
    },
    { name: 'summary', type: 'textarea', label: 'Summary' },
    { name: 'publish_at', type: 'datetime', label: 'Publish at', rules: [{ rule: 'required' }] },
    { name: 'meta_title', type: 'text', label: 'Meta title', rules: [{ rule: 'required' }] },
    { name: 'share_text', type: 'textarea', label: 'Share text' },
    { name: 'featured', type: 'boolean', label: 'Featured' },
];

const LAYOUT: LayoutNode[] = [
    {
        type: 'tabs',
        children: [
            {
                type: 'tab',
                label: 'Content',
                children: [
                    {
                        type: 'row',
                        children: [
                            { type: 'field', name: 'title', width: 8 },
                            { type: 'field', name: 'status', width: 4 },
                        ],
                    },
                    { type: 'field', name: 'summary' },
                ],
            },
            {
                type: 'tab',
                label: 'SEO',
                children: [
                    { type: 'text', text: 'How the episode shows in search engines.' },
                    { type: 'field', name: 'meta_title' },
                    {
                        type: 'section',
                        label: 'Sharing',
                        collapsible: true,
                        collapsed: true,
                        children: [{ type: 'field', name: 'share_text' }],
                    },
                ],
            },
        ],
    },
    {
        type: 'sidebar',
        children: [
            {
                type: 'section',
                label: 'Publication',
                children: [
                    {
                        type: 'field',
                        name: 'publish_at',
                        visibleWhen: { field: 'status', equals: 'scheduled' },
                    },
                    { type: 'field', name: 'featured' },
                ],
            },
        ],
    },
];

export const Layout: Story = {
    args: { fields: LAYOUT_FIELDS, layout: LAYOUT, values: { status: 'scheduled' } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
        await expect(await canvas.findByRole('tab', { name: /SEO/ })).toHaveAccessibleName(
            'SEO 1 error',
        );
    },
};

function LeaveGuard() {
    const [dirty, setDirty] = useState(true);
    const [left, setLeft] = useState<boolean | null>(null);
    const { confirmLeave, dialog } = useLeaveConfirmation(dirty);
    return (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button onPress={() => void confirmLeave().then(setLeft)}>Go to another page</Button>
            <Button variant="ghost" onPress={() => setDirty(!dirty)}>
                {dirty ? 'Mark as saved' : 'Make a change'}
            </Button>
            <span>{left === null ? '' : left ? 'Left' : 'Stayed'}</span>
            {dialog}
        </div>
    );
}

export const UnsavedChanges: Story = {
    render: () => <LeaveGuard />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Go to another page' }));
        await expect(
            await canvas.findByRole('alertdialog', { name: 'Leave without saving?' }),
        ).toBeInTheDocument();
    },
};
