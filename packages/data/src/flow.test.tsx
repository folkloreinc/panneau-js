/**
 * An example of the whole stack below the UI: `@panneau/data` loads the definition and the items
 * from a backend that implements the protocol (here the mock backend), and `@panneau/core` turns
 * the definition into a list and a form. Plain inputs stand in for `@panneau/fields`.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import {
    type Form,
    PanneauProvider,
    createMemoryRouter,
    getItemValues,
    getLayoutFieldNames,
    resolveForm,
    selectVisible,
    useForm,
    useFormField,
    useList,
    usePanneau,
    useResource,
} from '@panneau/core';
import type { Item } from '@panneau/protocol';

import { BASE_URL, createBackend, jsonResponse } from './__fixtures__/backend';
import {
    DataAdapterProvider,
    useDefinition,
    useResourceItem,
    useResourceList,
    useUpdateItem,
} from './query';
import { createRestAdapter } from './rest';

const router = createMemoryRouter();

function titleOf(item: Item): string {
    const title = item.title as Record<string, string> | undefined;
    return title?.en ?? '';
}

function Admin() {
    const definition = useDefinition();
    if (definition.data === undefined) {
        return <p>Loading…</p>;
    }
    return (
        <PanneauProvider definition={definition.data} router={router}>
            <Pages />
        </PanneauProvider>
    );
}

function Pages() {
    const [editing, setEditing] = useState<string | null>(null);
    const { resource, list: listDefinition } = useResource('pages');
    const { query, list } = useList({ list: listDefinition });
    const items = useResourceList('pages', query);
    return (
        <main>
            <h1>{resource.label.plural}</h1>
            <ul aria-label="Pages">
                {items.data?.data.map((item) => (
                    <li key={item.id}>
                        {titleOf(item)}{' '}
                        <button type="button" onClick={() => setEditing(item.id)}>
                            Edit {titleOf(item)}
                        </button>
                    </li>
                ))}
            </ul>
            <p>
                Page {query.page} of {String(items.data?.meta.lastPage)}
            </p>
            <button type="button" onClick={() => list.setPage((query.page ?? 1) + 1)}>
                Next page
            </button>
            {editing !== null ? <EditPage id={editing} /> : null}
        </main>
    );
}

function EditPage({ id }: { id: string }) {
    const item = useResourceItem('pages', id);
    return item.data !== undefined ? <PageForm key={id} item={item.data} /> : null;
}

function PageForm({ item }: { item: Item }) {
    const { definition } = usePanneau();
    const { resource } = useResource('pages');
    const { fields, fieldsByName, layout } = resolveForm(resource, { mode: 'update' });
    const update = useUpdateItem('pages');
    const locales = definition?.locales ?? [];
    const state = useForm({
        fields,
        values: getItemValues(
            item,
            fields.map((field) => field.name),
        ),
        version: item.version,
        locales,
        // A partial update with the version the values were edited from.
        onSubmit: (_values, context) =>
            update.mutateAsync({ id: item.id, values: context.changes, version: context.version }),
    });
    const { form, status, conflict, version } = state;
    return (
        <form
            aria-label="Edit page"
            onSubmit={(event) => {
                event.preventDefault();
                void form.submit();
            }}
        >
            {getLayoutFieldNames(layout).map((name) => {
                const field = fieldsByName.get(name);
                if (field === undefined || !selectVisible(state, field)) {
                    return null;
                }
                const paths =
                    field.localized === true
                        ? locales.map((locale) => `${name}.${locale}`)
                        : [name];
                return paths.map((path) => (
                    <TextInput key={path} form={form} path={path} label={`${field.name} ${path}`} />
                ));
            })}
            <p>
                Status: {status}, version {version}
            </p>
            {status === 'conflict' ? (
                <div role="alertdialog" aria-label="Conflict">
                    Someone else saved this page (version {conflict?.current?.version}).
                    <button type="button" onClick={() => void form.resolveConflict('reload')}>
                        Reload their version
                    </button>
                </div>
            ) : null}
            <button type="submit">Save</button>
        </form>
    );
}

function TextInput({ form, path, label }: { form: Form; path: string; label: string }) {
    const field = useFormField(form, path);
    return (
        <label>
            {label}
            <input
                value={typeof field.value === 'string' ? field.value : ''}
                onChange={(event) => field.onChange(event.target.value)}
                onBlur={field.onBlur}
            />
            {field.errors.map((error) => (
                <span key={error} role="alert">
                    {error}
                </span>
            ))}
        </label>
    );
}

function setup() {
    const backend = createBackend();
    // A server-only rule, that the portable rules can't express: unique titles.
    const fetch = async (input: string, init: RequestInit = {}) => {
        const body: unknown = typeof init.body === 'string' ? JSON.parse(init.body) : null;
        const title = (body as { title?: { en?: string } } | null)?.title?.en;
        if (init.method === 'PATCH' && title === 'Contact') {
            return jsonResponse(
                422,
                {
                    type: 'urn:panneau:problem:validation',
                    title: 'The given data was invalid.',
                    status: 422,
                    errors: { 'title.en': ['This title is already used.'] },
                },
                'application/problem+json',
            );
        }
        return backend.fetch(input, init);
    };
    const adapter = createRestAdapter({ baseUrl: BASE_URL, fetch });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
        <QueryClientProvider client={client}>
            <DataAdapterProvider adapter={adapter}>
                <Admin />
            </DataAdapterProvider>
        </QueryClientProvider>,
    );
    return { backend, user: userEvent.setup() };
}

describe('a full flow against the mock backend', () => {
    it('loads the definition, lists, edits with validation errors, saves and gets a conflict', async () => {
        const { backend, user } = setup();

        // Load the definition, then list the pages, sorted by title, two per page.
        expect(await screen.findByRole('heading', { name: 'pages' })).toBeInTheDocument();
        const list = screen.getByRole('list', { name: 'Pages' });
        await waitFor(() =>
            expect(
                within(list)
                    .getAllByRole('listitem')
                    .map((row) => row.textContent),
            ).toEqual(['About Edit About', 'Contact Edit Contact']),
        );
        await user.click(screen.getByRole('button', { name: 'Next page' }));
        expect(await within(list).findByText('Edit Home')).toBeInTheDocument();
        expect(router.getSearch()).toBe('page=2');
        router.back();
        await user.click(await screen.findByRole('button', { name: 'Edit About' }));

        // Edit: client validation, from the portable rules of the definition.
        const form = await screen.findByRole('form', { name: 'Edit page' });
        const english = within(form).getByLabelText('title title.en');
        expect(english).toHaveValue('About');
        expect(within(form).getByLabelText('title title.fr')).toHaveValue('À propos');
        expect(within(form).queryByLabelText(/published_at/)).not.toBeInTheDocument();
        await user.clear(english);
        await user.tab();
        expect(within(form).getByRole('alert')).toHaveTextContent('This field is required.');
        await user.click(within(form).getByRole('button', { name: 'Save' }));
        expect(within(form).getByText('Status: invalid, version 1')).toBeInTheDocument();

        // Server validation: an error keyed by dot path, shown next to its field.
        await user.type(english, 'Contact');
        await user.click(within(form).getByRole('button', { name: 'Save' }));
        expect(await within(form).findByRole('alert')).toHaveTextContent(
            'This title is already used.',
        );

        // Save: a partial update with If-Match, then the list shows the new title.
        await user.clear(english);
        await user.type(english, 'About us');
        expect(within(form).queryByRole('alert')).not.toBeInTheDocument();
        await user.click(within(form).getByRole('button', { name: 'Save' }));
        expect(await within(form).findByText('Status: submitted, version 2')).toBeInTheDocument();
        expect(await within(list).findByText('Edit About us')).toBeInTheDocument();
        const save = backend.requests.findLast((request) => request.method === 'PATCH');
        expect(save?.headers.get('If-Match')).toBe('"1"');
        expect(await save?.json()).toEqual({ title: { en: 'About us', fr: 'À propos' } });

        // Someone else saves the page meanwhile.
        await backend.fetch(`${BASE_URL}/resources/pages/2`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: { en: 'About them', fr: 'À propos d’eux' } }),
        });

        // Saving now gets a version conflict, with the current item.
        await user.type(english, '!');
        await user.click(within(form).getByRole('button', { name: 'Save' }));
        const dialog = await screen.findByRole('alertdialog', { name: 'Conflict' });
        expect(dialog).toHaveTextContent('Someone else saved this page (version 3).');
        expect(within(form).getByText('Status: conflict, version 2')).toBeInTheDocument();
        expect(backend.items('pages').find((page) => page.id === '2')).toMatchObject({
            version: '3',
            title: { en: 'About them' },
        });

        // Reload their version, then save on top of it.
        await user.click(within(dialog).getByRole('button', { name: 'Reload their version' }));
        expect(english).toHaveValue('About them');
        expect(within(form).getByText('Status: idle, version 3')).toBeInTheDocument();
        await user.type(english, ' and us');
        await user.click(within(form).getByRole('button', { name: 'Save' }));
        expect(await within(form).findByText('Status: submitted, version 4')).toBeInTheDocument();
        expect(await within(list).findByText('Edit About them and us')).toBeInTheDocument();
    });
});
