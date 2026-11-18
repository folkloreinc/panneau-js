import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useForm } from '@panneau/core';
import { editorPlugin } from '@panneau/editor';
import { type UploadSource, useFieldsContext } from '@panneau/fields';
import type { Field, LayoutNode } from '@panneau/protocol';
import { Button, Dialog, DialogTrigger, TextArea } from '@panneau/ui';

import { FormView, type FormViewProps } from './FormView';
import { problemError, renderForm } from './__fixtures__/render';

// What ProseMirror measures, which jsdom doesn't lay out
if (typeof Range.prototype.getClientRects !== 'function') {
    Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
    Range.prototype.getBoundingClientRect = () => new DOMRect(0, 0, 0, 0);
}
if (typeof document.elementFromPoint !== 'function') {
    document.elementFromPoint = () => null;
}

const FIELDS: Field[] = [
    { name: 'title', type: 'text', label: 'Title', rules: [{ rule: 'required' }] },
];

describe('FormView', () => {
    it('renders a form created elsewhere', async () => {
        const onSubmit = vi.fn();
        function Editor() {
            const { form, dirty } = useForm({ fields: FIELDS, onSubmit });
            return (
                <>
                    <p>{dirty ? 'dirty' : 'clean'}</p>
                    <FormView form={form} fields={FIELDS} aria-label="Editor" />
                </>
            );
        }
        renderForm(<Editor />);
        expect(screen.getByRole('form', { name: 'Editor' })).toBeInTheDocument();
        await userEvent.type(screen.getByRole('textbox', { name: /Title/ }), 'Hi');
        expect(screen.getByText('dirty')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    });

    it('marks a field required in the mode of the form', () => {
        const fields: Field[] = [
            {
                name: 'password',
                type: 'text',
                label: 'Password',
                rules: [{ rule: 'required', mode: 'create' }],
            },
        ];
        function Editor({ version }: { version: string | null }) {
            const { form } = useForm({ fields, version, onSubmit: vi.fn() });
            return <FormView form={form} fields={fields} aria-label="Editor" />;
        }
        const { unmount } = renderForm(<Editor version={null} />);
        expect(screen.getByRole('textbox', { name: /Password/ })).toBeRequired();
        unmount();
        renderForm(<Editor version="1" />);
        expect(screen.getByRole('textbox', { name: /Password/ })).not.toBeRequired();
    });

    it('draws a skeleton of its layout and fields while its values load', () => {
        const fields: Field[] = [
            { name: 'title', type: 'text', label: 'Title' },
            { name: 'body', type: 'textarea', label: 'Body' },
            { name: 'featured', type: 'boolean', label: 'Featured' },
            { name: 'published_at', type: 'date', label: 'Publication date' },
        ];
        function Editor() {
            const { form } = useForm({ fields, onSubmit: vi.fn() });
            return (
                <FormView
                    form={form}
                    fields={fields}
                    layout={[
                        {
                            type: 'row',
                            children: [
                                { type: 'field', name: 'title', width: 8 },
                                { type: 'field', name: 'published_at', width: 4 },
                            ],
                        },
                        { type: 'field', name: 'body' },
                        { type: 'sidebar', children: [{ type: 'field', name: 'featured' }] },
                    ]}
                    aria-label="Editor"
                    isLoading
                />
            );
        }
        const { container } = renderForm(<Editor />);
        expect(screen.getByRole('status')).toHaveTextContent('Loading the form…');
        expect(screen.queryByRole('form')).toBeNull();
        expect(screen.queryByRole('textbox')).toBeNull();
        const region = container.querySelector('[aria-busy="true"]');
        // A label and a block for each field, and the button of the footer.
        expect(region?.querySelectorAll('.panneau-skeleton')).toHaveLength(9);
        const blocks = [...(region?.querySelectorAll<HTMLElement>('.panneau-skeleton') ?? [])];
        expect(blocks.map((block) => block.style.height)).toContain('6rem');
    });

    it('gives its upload source to the fields', () => {
        const uploadSource: UploadSource = { createUploader: vi.fn() };
        const fields: Field[] = [{ name: 'attachment', type: 'probe' }];
        function Probe() {
            const context = useFieldsContext();
            return <p>{context.uploadSource === uploadSource ? 'source' : 'none'}</p>;
        }
        function Editor() {
            const { form } = useForm({ fields, onSubmit: vi.fn() });
            return (
                <FormView
                    form={form}
                    fields={fields}
                    components={{ probe: Probe }}
                    uploadSource={uploadSource}
                    aria-label="Editor"
                />
            );
        }
        renderForm(<Editor />);
        expect(screen.getByText('source')).toBeInTheDocument();
    });
});

/** A field that edits its notes in a dialog, as the media picker or a relation does. */
function NotesInDialog() {
    return (
        <DialogTrigger>
            <Button>Edit notes</Button>
            <Dialog title="Notes">
                <TextArea label="Note" />
            </Dialog>
        </DialogTrigger>
    );
}

function Editor({
    fields,
    values,
    onSubmit,
    ...props
}: Omit<FormViewProps, 'form' | 'fields'> & {
    fields: Field[];
    values?: Record<string, unknown>;
    onSubmit: (values: Record<string, unknown>) => Promise<unknown>;
}) {
    const { form } = useForm({ fields, values, onSubmit });
    return <FormView form={form} fields={fields} aria-label="Editor" {...props} />;
}

describe('FormView keyboard shortcut', () => {
    const fields: Field[] = [
        { name: 'title', type: 'text', label: 'Title' },
        { name: 'summary', type: 'textarea', label: 'Summary' },
        { name: 'body', type: 'richtext', label: 'Body' },
        { name: 'notes', type: 'notes', label: 'Notes' },
    ];
    const components = { ...editorPlugin.fields, notes: NotesInDialog };

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('saves with Ctrl Enter from a text area, and says so on the submit button', async () => {
        const onSubmit = vi.fn(async (_values: Record<string, unknown>) => undefined);
        renderForm(<Editor fields={fields} components={components} onSubmit={onSubmit} />);
        expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
            'aria-keyshortcuts',
            'Control+Enter',
        );
        await userEvent.type(screen.getByRole('textbox', { name: 'Summary' }), 'Short');
        await userEvent.keyboard('{Control>}{Enter}{/Control}');
        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
        expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ summary: 'Short' });
        // Enter alone still starts a new line
        await userEvent.keyboard('{Enter}');
        expect(screen.getByRole('textbox', { name: 'Summary' })).toHaveValue('Short\n');
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('saves with ⌘ Enter on Apple platforms, and not with Ctrl Enter', async () => {
        vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');
        const onSubmit = vi.fn(async (_values: Record<string, unknown>) => undefined);
        renderForm(<Editor fields={fields} components={components} onSubmit={onSubmit} />);
        expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
            'aria-keyshortcuts',
            'Meta+Enter',
        );
        await userEvent.click(screen.getByRole('textbox', { name: 'Title' }));
        await userEvent.keyboard('{Control>}{Enter}{/Control}');
        await userEvent.keyboard('{Meta>}{Enter}{/Meta}');
        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    });

    it('saves from the rich text editor, without adding a line break', async () => {
        const onSubmit = vi.fn(async (_values: Record<string, unknown>) => undefined);
        renderForm(<Editor fields={fields} components={components} onSubmit={onSubmit} />);
        const body = await screen.findByRole('textbox', { name: 'Body' });
        await userEvent.click(body);
        await userEvent.keyboard('Hello');
        await userEvent.keyboard('{Control>}{Enter}{/Control}');
        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
        expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ body: '<p>Hello</p>' });
        expect(body.querySelector('br:not(.ProseMirror-trailingBreak)')).toBeNull();
    });

    it('leaves the keys of a dialog opened by a field to that dialog', async () => {
        const onSubmit = vi.fn(async (_values: Record<string, unknown>) => undefined);
        renderForm(<Editor fields={fields} components={components} onSubmit={onSubmit} />);
        await userEvent.click(screen.getByRole('button', { name: 'Edit notes' }));
        const dialog = await screen.findByRole('dialog', { name: 'Notes' });
        await userEvent.click(within(dialog).getByRole('textbox', { name: 'Note' }));
        await userEvent.keyboard('{Control>}{Enter}{/Control}');
        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(onSubmit).not.toHaveBeenCalled();
    });
});

describe('FormView after a failed save', () => {
    const fields: Field[] = [
        { name: 'title', type: 'text', label: 'Title' },
        { name: 'summary', type: 'textarea', label: 'Summary' },
        {
            name: 'address',
            type: 'group',
            label: 'Address',
            fields: [{ name: 'city', type: 'text', label: 'City' }],
        },
        {
            name: 'links',
            type: 'repeater',
            label: 'Links',
            fields: [{ name: 'url', type: 'url', label: 'URL' }],
        },
        { name: 'notes', type: 'textarea', label: 'Notes' },
        { name: 'meta_title', type: 'text', label: 'Meta title' },
        { name: 'share', type: 'text', label: 'Share text' },
    ];
    const section = (label: string, name: string): LayoutNode => ({
        type: 'section',
        label,
        collapsible: true,
        collapsed: true,
        children: [{ type: 'field', name }],
    });
    const layout: LayoutNode[] = [
        {
            type: 'tabs',
            children: [
                {
                    type: 'tab',
                    label: 'Content',
                    children: [
                        { type: 'field', name: 'title' },
                        section('Summary', 'summary'),
                        section('Place', 'address'),
                        section('References', 'links'),
                        section('Notes', 'notes'),
                    ],
                },
                {
                    type: 'tab',
                    label: 'SEO',
                    children: [{ type: 'field', name: 'meta_title' }, section('Sharing', 'share')],
                },
            ],
        },
    ];

    it('opens every collapsed section that holds an error, and keeps the tab of the first', async () => {
        const onSubmit = vi.fn(async () => {
            throw problemError({
                status: 422,
                errors: {
                    share: ['Too long.'],
                    'links.0.url': ['Not a URL.'],
                    'address.city': ['Unknown city.'],
                    summary: ['Too short.'],
                },
            });
        });
        renderForm(
            <Editor
                fields={fields}
                layout={layout}
                values={{ address: { city: 'Nowhere' }, links: [{ url: 'nope' }] }}
                onSubmit={onSubmit}
            />,
        );
        // The buttons of the sections, before their names get error counts
        const toggles = Object.fromEntries(
            ['Summary', 'Place', 'References', 'Notes', 'Sharing'].map((name) => [
                name,
                screen.getByRole('button', { name }),
            ]),
        );
        for (const toggle of Object.values(toggles)) {
            expect(toggle).toHaveAttribute('aria-expanded', 'false');
        }
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(screen.getByRole('textbox', { name: /Summary/ })).toHaveFocus());
        for (const name of ['Summary', 'Place', 'References', 'Sharing']) {
            expect(toggles[name]).toHaveAttribute('aria-expanded', 'true');
        }
        expect(toggles.Notes).toHaveAttribute('aria-expanded', 'false');
        // Tabs don't follow every error: the one of the first stays, and each keeps its count
        expect(screen.getByRole('tab', { name: /Content/ })).toHaveAttribute(
            'aria-selected',
            'true',
        );
        expect(screen.getByRole('tab', { name: /SEO/ })).toHaveAccessibleName('SEO 1 error');
    });
});
