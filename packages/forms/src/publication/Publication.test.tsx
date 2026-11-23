import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Mock, afterEach, describe, expect, it, vi } from 'vitest';

import { PanneauProvider, definePlugin } from '@panneau/core';
import type { Field, LayoutNode } from '@panneau/protocol';

import { Form } from '../Form';
import { problemError, renderForm } from '../__fixtures__/render';
import { publicationPlugin } from './Publication';

const FIELDS: Field[] = [
    { name: 'title', type: 'text', label: 'Title' },
    { name: 'published', type: 'boolean', label: 'Published' },
    { name: 'published_at', type: 'datetime', label: 'Publication date' },
];

const LAYOUT: LayoutNode[] = [
    { type: 'field', name: 'title' },
    {
        type: 'component',
        component: 'publication',
        children: [
            { type: 'field', name: 'published' },
            { type: 'field', name: 'published_at' },
        ],
    },
];

function renderPublication(values: Record<string, unknown>, fields = FIELDS) {
    return renderForm(
        <PanneauProvider plugins={[definePlugin(publicationPlugin)]}>
            <Form fields={fields} layout={LAYOUT} values={values} />
        </PanneauProvider>,
    );
}

describe('Publication', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('frames its fields under the saved state, and says apart that it has changes', async () => {
        renderPublication({ published: false });
        const heading = screen.getByRole('heading', { name: /Publication/ });
        expect(heading).toHaveTextContent('Not published');
        expect(heading).not.toHaveTextContent('Unsaved changes');
        await userEvent.click(screen.getByRole('checkbox', { name: 'Published' }));
        // Nothing is saved yet: the item is still not published
        expect(heading.textContent).toBe('PublicationNot publishedUnsaved changes');
        await userEvent.click(screen.getByRole('checkbox', { name: 'Published' }));
        expect(heading).not.toHaveTextContent('Unsaved changes');
    });

    it('says the saved state until a save, then the new one', async () => {
        const onSubmit = vi.fn((values: Record<string, unknown>) =>
            Promise.resolve({ id: '1', version: '2', ...values }),
        );
        renderForm(
            <PanneauProvider plugins={[definePlugin(publicationPlugin)]}>
                <Form
                    fields={FIELDS}
                    layout={LAYOUT}
                    values={{
                        title: 'Hello',
                        published: true,
                        published_at: '2020-03-01T12:00:00Z',
                    }}
                    version="1"
                    onSubmit={onSubmit}
                />
            </PanneauProvider>,
        );
        const heading = screen.getByRole('heading', { name: /Publication/ });
        await userEvent.type(screen.getByRole('textbox', { name: 'Title' }), '!');
        // Other edits are not changes of the publication
        expect(heading.textContent).toBe('PublicationPublished');
        await userEvent.click(screen.getByRole('checkbox', { name: 'Published' }));
        expect(heading.textContent).toBe('PublicationPublishedUnsaved changes');
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(heading.textContent).toBe('PublicationNot published'));
    });

    it('becomes published when its scheduled date passes, without a reload', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-11-23T12:00:00Z'));
        const { unmount } = renderPublication({
            published: true,
            published_at: '2026-11-23T12:00:05Z',
        });
        const heading = screen.getByRole('heading', { name: /Publication/ });
        expect(heading).toHaveTextContent('Scheduled');
        act(() => {
            vi.advanceTimersByTime(4000);
        });
        expect(heading).toHaveTextContent('Scheduled');
        act(() => {
            vi.advanceTimersByTime(1000);
        });
        expect(heading).toHaveTextContent('Published');
        expect(vi.getTimerCount()).toBe(0);
        unmount();
    });

    it('clears its timer when it goes away', () => {
        vi.useFakeTimers();
        const { unmount } = renderPublication({
            published: true,
            published_at: '2999-03-01T12:00:00Z',
        });
        expect(vi.getTimerCount()).toBe(1);
        unmount();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('says when an item is published, or will be', () => {
        const { unmount } = renderPublication({
            published: true,
            published_at: '2020-03-01T12:00:00Z',
        });
        expect(screen.getByRole('region', { name: /Publication/ }).textContent).toMatch(
            /Published on Mar 1, 2020/,
        );
        unmount();
        renderPublication({ published: true, published_at: '2999-03-01T12:00:00Z' });
        expect(screen.getByRole('region', { name: /Publication/ }).textContent).toMatch(
            /Scheduled.*Will be published on Mar 1, 2999/,
        );
    });

    it('takes the label and the tone of the status', () => {
        renderForm(
            <PanneauProvider plugins={[definePlugin(publicationPlugin)]}>
                <Form
                    fields={[
                        ...FIELDS,
                        {
                            name: 'status',
                            type: 'select',
                            label: 'Status',
                            options: [{ value: 'review', label: 'In review', tone: 'warning' }],
                        },
                    ]}
                    layout={[
                        {
                            type: 'component',
                            component: 'publication',
                            children: [{ type: 'field', name: 'status' }],
                        },
                    ]}
                    values={{ status: 'review' }}
                />
            </PanneauProvider>,
        );
        expect(screen.getByRole('heading', { name: /Publication/ })).toHaveTextContent('In review');
    });
});

describe('PublicationPanel', () => {
    const STATUS_FIELDS: Field[] = [
        { name: 'title', type: 'text', label: 'Title' },
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
    ];
    const PANEL_LAYOUT: LayoutNode[] = [
        { type: 'field', name: 'title' },
        {
            type: 'sidebar',
            panel: 'publication',
            label: 'Publication',
            children: [
                { type: 'field', name: 'status' },
                { type: 'field', name: 'published_at' },
            ],
        },
    ];

    function renderPanel(
        values: Record<string, unknown>,
        fields: Field[],
        layout = PANEL_LAYOUT,
        {
            onSubmit = vi.fn((submitted: Record<string, unknown>) =>
                Promise.resolve<unknown>(submitted),
            ),
            version,
        }: {
            onSubmit?: Mock<(values: Record<string, unknown>) => Promise<unknown>>;
            version?: string;
        } = {},
    ) {
        renderForm(
            <PanneauProvider plugins={[definePlugin(publicationPlugin)]}>
                <Form
                    fields={fields}
                    layout={layout}
                    values={values}
                    onSubmit={onSubmit}
                    {...(version !== undefined ? { version } : {})}
                />
            </PanneauProvider>,
        );
        return { onSubmit, panel: screen.getByRole('region', { name: 'Sidebar' }) };
    }

    it('publishes with the status, dates it now when it has no date, and saves', async () => {
        const { onSubmit, panel } = renderPanel(
            { title: 'Hello', status: 'draft', published_at: null },
            STATUS_FIELDS,
        );
        expect(panel.querySelector('.panneau-badge')).toHaveTextContent('Draft');
        await userEvent.click(within(panel).getByRole('button', { name: 'Publish' }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
        const submitted = onSubmit.mock.calls[0]?.[0] ?? {};
        expect(submitted.status).toBe('published');
        expect(submitted.published_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
        expect(await within(panel).findByRole('button', { name: 'Unpublish' })).toBeInTheDocument();
    });

    it('unpublishes to the draft status, and keeps the date', async () => {
        const { onSubmit, panel } = renderPanel(
            { title: 'Hello', status: 'published', published_at: '2026-01-02T10:00:00Z' },
            STATUS_FIELDS,
        );
        await userEvent.click(within(panel).getByRole('button', { name: 'Unpublish' }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
        expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
            status: 'draft',
            published_at: '2026-01-02T10:00:00Z',
        });
    });

    it('publishes with a published field first', async () => {
        const layout: LayoutNode[] = [
            { type: 'field', name: 'title' },
            {
                type: 'sidebar',
                panel: 'publication',
                children: [
                    { type: 'field', name: 'published' },
                    { type: 'field', name: 'published_at' },
                ],
            },
        ];
        const { onSubmit, panel } = renderPanel(
            { title: 'Hello', published: false },
            FIELDS,
            layout,
        );
        await userEvent.click(within(panel).getByRole('button', { name: 'Publish' }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
        expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ published: true });
    });

    it('publishes an item saved without other changes', async () => {
        const onSubmit = vi.fn((submitted: Record<string, unknown>) =>
            Promise.resolve({ id: '1', version: '2', ...submitted }),
        );
        const { panel } = renderPanel(
            { title: 'Hello', status: 'draft', published_at: null },
            STATUS_FIELDS,
            PANEL_LAYOUT,
            { onSubmit, version: '1' },
        );
        await userEvent.click(within(panel).getByRole('button', { name: 'Publish' }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
        expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({ status: 'published' });
        expect(await within(panel).findByRole('button', { name: 'Unpublish' })).toBeVisible();
        expect(panel.querySelector('.panneau-badge')).toHaveTextContent('Published');
        expect(panel).not.toHaveTextContent('Unsaved changes');
    });

    it('puts the publication back when the save is refused, and keeps the other edits', async () => {
        const onSubmit = vi.fn((_values: Record<string, unknown>) =>
            Promise.reject(problemError({ status: 422, errors: { title: ['Too short.'] } })),
        );
        const { panel } = renderPanel(
            { title: 'Hello', status: 'draft', published_at: null },
            STATUS_FIELDS,
            PANEL_LAYOUT,
            { onSubmit, version: '1' },
        );
        const title = screen.getByRole('textbox', { name: 'Title' });
        await userEvent.clear(title);
        await userEvent.type(title, 'Hi');
        await userEvent.click(within(panel).getByRole('button', { name: 'Publish' }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
        expect(onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({ title: 'Hi', status: 'published' }),
            expect.anything(),
        );
        await waitFor(() =>
            expect(within(panel).getByRole('button', { name: /Status/ })).toHaveTextContent(
                'Draft',
            ),
        );
        expect(title).toHaveValue('Hi');
        expect(within(panel).getByRole('button', { name: 'Publish' })).toBeVisible();
        expect(panel).not.toHaveTextContent('Unsaved changes');
        // What the form holds now: the other edits, and the publication as it was
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
        expect(onSubmit.mock.calls[1]?.[0]).toEqual({
            title: 'Hi',
            status: 'draft',
            published_at: null,
        });
    });

    it('puts the publication back when the values are invalid, before any request', async () => {
        const onSubmit = vi.fn((submitted: Record<string, unknown>) => Promise.resolve(submitted));
        const { panel } = renderPanel(
            { title: 'Hello', published: false, published_at: null },
            [
                { name: 'title', type: 'text', label: 'Title', rules: [{ rule: 'required' }] },
                ...FIELDS.slice(1),
            ],
            [
                { type: 'field', name: 'title' },
                {
                    type: 'sidebar',
                    panel: 'publication',
                    children: [
                        { type: 'field', name: 'published' },
                        { type: 'field', name: 'published_at' },
                    ],
                },
            ],
            { onSubmit, version: '1' },
        );
        await userEvent.clear(screen.getByRole('textbox', { name: /Title/ }));
        await userEvent.click(within(panel).getByRole('button', { name: 'Publish' }));
        await waitFor(() =>
            expect(screen.getByRole('textbox', { name: /Title/ })).toHaveAccessibleDescription(
                'This field is required.',
            ),
        );
        expect(onSubmit).not.toHaveBeenCalled();
        expect(within(panel).getByRole('checkbox', { name: 'Published' })).not.toBeChecked();
        expect(screen.getByRole('textbox', { name: /Title/ })).toHaveValue('');
        expect(panel).not.toHaveTextContent('Unsaved changes');
    });

    it('has no button without a published field nor a published status', () => {
        const { panel } = renderPanel(
            { title: 'Hello' },
            [{ name: 'title', type: 'text', label: 'Title' }],
            [{ type: 'sidebar', panel: 'publication' }],
        );
        expect(within(panel).queryByRole('button', { name: 'Publish' })).toBeNull();
        expect(within(panel).getByText('Not published')).toBeInTheDocument();
    });
});
