import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PanneauProvider, definePlugin } from '@panneau/core';
import type { Field, LayoutNode } from '@panneau/protocol';

import { Form } from '../Form';
import { renderForm } from '../__fixtures__/render';
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
    it('frames its fields under the state of the publication', async () => {
        renderPublication({ published: false });
        const section = screen.getByRole('region', { name: /Publication/ });
        expect(section).toHaveTextContent('Not published');
        await userEvent.click(screen.getByRole('checkbox', { name: 'Published' }));
        expect(section).toHaveTextContent('Published');
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

    function renderPanel(values: Record<string, unknown>, fields: Field[], layout = PANEL_LAYOUT) {
        const onSubmit = vi.fn((submitted: Record<string, unknown>) => Promise.resolve(submitted));
        renderForm(
            <PanneauProvider plugins={[definePlugin(publicationPlugin)]}>
                <Form fields={fields} layout={layout} values={values} onSubmit={onSubmit} />
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
