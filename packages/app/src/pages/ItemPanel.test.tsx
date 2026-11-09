import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { ActionRunnerProvider } from '@panneau/actions';
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

function renderPanel(
    preview: ResourceInput['features'],
    {
        fields = [],
        values = {},
        kind,
    }: {
        fields?: ResourceInput['fields'];
        values?: Record<string, unknown>;
        kind?: string;
    } = {},
) {
    const input = {
        protocol: 1 as const,
        name: 'Site',
        locale: 'en',
        locales: ['en'],
        api: { baseUrl: '/api' },
        resources: [
            {
                id: 'pages',
                ...(kind !== undefined ? { kind } : {}),
                label: { singular: 'page', plural: 'pages' },
                itemTitle: 'title',
                fields: [{ name: 'title', type: 'text', label: 'Title' }, ...fields],
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
        items: { pages: [{ id: '1', title: 'About us', ...values }] },
        previewUrl: ({ item }) => `https://example.com/preview/${item.id}`,
    });
    const adapter = createRestAdapter({ baseUrl: '/api', fetch: backend.fetch });
    render(
        <PanneauRoot>
            <QueryClientProvider
                client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
            >
                <DataAdapterProvider adapter={adapter}>
                    <ActionRunnerProvider adapter={adapter}>
                        <PanneauProvider
                            plugins={[{ id: 'site', previews: { page: PagePreview } }]}
                        >
                            <ItemPanel
                                resolved={resolveResource(resource)}
                                basePath="/admin"
                                locale="en"
                                id="1"
                                closeHref="/admin/resources/pages"
                            />
                        </PanneauProvider>
                    </ActionRunnerProvider>
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

    it('shows the image of a media over its details', async () => {
        const panel = renderPanel(undefined, {
            kind: 'media',
            fields: [{ name: 'file', type: 'file', label: 'File' }],
            values: {
                file: {
                    name: 'about.heic',
                    url: 'https://example.com/about.heic',
                    mime: 'image/heic',
                },
                media: {
                    type: 'image',
                    url: 'https://example.com/about.heic',
                    thumbnailUrl: 'https://example.com/about.jpg',
                },
            },
        });
        await within(panel).findByRole('heading', { name: 'About us' });
        // The image of the media, and not the original, which browsers don't show
        expect(panel.querySelectorAll('img')).toHaveLength(1);
        expect(panel.querySelector('img')).toHaveAttribute('src', 'https://example.com/about.jpg');
        expect(within(panel).getByRole('link', { name: 'about.heic' })).toHaveAttribute(
            'href',
            'https://example.com/about.heic',
        );
    });

    it('shows no image for the items of other resources', async () => {
        const panel = renderPanel(undefined, {
            values: { media: { type: 'image', thumbnailUrl: 'https://example.com/about.jpg' } },
        });
        await within(panel).findByRole('heading', { name: 'About us' });
        expect(panel.querySelector('img')).toBeNull();
    });

    it('lists the values of a group under its label, and leaves repeaters to the form', async () => {
        const panel = renderPanel(undefined, {
            fields: [
                {
                    name: 'contact',
                    type: 'group',
                    label: 'Contact',
                    fields: [
                        { name: 'name', type: 'text', label: 'Name' },
                        { name: 'email', type: 'email', label: 'Email' },
                    ],
                },
                {
                    name: 'links',
                    type: 'repeater',
                    label: 'Links',
                    fields: [{ name: 'url', type: 'url', label: 'URL' }],
                },
            ],
            values: {
                contact: { name: 'Ada Lovelace', email: 'ada@example.com' },
                links: [{ url: 'https://example.com' }],
            },
        });
        expect(await within(panel).findByRole('heading', { name: 'About us' })).toBeInTheDocument();
        expect(
            within(panel)
                .getAllByRole('term')
                .map((term) => term.textContent),
        ).toEqual(['Title', 'Contact', 'Name', 'Email']);
        const contact = within(panel).getAllByRole('definition')[1];
        expect(contact).toHaveTextContent('Ada Lovelace');
        expect(contact).toHaveTextContent('ada@example.com');
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
        await user.click(within(panel).getByRole('button', { name: 'Widen the panel' }));
        expect(panel).toHaveAttribute('data-wide');
        expect(window.localStorage.getItem('panneau:item-panel-size')).toBe('wide');
        expect(within(panel).getByRole('button', { name: 'Narrow the panel' })).toBeInTheDocument();
    });
});
