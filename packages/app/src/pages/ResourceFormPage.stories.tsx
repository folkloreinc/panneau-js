/**
 * The form of an item, to create or edit it: saved through the REST adapter of `@panneau/data` to
 * the mock backend of `@panneau/protocol`.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RouterProvider } from 'react-aria-components';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ActionRunnerProvider } from '@panneau/actions';
import { PanneauProvider, createMemoryRouter, resolveResource } from '@panneau/core';
import { createRestAdapter } from '@panneau/data';
import { DataAdapterProvider } from '@panneau/data/query';
import { type DefinitionInput, validateDefinition } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';

import { ResourceFormPage } from './ResourceFormPage';

const input: DefinitionInput = {
    protocol: 1,
    name: 'Northwind Journal',
    locale: 'en',
    locales: ['en'],
    api: { baseUrl: '/panneau/api' },
    resources: [
        {
            id: 'articles',
            label: { singular: 'article', plural: 'articles' },
            itemTitle: 'title',
            fields: [
                { name: 'title', type: 'text', label: 'Title', rules: [{ rule: 'required' }] },
                { name: 'summary', type: 'textarea', label: 'Summary' },
                { name: 'featured', type: 'boolean', label: 'Featured' },
            ],
        },
    ],
};

/** A request to the backend: its method, its path and its body. */
type RequestSpy = (method: string, path: string, body: unknown) => void;

interface FormPageStoryProps {
    /** The item to edit, or `null` to create one. */
    id: string | null;
    /** Requests never answer: the item loads. */
    pending?: boolean;
    /** Called with each request that writes (not a `GET`). */
    onRequest?: RequestSpy;
}

function FormPageStory({ id, pending = false, onRequest }: FormPageStoryProps) {
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
                        title: 'The river festival returns',
                        summary: 'Three days of music on the banks.',
                        featured: false,
                    },
                ],
            },
        });
        const spied: typeof backend.fetch = async (request, init) => {
            const method = init?.method ?? 'GET';
            if (method !== 'GET') {
                const path = new URL(String(request), window.location.origin).pathname;
                const body: unknown =
                    typeof init?.body === 'string' ? JSON.parse(init.body) : init?.body;
                onRequest?.(method, path, body);
            }
            return backend.fetch(request, init);
        };
        return {
            definition: parsed.data,
            adapter: createRestAdapter({
                baseUrl: '/panneau/api',
                fetch: pending ? () => new Promise<Response>(() => undefined) : spied,
            }),
            router: createMemoryRouter(''),
            queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }),
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
                            <ResourceFormPage
                                definition={state.definition}
                                resolved={resolveResource(resource)}
                                basePath="/panneau"
                                id={id}
                            />
                        </PanneauProvider>
                    </RouterProvider>
                </ActionRunnerProvider>
            </DataAdapterProvider>
        </QueryClientProvider>
    );
}

const meta = {
    title: 'App/Resource form page',
    component: FormPageStory,
    parameters: { layout: 'fullscreen' },
    args: { id: '1', onRequest: fn() },
} satisfies Meta<typeof FormPageStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The form of an item: a value edited, then saved with the item's version. */
export const Edit: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            await canvas.findByRole('heading', { name: 'The river festival returns', level: 1 }),
        ).toBeVisible();
        const form = canvas.getByRole('form', { name: 'The river festival returns' });
        const summary = within(form).getByRole('textbox', { name: 'Summary' });
        await expect(summary).toHaveValue('Three days of music on the banks.');
        await userEvent.clear(summary);
        await userEvent.type(summary, 'Four days of music.');
        await expect(within(form).getByText('Unsaved changes')).toBeVisible();
        await userEvent.click(within(form).getByRole('button', { name: 'Save' }));
        // Only the changed value is sent
        await waitFor(() =>
            expect(args.onRequest).toHaveBeenCalledWith(
                'PATCH',
                '/panneau/api/resources/articles/1',
                {
                    summary: 'Four days of music.',
                },
            ),
        );
        // The form starts over from the saved item, and still says it is saved
        const savedForm = () => canvas.getByRole('form', { name: 'The river festival returns' });
        await waitFor(() =>
            expect(within(savedForm()).getByRole('status')).toHaveTextContent('Saved'),
        );
        await expect(within(savedForm()).getByRole('textbox', { name: 'Summary' })).toHaveValue(
            'Four days of music.',
        );
    },
};

/** The form of a new item: a required value is checked before anything is sent. */
export const Create: Story = {
    args: { id: null },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { name: 'New article', level: 1 })).toBeVisible();
        const form = canvas.getByRole('form', { name: 'New article' });
        await expect(within(form).getByRole('textbox', { name: /Title/ })).toHaveValue('');
        await userEvent.click(within(form).getByRole('button', { name: 'Save' }));
        await expect(await within(form).findByRole('alert')).toHaveTextContent(
            '1 error prevents saving',
        );
        // The first error is focused, once the form has scrolled to it
        await waitFor(() =>
            expect(within(form).getByRole('textbox', { name: /Title/ })).toHaveFocus(),
        );
        await expect(args.onRequest).not.toHaveBeenCalled();
    },
};

/** The item loads: a skeleton of the title and of the form, in a busy region. */
export const Loading: Story = {
    args: { pending: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const status = canvas
            .getAllByRole('status')
            .find((element) => element.textContent === 'Loading the form…');
        await expect(status).toBeDefined();
        // The status message is said once, next to the busy region of the skeleton
        await expect(status?.nextElementSibling).toHaveAttribute('aria-busy', 'true');
        await expect(
            status?.nextElementSibling?.querySelectorAll('.panneau-skeleton').length,
        ).toBeGreaterThan(0);
        await expect(canvas.queryByRole('form')).toBeNull();
        await expect(canvas.queryByRole('textbox')).toBeNull();
    },
};
