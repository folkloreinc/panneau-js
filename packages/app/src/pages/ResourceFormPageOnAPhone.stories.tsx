/**
 * The form of an item on a phone (#501), in the frame of the app: a sidebar with a `Publication`
 * group (a relation, a date-time and a localized slug) beside a long list of blocks.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RouterProvider } from 'react-aria-components';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { ActionRunnerProvider } from '@panneau/actions';
import { PanneauProvider, createMemoryRouter, resolveResource } from '@panneau/core';
import { createRestAdapter } from '@panneau/data';
import { DataAdapterProvider } from '@panneau/data/query';
import { FieldsProvider } from '@panneau/fields';
import { type DefinitionInput, validateDefinition } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';

import { createAppRelationSource } from '../relationSource';
import { AppLayout } from '../shell/AppLayout';
import { ResourceFormPage } from './ResourceFormPage';

const input: DefinitionInput = {
    protocol: 1,
    name: 'Northwind Journal',
    locale: 'fr',
    locales: ['fr', 'en'],
    api: { baseUrl: '/panneau/api' },
    resources: [
        {
            id: 'articles',
            label: { singular: 'article', plural: 'articles' },
            itemTitle: 'title',
            fields: [
                { name: 'title', type: 'text', label: 'Title', localized: true },
                {
                    name: 'blocks',
                    type: 'repeater',
                    label: 'Blocks',
                    types: [
                        {
                            id: 'text',
                            label: 'Text',
                            fields: [{ name: 'body', type: 'textarea', label: 'Body' }],
                        },
                    ],
                },
                {
                    name: 'status',
                    type: 'select',
                    label: 'Status',
                    options: [
                        { value: 'draft', label: 'Draft' },
                        { value: 'published', label: 'Published' },
                    ],
                },
                { name: 'published_at', type: 'datetime', label: 'Publication date' },
                { name: 'author', type: 'relation', label: 'Author', resource: 'authors' },
                {
                    name: 'slug',
                    type: 'slug',
                    label: 'Slug',
                    from: 'title',
                    localized: true,
                    settings: { prefix: 'https://example.com/fr/magazine/' },
                },
            ],
            form: {
                layout: [
                    { type: 'field', name: 'title' },
                    { type: 'field', name: 'blocks' },
                    { type: 'sidebar', panel: 'save' },
                    {
                        type: 'sidebar',
                        panel: 'publication',
                        label: 'Publication',
                        children: [
                            { type: 'field', name: 'status' },
                            { type: 'field', name: 'published_at' },
                            { type: 'field', name: 'author' },
                            { type: 'field', name: 'slug' },
                        ],
                    },
                ],
            },
        },
        {
            id: 'authors',
            label: { singular: 'author', plural: 'authors' },
            itemTitle: 'name',
            fields: [{ name: 'name', type: 'text', label: 'Name' }],
        },
    ],
};

const BLOCKS = Array.from({ length: 12 }, (_, index) => ({
    type: 'text',
    body: `Paragraph ${index + 1} of a long article, about a summer of festivals in the city.`,
}));

function FormOnAPhone() {
    const [state] = useState(() => {
        const parsed = validateDefinition(input);
        if (!parsed.success) {
            throw new Error('Invalid definition.');
        }
        const backend = createMockBackend({
            definition: input,
            items: {
                articles: [
                    {
                        id: '1',
                        title: { fr: 'Un été à Montréal', en: 'A summer in Montreal' },
                        blocks: BLOCKS,
                        status: 'published',
                        published_at: '2026-06-21T14:00:00Z',
                        author: '1',
                        // Not translated yet: English offers to copy the French one
                        slug: { fr: 'un-ete-de-festivals-a-montreal' },
                    },
                ],
                authors: [{ id: '1', name: 'Ada Lovelace' }],
            },
        });
        const adapter = createRestAdapter({ baseUrl: '/panneau/api', fetch: backend.fetch });
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        return {
            definition: parsed.data,
            adapter,
            router: createMemoryRouter(''),
            queryClient,
            relationSource: createAppRelationSource(adapter, parsed.data, queryClient, '/panneau'),
        };
    });
    const resource = state.definition.resources[0];
    if (resource === undefined) {
        return null;
    }
    return (
        <QueryClientProvider client={state.queryClient}>
            <DataAdapterProvider adapter={state.adapter}>
                <ActionRunnerProvider adapter={state.adapter}>
                    <RouterProvider navigate={() => undefined}>
                        <PanneauProvider definition={state.definition} router={state.router}>
                            <FieldsProvider relationSource={state.relationSource}>
                                <AppLayout
                                    definition={state.definition}
                                    basePath="/panneau"
                                    route={{ name: 'resource.edit', resource: 'articles', id: '1' }}
                                    colorScheme="auto"
                                    onColorSchemeChange={() => undefined}
                                >
                                    <ResourceFormPage
                                        definition={state.definition}
                                        resolved={resolveResource(resource)}
                                        basePath="/panneau"
                                        id="1"
                                    />
                                </AppLayout>
                            </FieldsProvider>
                        </PanneauProvider>
                    </RouterProvider>
                </ActionRunnerProvider>
            </DataAdapterProvider>
        </QueryClientProvider>
    );
}

const meta = {
    title: 'App/Resource form page/On a phone',
    component: FormOnAPhone,
    parameters: {
        layout: 'fullscreen',
        // An iPhone, 375px wide: the window, which the shell and the save bar follow
        viewport: {
            options: {
                iphone: {
                    name: 'iPhone',
                    styles: { width: '375px', height: '812px' },
                    type: 'mobile',
                },
            },
        },
    },
    globals: { viewport: { value: 'iphone', isRotated: false } },
} satisfies Meta<typeof FormOnAPhone>;

export default meta;
type Story = StoryObj<typeof meta>;

const box = (element: Element) => element.getBoundingClientRect();

/**
 * The form of #501 on a phone: its sidebar first, as a disclosure that names its groups, then the
 * fields as wide as those of the main column, in a single box; the slug readable, its switch on
 * the line of its label; and the save bar at the bottom of the screen, from edge to edge.
 */
export const Default: Story = {
    play: async ({ canvasElement, step }) => {
        const canvas = within(canvasElement);
        const form = await canvas.findByRole('form', { name: 'Un été à Montréal' });
        const fields = within(form);

        await step('The sidebar comes before the main column, collapsed', async () => {
            const toggle = await fields.findByRole('button', { name: 'Publication' });
            await expect(toggle).toHaveAttribute('aria-expanded', 'false');
            const title = within(fields.getByRole('group', { name: 'Title' })).getByRole('textbox');
            // In the order of the page, of the keyboard and of the screen
            await expect(
                toggle.compareDocumentPosition(title) & Node.DOCUMENT_POSITION_FOLLOWING,
            ).toBeTruthy();
            await expect(box(toggle).bottom).toBeLessThanOrEqual(box(title).top);
            await expect(fields.queryByRole('button', { name: 'Status' })).toBeNull();
            await userEvent.click(toggle);
            await expect(toggle).toHaveAttribute('aria-expanded', 'true');
            // The panel it opens doesn't repeat its title, nor collapse a second time (#503)
            await expect(fields.getAllByRole('button', { name: 'Publication' })).toHaveLength(1);
            await expect(fields.getAllByRole('heading', { name: 'Publication' })).toHaveLength(1);
            await expect(await fields.findByRole('button', { name: /Status/ })).toBeVisible();
        });

        await step('One level of box: the fields are as wide as the main column', async () => {
            const sidebar = fields.getByRole('region', { name: 'Sidebar' });
            const style = getComputedStyle(sidebar);
            await expect(style.borderTopWidth).toBe('0px');
            await expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
            const status = await fields.findByRole('button', { name: /Status/ });
            const title = within(fields.getByRole('group', { name: 'Title' })).getByRole('textbox');
            const control = title.closest('.panneau-text-input') ?? title;
            await expect(Math.abs(box(status).width - box(control).width)).toBeLessThanOrEqual(1);
            await expect(Math.abs(box(status).left - box(control).left)).toBeLessThanOrEqual(1);
        });

        await step('The slug is readable, its switch on the line of its label', async () => {
            const slug = fields.getByRole('group', { name: 'Slug' });
            const input = within(slug).getByRole('textbox');
            await expect(input).toHaveValue('un-ete-de-festivals-a-montreal');
            const generate = within(slug).getByRole('button', { name: /Generate/ });
            const control = input.closest('.panneau-text-input') ?? input;
            // The input takes the room of the control: the start of the address, cut, gives up its
            // own to the slug
            const prefix = control.querySelector('[title="https://example.com/fr/magazine/"] > *');
            await expect(prefix).not.toBeNull();
            if (prefix !== null && input.scrollWidth > input.clientWidth + 1) {
                await expect(prefix.scrollWidth).toBeGreaterThan(prefix.clientWidth);
            }
            await expect(box(input).width).toBeGreaterThanOrEqual(box(control).width / 2);
            await expect(box(input).right).toBeLessThanOrEqual(box(generate).left);
            await expect(box(generate).width).toBeLessThanOrEqual(box(generate).height + 1);
            // English is empty: "Copy from French" is only an icon, and the switch keeps its line
            const switcher = within(slug).getByRole('radiogroup');
            await userEvent.click(within(switcher).getByRole('radio', { name: /English/ }));
            const copy = await within(slug).findByRole('button', { name: 'Copy from French' });
            await expect(box(copy).width).toBeLessThanOrEqual(box(copy).height + 1);
            const label = within(slug).getByText('Slug');
            await expect(box(switcher).top).toBeLessThan(box(label).bottom);
            await expect(box(switcher).bottom).toBeLessThanOrEqual(
                box(within(slug).getByRole('textbox')).top,
            );
        });

        await step('The blocks keep the room of their header for their title', async () => {
            const blocks = within(fields.getByRole('group', { name: 'Blocks' }));
            // The legend keeps one line: "Expand all" is an icon at its end (#503)
            const legend = blocks.getByText('Blocks');
            const expandAll = blocks.getByRole('button', { name: 'Expand all' });
            await expect(box(expandAll).width).toBeLessThanOrEqual(box(expandAll).height + 1);
            await expect(box(expandAll).top).toBeLessThan(box(legend).bottom);
            await expect(box(expandAll).bottom).toBeGreaterThan(box(legend).top);
            const toggle = blocks.getByRole('button', { name: /^1\s*Text/, expanded: false });
            const header = toggle.parentElement ?? toggle;
            // Their tools are in a menu: the title has most of the header
            await expect(blocks.queryByRole('button', { name: 'Move item 1 down' })).toBeNull();
            await expect(box(toggle).width).toBeGreaterThanOrEqual(box(header).width * 0.6);
            await userEvent.click(blocks.getByRole('button', { name: 'Actions for item 1' }));
            const menu = within(await canvas.findByRole('menu'));
            await expect(menu.getByRole('menuitem', { name: 'Move item 1 up' })).toHaveAttribute(
                'aria-disabled',
                'true',
            );
            await userEvent.keyboard('{Escape}');
        });

        await step('The save bar is at the bottom of the screen, from edge to edge', async () => {
            const save = fields.getByRole('button', { name: 'Save' });
            let footer: HTMLElement | null = save;
            while (footer !== null && getComputedStyle(footer).position !== 'fixed') {
                footer = footer.parentElement;
            }
            await expect(footer).not.toBeNull();
            if (footer === null) {
                return;
            }
            const view = canvasElement.ownerDocument.documentElement;
            await waitFor(() => expect(box(footer).bottom).toBeCloseTo(view.clientHeight, 0));
            await expect(box(footer).left).toBe(0);
            await expect(box(footer).right).toBeCloseTo(view.clientWidth, 0);
            // On the background of the card of the page, not of the page behind it
            const card = form.closest('main')?.firstElementChild;
            await expect(getComputedStyle(footer).backgroundColor).toBe(
                card ? getComputedStyle(card).backgroundColor : '',
            );
            // The form keeps the room of the bar under its last field
            await expect(parseFloat(getComputedStyle(form).paddingBottom)).toBeCloseTo(
                box(footer).height,
                0,
            );
        });
    },
};
