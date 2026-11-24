import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createRestAdapter } from '@panneau/data';
import { type DefinitionInput, validateBootConfig } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';

import { Panneau } from '../Panneau';
import { createBootConfig, createDefinition } from '../__fixtures__/definition';

const definition: DefinitionInput = createDefinition({
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
                { name: 'tags', type: 'relation', resource: 'tags', multiple: true, label: 'Tags' },
                { name: 'venue', type: 'relation', resource: 'venues', label: 'Venue' },
            ],
        },
        {
            id: 'venues',
            label: { singular: 'venue', plural: 'venues' },
            itemTitle: 'name',
            fields: [
                { name: 'name', type: 'text', label: 'Name' },
                {
                    name: 'type',
                    type: 'select',
                    notInForm: true,
                    options: [
                        { value: 'hall', label: 'Hall' },
                        { value: 'park', label: 'Park' },
                        { value: 'stage', label: 'Stage' },
                    ],
                },
            ],
            types: [
                {
                    id: 'hall',
                    label: 'Hall',
                    fields: [{ name: 'seats', type: 'number', label: 'Seats' }],
                },
                { id: 'park', label: 'Park', fields: [], abilities: { create: false } },
                { id: 'stage', label: 'Stage', fields: [] },
            ],
        },
        {
            id: 'people',
            label: { singular: 'person', plural: 'people' },
            itemTitle: 'name',
            fields: [
                { name: 'name', type: 'text', label: 'Name' },
                { name: 'mentor', type: 'relation', resource: 'people', label: 'Mentor' },
            ],
        },
        {
            id: 'tags',
            label: { singular: 'tag', plural: 'tags' },
            itemTitle: 'name',
            fields: [{ name: 'name', type: 'text', label: 'Name' }],
            // The user can't create tags (decision 0046)
            abilities: { viewAny: true, create: false },
        },
    ],
});

/** The app on the create form of an article, over the mock backend, and the items it posts. */
function renderCreateForm() {
    const backend = createMockBackend({
        definition,
        items: { people: [{ id: '1', name: 'Ada' }], tags: [{ id: '1', name: 'Science' }] },
    });
    const posts: { path: string; body: Record<string, unknown> }[] = [];
    const result = validateBootConfig(createBootConfig({ definition }));
    if (!result.success) {
        throw new Error(JSON.stringify(result.issues));
    }
    render(
        <Panneau
            config={result.data}
            adapter={createRestAdapter({
                baseUrl: '/panneau/api',
                fetch: async (input, init) => {
                    const url = new URL(String(input), 'http://localhost');
                    if (init?.method === 'POST') {
                        const body = JSON.parse(String(init.body)) as Record<string, unknown>;
                        posts.push({ path: url.pathname, body });
                        // The backend refuses a name that is taken
                        if (body.name === 'Ada') {
                            return Response.json(
                                {
                                    type: 'about:blank',
                                    title: 'The given data was invalid.',
                                    status: 422,
                                    errors: { name: ['This name is taken.'] },
                                },
                                {
                                    status: 422,
                                    headers: { 'Content-Type': 'application/problem+json' },
                                },
                            );
                        }
                    }
                    return backend.fetch(input, init);
                },
            })}
            queryClient={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
            iconLoader={null}
            onUnauthorized={vi.fn()}
        />,
    );
    return { posts };
}

/** Types in the picker of a field, and creates an item from the text: the panel opens. */
async function createFrom(
    user: ReturnType<typeof userEvent.setup>,
    field: string,
    text: string,
    panel = 'New person',
) {
    await user.type(await screen.findByRole('combobox', { name: field }), text);
    await user.click(await screen.findByRole('option', { name: `Create “${text}”` }));
    return within(await screen.findByRole('dialog', { name: panel }));
}

describe('RelatedItemPanel', () => {
    beforeEach(() => {
        window.history.replaceState(null, '', '/panneau/resources/articles/create');
    });

    it('creates the item of a field in a panel, and keeps the unsaved values of the page', async () => {
        const user = userEvent.setup();
        const { posts } = renderCreateForm();
        await user.type(await screen.findByRole('textbox', { name: 'Title' }), 'Draft');

        const panel = await createFrom(user, 'Authors', 'Grace');
        // The whole form of the resource, with the text as its title
        expect(await panel.findByRole('textbox', { name: 'Name' })).toHaveValue('Grace');
        expect(panel.getByRole('combobox', { name: 'Mentor' })).toBeInTheDocument();
        await user.type(panel.getByRole('textbox', { name: 'Name' }), ' Hopper');
        await user.click(panel.getByRole('button', { name: 'Save' }));

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(posts).toEqual([
            {
                path: '/panneau/api/resources/people',
                body: expect.objectContaining({ name: 'Grace Hopper' }) as unknown,
            },
        ]);
        // Added to the relation, with the focus back on the field
        expect(await screen.findByLabelText('Remove Grace Hopper')).toBeInTheDocument();
        await waitFor(() =>
            expect(screen.getByRole('combobox', { name: 'Authors' })).toHaveFocus(),
        );
        // The page keeps its values, unsaved (its picker shows its options again, with the focus)
        expect(screen.getByLabelText('Title')).toHaveValue('Draft');
        expect(document.title).toMatch(/^• New article/);
    });

    it('shows the errors of a refused create in the panel, and adds nothing', async () => {
        const user = userEvent.setup();
        renderCreateForm();
        const panel = await createFrom(user, 'Authors', 'Ad');
        await user.type(await panel.findByRole('textbox', { name: 'Name' }), 'a');
        await user.click(panel.getByRole('button', { name: 'Save' }));

        expect(await panel.findByRole('textbox', { name: 'Name' })).toHaveAccessibleDescription(
            'This name is taken.',
        );
        expect(screen.getByRole('dialog', { name: 'New person' })).toBeInTheDocument();
        // Closing it with unsaved changes asks first
        await user.click(panel.getByRole('button', { name: 'Cancel' }));
        await user.click(await screen.findByRole('button', { name: 'Leave' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(screen.queryByLabelText(/^Remove Ad/)).not.toBeInTheDocument();
    });

    it('asks before closing with unsaved changes, and closes at once without', async () => {
        const user = userEvent.setup();
        renderCreateForm();
        let panel = await createFrom(user, 'Authors', 'Lin');
        // The text alone isn't a change
        await panel.findByRole('textbox', { name: 'Name' });
        await user.keyboard('{Escape}');
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

        await user.clear(screen.getByRole('combobox', { name: 'Authors' }));
        panel = await createFrom(user, 'Authors', 'Lin');
        await user.type(await panel.findByRole('textbox', { name: 'Name' }), ' Bo');
        await user.keyboard('{Escape}');
        const confirm = within(
            await screen.findByRole('alertdialog', { name: 'Leave without saving?' }),
        );
        await user.click(confirm.getByRole('button', { name: 'Stay' }));
        expect(screen.getByRole('dialog', { name: 'New person' })).toBeInTheDocument();
        expect(panel.getByRole('textbox', { name: 'Name' })).toHaveValue('Lin Bo');

        await user.click(panel.getByRole('button', { name: 'Close' }));
        await user.click(await screen.findByRole('button', { name: 'Leave' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(screen.queryByLabelText(/^Remove Lin/)).not.toBeInTheDocument();
    });

    it('asks for the type of the item first, among those the user can create', async () => {
        const user = userEvent.setup();
        const { posts } = renderCreateForm();
        const panel = await createFrom(user, 'Venue', 'Main', 'New venue');
        expect(panel.getByText('Which type of venue?')).toBeInTheDocument();
        expect(panel.queryByRole('button', { name: 'Park' })).not.toBeInTheDocument();
        await user.click(panel.getByRole('button', { name: 'Hall' }));

        expect(panel.getByRole('heading', { name: 'New Hall' })).toBeInTheDocument();
        expect(await panel.findByRole('textbox', { name: 'Name' })).toHaveValue('Main');
        expect(panel.getByRole('textbox', { name: 'Seats' })).toBeInTheDocument();
        await user.click(panel.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(posts).toEqual([
            {
                path: '/panneau/api/resources/venues',
                body: expect.objectContaining({ name: 'Main', type: 'hall' }) as unknown,
            },
        ]);
        expect(await screen.findByRole('link', { name: 'Main' })).toBeInTheDocument();
    });

    it('offers no "Create …" in a resource where the user can’t create', async () => {
        const user = userEvent.setup();
        renderCreateForm();
        await user.type(await screen.findByRole('combobox', { name: 'Tags' }), 'News');
        await screen.findByRole('listbox');
        await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
        expect(screen.queryByRole('option', { name: /Create/ })).not.toBeInTheDocument();
    });

    it('goes one level deep: no "Create …" in the panel, and its cards open in a new tab', async () => {
        const user = userEvent.setup();
        renderCreateForm();
        const panel = await createFrom(user, 'Authors', 'Grace');
        const mentor = panel.getByRole('combobox', { name: 'Mentor' });
        await user.type(mentor, 'Hedy');
        await screen.findByRole('listbox');
        await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
        expect(screen.queryByRole('option', { name: /Create/ })).not.toBeInTheDocument();

        await user.clear(mentor);
        await user.type(mentor, 'Ad');
        await user.click(await screen.findByRole('option', { name: 'Ada' }));
        const link = await panel.findByRole('link', { name: 'Ada' });
        expect(link).toHaveAttribute('href', '/panneau/resources/people/1');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('saves the form of the panel with ⌘ S, not the form of the page', async () => {
        const user = userEvent.setup();
        const { posts } = renderCreateForm();
        await user.type(await screen.findByRole('textbox', { name: 'Title' }), 'Draft');
        const panel = await createFrom(user, 'Authors', 'Grace');
        await user.click(await panel.findByRole('textbox', { name: 'Name' }));
        await user.keyboard('{Control>}s{/Control}');

        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        expect(posts.map((post) => post.path)).toEqual(['/panneau/api/resources/people']);
        expect(await screen.findByLabelText('Remove Grace')).toBeInTheDocument();
    });
});
