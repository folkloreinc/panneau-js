/**
 * The panel where a relation field creates its item, over the form of the page (decision 0110):
 * the form of an article, whose authors are people, saved through the REST adapter of
 * `@panneau/data` to the mock backend of `@panneau/protocol`.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RouterProvider } from 'react-aria-components';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { PanneauProvider } from '@panneau/core';
import { createRestAdapter } from '@panneau/data';
import { DataAdapterProvider } from '@panneau/data/query';
import { FieldsProvider } from '@panneau/fields';
import { Form } from '@panneau/forms';
import { type Definition, type DefinitionInput, validateDefinition } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';

import { createRelatedItemRequests } from '../relatedItems';
import { createAppRelationSource } from '../relationSource';
import { RelatedItemPanelHost } from './RelatedItemPanelHost';

const input: DefinitionInput = {
    protocol: 1,
    name: 'Northwind Journal',
    locale: 'en',
    locales: ['en'],
    api: { baseUrl: '/api' },
    resources: [
        {
            id: 'articles',
            label: { singular: 'article', plural: 'articles' },
            itemTitle: 'title',
            fields: [
                { name: 'title', type: 'text', label: 'Title' },
                {
                    name: 'authors',
                    type: 'relation',
                    resource: 'people',
                    multiple: true,
                    label: 'Authors',
                },
            ],
        },
        {
            id: 'people',
            label: { singular: 'person', plural: 'people' },
            itemTitle: 'name',
            itemSubtitle: 'role',
            fields: [
                { name: 'name', type: 'text', label: 'Name', rules: [{ rule: 'required' }] },
                { name: 'role', type: 'text', label: 'Role' },
                { name: 'bio', type: 'textarea', label: 'Biography' },
                { name: 'mentor', type: 'relation', resource: 'people', label: 'Mentor' },
            ],
        },
    ],
};

function createSetup() {
    const result = validateDefinition(input);
    if (!result.success) {
        throw new Error(JSON.stringify(result.issues));
    }
    const definition: Definition = result.data;
    const backend = createMockBackend({
        definition: input,
        items: { people: [{ id: '1', name: 'Ada Lovelace', role: 'Editor' }] },
    });
    const adapter = createRestAdapter({ baseUrl: '/api', fetch: backend.fetch });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const requests = createRelatedItemRequests();
    return {
        definition,
        adapter,
        client,
        requests,
        source: createAppRelationSource(adapter, definition, client, '/admin', requests.open),
    };
}

/** The form of an article, as its page shows it, with the panel of the shell. */
function ArticleForm() {
    const [{ definition, adapter, client, requests, source }] = useState(createSetup);
    const articles = definition.resources[0];
    if (articles === undefined) {
        return null;
    }
    return (
        <QueryClientProvider client={client}>
            <DataAdapterProvider adapter={adapter}>
                <RouterProvider navigate={() => undefined}>
                    <PanneauProvider definition={definition}>
                        <FieldsProvider relationSource={source}>
                            <div style={{ maxWidth: '40rem', padding: '1.5rem' }}>
                                <Form
                                    aria-label="New article"
                                    fields={articles.fields}
                                    mode="create"
                                    onSubmit={async (values) => values}
                                />
                            </div>
                            <RelatedItemPanelHost
                                requests={requests}
                                definition={definition}
                                basePath="/admin"
                            />
                        </FieldsProvider>
                    </PanneauProvider>
                </RouterProvider>
            </DataAdapterProvider>
        </QueryClientProvider>
    );
}

const meta = {
    title: 'App/Related item panel',
    component: ArticleForm,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ArticleForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** "Create “Grace Hopper”" in the authors opens the panel; saving adds her to them. */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const page = within(document.body);
        await userEvent.type(canvas.getByRole('textbox', { name: 'Title' }), 'Notes on computing');
        await userEvent.type(canvas.getByRole('combobox', { name: 'Authors' }), 'Grace Hopper');
        await userEvent.click(await page.findByRole('option', { name: 'Create “Grace Hopper”' }));

        const panel = within(await page.findByRole('dialog', { name: 'New person' }));
        await expect(await panel.findByRole('textbox', { name: /^Name/ })).toHaveValue(
            'Grace Hopper',
        );
        await expect(panel.getByRole('heading', { name: 'New person' })).toBeInTheDocument();
        await userEvent.type(panel.getByRole('textbox', { name: 'Role' }), 'Rear admiral');
        await userEvent.click(panel.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
        await expect(await canvas.findByText('Rear admiral')).toBeInTheDocument();
        await expect(canvas.getByLabelText(/^Title/)).toHaveValue('Notes on computing');
        // Back on the picker, which shows its options as it takes the focus
        const picker = canvas.getByLabelText('Authors', { selector: 'input' });
        await waitFor(() => expect(picker).toHaveFocus());
        await userEvent.keyboard('{Escape}');
        await waitFor(() => expect(page.queryByRole('listbox')).toBeNull());
    },
};
