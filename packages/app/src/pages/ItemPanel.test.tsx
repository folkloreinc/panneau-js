import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { PanneauProvider, type PreviewProps, resolveResource } from '@panneau/core';
import { createRestAdapter } from '@panneau/data';
import { DataAdapterProvider } from '@panneau/data/query';
import { type ResourceInput, validateDefinition } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';
import { PanneauRoot } from '@panneau/ui';

import { ItemPanel } from './ItemPanel';

function PagePreview({ item, locale }: PreviewProps) {
    return <p>{`${String(item.title)} as the site shows it, in ${locale}`}</p>;
}

function renderPanel(preview: ResourceInput['features']) {
    const input = {
        protocol: 1 as const,
        name: 'Site',
        locale: 'en',
        locales: ['en'],
        api: { baseUrl: '/api' },
        resources: [
            {
                id: 'pages',
                label: { singular: 'page', plural: 'pages' },
                itemTitle: 'title',
                fields: [{ name: 'title', type: 'text', label: 'Title' }],
                features: preview,
            },
        ],
    };
    const result = validateDefinition(input);
    const resource = result.success ? result.data.resources[0] : undefined;
    if (resource === undefined) {
        throw new Error('Invalid definition.');
    }
    const backend = createMockBackend({
        definition: input,
        items: { pages: [{ id: '1', title: 'About us' }] },
        previewUrl: ({ item }) => `https://example.com/preview/${item.id}`,
    });
    render(
        <PanneauRoot>
            <QueryClientProvider
                client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
            >
                <DataAdapterProvider
                    adapter={createRestAdapter({ baseUrl: '/api', fetch: backend.fetch })}
                >
                    <PanneauProvider plugins={[{ id: 'site', previews: { page: PagePreview } }]}>
                        <ItemPanel
                            resolved={resolveResource(resource)}
                            basePath="/admin"
                            locale="en"
                            id="1"
                            closeHref="/admin/resources/pages"
                        />
                    </PanneauProvider>
                </DataAdapterProvider>
            </QueryClientProvider>
        </PanneauRoot>,
    );
    return screen.getByRole('region', { name: 'Details of the page' });
}

describe('ItemPanel', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('shows only the details without a preview', async () => {
        const panel = renderPanel(undefined);
        expect(await within(panel).findByRole('heading', { name: 'About us' })).toBeInTheDocument();
        expect(within(panel).queryByRole('tab')).toBeNull();
        expect(within(panel).getByRole('term')).toHaveTextContent('Title');
    });

    it('draws the skeleton of the details while the item loads', async () => {
        const panel = renderPanel(undefined);
        expect(within(panel).getByRole('status')).toHaveTextContent('Loading the item…');
        expect(within(panel).queryByRole('heading')).toBeNull();
        expect(panel.querySelector('[aria-busy="true"] dd .panneau-skeleton')).not.toBeNull();
        expect(await within(panel).findByRole('heading', { name: 'About us' })).toBeInTheDocument();
        expect(panel.querySelector('[aria-busy="true"]')).toBeNull();
    });

    it('draws a block in the frame of the preview while it loads', async () => {
        const panel = renderPanel({ preview: { mode: 'iframe' } });
        expect(within(panel).getByRole('tab', { name: 'Preview' })).toBeInTheDocument();
        expect(await within(panel).findByText('Loading the preview…')).toHaveAttribute(
            'role',
            'status',
        );
        expect(await within(panel).findByTitle('Preview of “About us”')).toBeInTheDocument();
    });

    it('opens on the preview of a plugin component, next to the details', async () => {
        const user = userEvent.setup();
        const panel = renderPanel({ preview: { mode: 'component', component: 'page' } });
        expect(
            await within(panel).findByText('About us as the site shows it, in en'),
        ).toBeInTheDocument();
        expect(within(panel).getByRole('tab', { name: 'Preview' })).toHaveAttribute(
            'aria-selected',
            'true',
        );
        await user.click(within(panel).getByRole('tab', { name: 'Details' }));
        expect(within(panel).getByRole('term')).toHaveTextContent('Title');
        // The tab is remembered.
        expect(window.localStorage.getItem('panneau:item-panel-tab')).toBe('details');
    });

    it('says when no plugin provides the preview', async () => {
        const panel = renderPanel({ preview: { mode: 'component', component: 'missing' } });
        expect(
            await within(panel).findByText('No plugin provides the preview “missing”.'),
        ).toBeInTheDocument();
    });

    it('shows the page of the site in an iframe, from the preview URL of the backend', async () => {
        const panel = renderPanel({ preview: { mode: 'iframe' } });
        const frame = await within(panel).findByTitle('Preview of “About us”');
        expect(frame).toHaveAttribute('src', 'https://example.com/preview/1');
        expect(within(panel).getByRole('link', { name: 'Open in a new tab' })).toHaveAttribute(
            'href',
            'https://example.com/preview/1',
        );
    });

    it('widens, and remembers it', async () => {
        const user = userEvent.setup();
        const panel = renderPanel(undefined);
        await user.click(within(panel).getByRole('button', { name: 'Widen the details' }));
        expect(panel).toHaveAttribute('data-wide');
        expect(window.localStorage.getItem('panneau:item-panel-size')).toBe('wide');
        expect(
            within(panel).getByRole('button', { name: 'Narrow the details' }),
        ).toBeInTheDocument();
    });
});
