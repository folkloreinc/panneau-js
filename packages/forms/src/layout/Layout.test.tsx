import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { PanneauProvider, definePlugin } from '@panneau/core';
import type { Field, LayoutNode } from '@panneau/protocol';

import { Form } from '../Form';
import { renderForm } from '../__fixtures__/render';

const FIELDS: Field[] = [
    { name: 'title', type: 'text', label: 'Title', rules: [{ rule: 'required' }] },
    {
        name: 'status',
        type: 'select',
        label: 'Status',
        options: [
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
        ],
    },
    { name: 'meta_title', type: 'text', label: 'Meta title', rules: [{ rule: 'required' }] },
    { name: 'share', type: 'text', label: 'Share text', rules: [{ rule: 'required' }] },
    { name: 'published_at', type: 'date', label: 'Published on' },
    { name: 'notes', type: 'textarea', label: 'Notes' },
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
                    { type: 'text', text: 'Write for the web.' },
                ],
            },
            {
                type: 'tab',
                label: 'SEO',
                children: [
                    { type: 'field', name: 'meta_title' },
                    {
                        type: 'section',
                        label: 'Sharing',
                        collapsible: true,
                        collapsed: true,
                        children: [{ type: 'field', name: 'share' }],
                    },
                ],
            },
        ],
    },
    {
        type: 'sidebar',
        children: [
            {
                type: 'field',
                name: 'published_at',
                visibleWhen: { field: 'status', equals: 'published' },
            },
        ],
    },
];

describe('Form layout', () => {
    it('renders rows with widths, tabs, text, a sidebar, and appends unreferenced fields', () => {
        renderForm(<Form fields={FIELDS} layout={LAYOUT} />);
        expect(screen.getByRole('tab', { name: 'Content' })).toHaveAttribute(
            'aria-selected',
            'true',
        );
        const title = screen.getByRole('textbox', { name: /Title/ });
        expect(
            (title.closest('[style]') as HTMLElement).style.getPropertyValue('--panneau-span'),
        ).toBe('8');
        expect(screen.getByText('Write for the web.')).toBeInTheDocument();
        expect(screen.getByRole('complementary')).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Notes' })).toBeInTheDocument();
    });

    it('shows nodes and fields by their condition', async () => {
        renderForm(<Form fields={FIELDS} layout={LAYOUT} values={{ status: 'draft' }} />);
        expect(screen.queryByRole('group', { name: 'Published on' })).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: /Status/ }));
        await userEvent.click(await screen.findByRole('option', { name: 'Published' }));
        expect(await screen.findByRole('group', { name: 'Published on' })).toBeInTheDocument();
    });

    it('counts errors on tabs and sections, and opens the tab of the first error', async () => {
        renderForm(<Form fields={FIELDS} layout={LAYOUT} values={{ title: 'Hello' }} />);
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        const seo = screen.getByRole('tab', { name: /SEO/ });
        expect(seo).toHaveAccessibleName('SEO 2 errors');
        await waitFor(() => expect(seo).toHaveAttribute('aria-selected', 'true'));
        await waitFor(() =>
            expect(screen.getByRole('textbox', { name: /Meta title/ })).toHaveFocus(),
        );
        expect(screen.getByRole('button', { name: /Sharing/ })).toHaveAccessibleName(
            'Sharing 1 error',
        );
    });

    it('opens a collapsed section to reach its error', async () => {
        renderForm(
            <Form
                fields={FIELDS}
                layout={LAYOUT}
                values={{ title: 'Hello', meta_title: 'Meta' }}
            />,
        );
        const sharing = screen.getByRole('button', { name: /Sharing/ });
        expect(sharing).toHaveAttribute('aria-expanded', 'false');
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(sharing).toHaveAttribute('aria-expanded', 'true'));
        await waitFor(() =>
            expect(screen.getByRole('textbox', { name: /Share text/ })).toHaveFocus(),
        );
    });

    it('renders component nodes from plugins', () => {
        const plugin = definePlugin({
            id: 'preview',
            components: {
                preview: ({ label }: { label: string }) => <p>Preview: {label}</p>,
            },
        });
        renderForm(
            <PanneauProvider plugins={[plugin]}>
                <Form
                    fields={[]}
                    layout={[{ type: 'component', component: 'preview', props: { label: 'Card' } }]}
                />
            </PanneauProvider>,
        );
        expect(screen.getByText('Preview: Card')).toBeInTheDocument();
    });

    it('uses field components from plugins', () => {
        const plugin = definePlugin({
            id: 'rich',
            fields: { richtext: ({ field }: { field: Field }) => <p>Editor of {field.name}</p> },
        });
        renderForm(
            <PanneauProvider plugins={[plugin]}>
                <Form fields={[{ name: 'body', type: 'richtext', label: 'Body' }]} />
            </PanneauProvider>,
        );
        expect(screen.getByText('Editor of body')).toBeInTheDocument();
    });

    it('has non-section groups of nested fields bound to the form', async () => {
        renderForm(
            <Form
                fields={[
                    {
                        name: 'links',
                        type: 'repeater',
                        label: 'Links',
                        fields: [
                            {
                                name: 'url',
                                type: 'url',
                                label: 'URL',
                                rules: [{ rule: 'required' }],
                            },
                        ],
                    },
                ]}
                values={{ links: [{ url: null }] }}
            />,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        const summary = await screen.findByRole('alert');
        expect(within(summary).getByRole('listitem')).toHaveTextContent(
            'Links › 1 › URL: This field is required.',
        );
        expect(screen.getByRole('textbox', { name: /URL/ })).toHaveAttribute(
            'aria-invalid',
            'true',
        );
    });
});
