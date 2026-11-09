/**
 * The frame of the app with a dock (decision 0075): a bar at the top with the site, the page on a
 * raised panel, and the `main` menu of a definition in a dock at the bottom of the window. Below
 * the `lg` width, the dock is a bar of tabs, with "More" for the entries that don't fit.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RouterProvider } from 'react-aria-components';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ActionRunnerProvider } from '@panneau/actions';
import { createRestAdapter } from '@panneau/data';
import { DataAdapterProvider } from '@panneau/data/query';
import { type DefinitionInput, validateDefinition } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';
import { Heading, Stack, Text } from '@panneau/ui';

import { DockLayout } from './DockLayout';
import type { ColorSchemePreference } from './Sidebar';

const input: DefinitionInput = {
    protocol: 1,
    name: 'Northwind Journal',
    locale: 'en',
    locales: ['en'],
    api: { baseUrl: '/api' },
    resources: ['pages', 'articles', 'categories', 'authors', 'media'].map((id) => ({
        id,
        label: { singular: id.replace(/s$/, ''), plural: id },
        fields: [],
    })),
    menus: {
        main: [
            { type: 'resource', resource: 'articles', icon: 'newspaper' },
            { type: 'resource', resource: 'pages', icon: 'files' },
            { type: 'resource', resource: 'media', label: 'Media', icon: 'image' },
            {
                type: 'group',
                label: 'Settings',
                icon: 'settings',
                children: [
                    { type: 'resource', resource: 'categories' },
                    { type: 'resource', resource: 'authors' },
                ],
            },
            { type: 'separator' },
            { type: 'link', label: 'View the site', url: 'https://example.com', external: true },
        ],
    },
    theme: { navigation: 'dock' },
    user: { id: '1', name: 'Ada Lovelace', email: 'ada@example.com' },
};

function getDefinition() {
    const result = validateDefinition(input);
    if (!result.success) {
        throw new Error(JSON.stringify(result.issues));
    }
    return result.data;
}

function createData() {
    const backend = createMockBackend({ definition: input });
    return {
        adapter: createRestAdapter({ baseUrl: '/api', fetch: backend.fetch }),
        client: new QueryClient({ defaultOptions: { queries: { retry: false } } }),
    };
}

function Layout({ onLogOut }: { onLogOut?: () => void }) {
    const [colorScheme, setColorScheme] = useState<ColorSchemePreference>('light');
    // The "Go to…" palette searches through the data adapter.
    const [{ adapter, client }] = useState(createData);
    return (
        <QueryClientProvider client={client}>
            <DataAdapterProvider adapter={adapter}>
                <RouterProvider navigate={() => undefined}>
                    <ActionRunnerProvider adapter={adapter}>
                        <DockLayout
                            definition={getDefinition()}
                            basePath="/admin"
                            route={{ name: 'resource.index', resource: 'articles' }}
                            colorScheme={colorScheme}
                            onColorSchemeChange={setColorScheme}
                            onLogOut={onLogOut}
                        >
                            <Stack gap={4}>
                                <Heading level={1}>Articles</Heading>
                                {Array.from({ length: 12 }, (_, index) => (
                                    <Text key={index} muted>
                                        The page of the current route scrolls under the dock.
                                    </Text>
                                ))}
                            </Stack>
                        </DockLayout>
                    </ActionRunnerProvider>
                </RouterProvider>
            </DataAdapterProvider>
        </QueryClientProvider>
    );
}

const meta = {
    title: 'App/Dock layout',
    component: Layout,
    parameters: { layout: 'fullscreen' },
    args: { onLogOut: fn() },
} satisfies Meta<typeof Layout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const navigation = within(canvas.getByRole('navigation', { name: 'Main navigation' }));
        await expect(navigation.getByRole('link', { name: 'Articles' })).toHaveAttribute(
            'aria-current',
            'page',
        );
        await expect(canvas.getByRole('banner')).toHaveTextContent('Northwind Journal');
    },
};

/** A group of the menu opens its links in a menu, upwards. */
export const Group: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const settings = canvas.queryByRole('button', { name: 'Settings' });
        // In the pill only: on a phone, the group is in "More".
        if (settings !== null && settings.checkVisibility()) {
            await userEvent.click(settings);
            const menu = await body.findByRole('menu', { name: 'Settings' });
            await expect(within(menu).getByRole('menuitem', { name: 'Authors' })).toHaveAttribute(
                'href',
                '/admin/resources/authors',
            );
        }
    },
};

/** The user's menu: the color scheme, and "Log out". */
export const UserMenu: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Ada Lovelace' }));
        const menu = await body.findByRole('menu', { name: 'Ada Lovelace' });
        await expect(within(menu).getByRole('menuitemradio', { name: 'Light' })).toHaveAttribute(
            'aria-checked',
            'true',
        );
        await userEvent.click(within(menu).getByRole('menuitem', { name: 'Log out' }));
        await expect(args.onLogOut).toHaveBeenCalledTimes(1);
    },
};

/** On a phone: a bar of tabs, with the first entries and "More" for the others. */
export const Phone: Story = {
    globals: { viewport: { value: 'mobile1' } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const more = canvas.queryByRole('button', { name: 'More' });
        // Only shown below the `lg` width of the root.
        if (more !== null && more.checkVisibility()) {
            await userEvent.click(more);
            const menu = await body.findByRole('menu', { name: 'More' });
            await expect(
                within(menu).getByRole('menuitem', { name: 'Categories' }),
            ).toBeInTheDocument();
        }
    },
};

/** "Go to…" opens the command palette, with the navigation and the app's actions. */
export const GoTo: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const goTo = canvas
            .getAllByRole('button', { name: /Go to…/ })
            .find((button) => button.checkVisibility());
        if (goTo === undefined) {
            throw new Error('No visible "Go to…" button.');
        }
        await userEvent.click(goTo);
        const field = await body.findByRole('searchbox', { name: 'Go to…' });
        await userEvent.type(field, 'arti');
        await expect(body.getByRole('menuitem', { name: 'Articles' })).toBeInTheDocument();
        await expect(
            body.queryByRole('menuitem', { name: 'Collapse the sidebar' }),
        ).not.toBeInTheDocument();
    },
};
