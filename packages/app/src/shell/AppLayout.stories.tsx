/**
 * The frame of the app: the sidebar from the `main` menu of a definition, collapsible to a rail of
 * icons, and the page on a raised panel. Below the `lg` width, a bar opens the sidebar as a drawer.
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
import { Heading, Text } from '@panneau/ui';

import { AppLayout } from './AppLayout';
import type { ColorSchemePreference } from './Sidebar';

const input: DefinitionInput = {
    protocol: 1,
    name: 'Northwind Journal',
    locale: 'en',
    locales: ['en'],
    // The languages of the interface, with a switcher (decision 0082)
    interfaceLocales: [
        { locale: 'en', label: 'English', url: '/admin/api/locale/en' },
        { locale: 'fr', label: 'Français', url: '/admin/api/locale/fr' },
    ],
    api: { baseUrl: '/api' },
    resources: ['pages', 'articles', 'categories', 'authors', 'tags', 'redirects'].map((id) => ({
        id,
        label: { singular: id.slice(0, -1), plural: id },
        fields: [],
    })),
    menus: {
        main: [
            {
                // Collapsible, open: it holds the current page (decision 0079)
                type: 'group',
                label: 'Content',
                collapsible: true,
                children: [
                    { type: 'resource', resource: 'pages' },
                    { type: 'resource', resource: 'articles', emphasis: true },
                    { type: 'resource', resource: 'categories' },
                ],
            },
            {
                type: 'group',
                label: 'People',
                children: [{ type: 'resource', resource: 'authors' }],
            },
            {
                // Rarely opened: closed until the user opens it
                type: 'group',
                label: 'Settings',
                collapsed: true,
                children: [
                    { type: 'resource', resource: 'tags' },
                    { type: 'resource', resource: 'redirects' },
                ],
            },
            { type: 'separator' },
            { type: 'link', label: 'View the site', url: 'https://example.com', external: true },
        ],
    },
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

function Layout({
    onLogOut,
    onLocaleChange,
}: {
    onLogOut?: () => void;
    onLocaleChange?: (locale: string) => void;
}) {
    const [colorScheme, setColorScheme] = useState<ColorSchemePreference>('light');
    // The "Go to…" palette searches through the data adapter.
    const [{ adapter, client }] = useState(createData);
    return (
        <QueryClientProvider client={client}>
            <DataAdapterProvider adapter={adapter}>
                <RouterProvider navigate={() => undefined}>
                    <ActionRunnerProvider adapter={adapter}>
                        <AppLayout
                            definition={getDefinition()}
                            basePath="/admin"
                            route={{ name: 'resource.index', resource: 'articles' }}
                            colorScheme={colorScheme}
                            onColorSchemeChange={setColorScheme}
                            onLogOut={onLogOut}
                            onLocaleChange={onLocaleChange}
                        >
                            <Heading level={1}>Articles</Heading>
                            <Text muted>The page of the current route.</Text>
                        </AppLayout>
                    </ActionRunnerProvider>
                </RouterProvider>
            </DataAdapterProvider>
        </QueryClientProvider>
    );
}

const meta = {
    title: 'App/Layout',
    component: Layout,
    parameters: { layout: 'fullscreen' },
    args: { onLogOut: fn(), onLocaleChange: fn() },
    beforeEach: () => {
        window.localStorage.removeItem('panneau:sidebar');
        window.localStorage.removeItem('panneau:nav-group:Content');
        window.localStorage.removeItem('panneau:nav-group:Settings');
    },
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
    },
};

/**
 * Collapsible groups and an emphasized entry (decision 0079): "Settings" starts closed, "Content"
 * starts open as it holds the current page, and "Articles" is bold. The browser remembers the
 * groups the user opens or closes.
 */
export const CollapsibleGroups: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const navigation = within(canvas.getByRole('navigation', { name: 'Main navigation' }));
        const settings = navigation.getByRole('button', { name: 'Settings' });
        await expect(settings).toHaveAttribute('aria-expanded', 'false');
        // Hidden on screen too, not only for assistive technologies
        const settingsLinks = navigation
            .getByRole('link', { name: 'Tags', hidden: true })
            .closest('ul');
        await expect(settingsLinks).toHaveStyle({ display: 'none' });
        await expect(navigation.getByRole('button', { name: 'Content' })).toHaveAttribute(
            'aria-expanded',
            'true',
        );
        // A group without `collapsible` keeps a plain title
        await expect(navigation.queryByRole('button', { name: 'People' })).toBeNull();

        await userEvent.click(settings);
        await expect(settings).toHaveAttribute('aria-expanded', 'true');
        await expect(navigation.getByRole('link', { name: 'Tags' })).toBeVisible();
        await expect(window.localStorage.getItem('panneau:nav-group:Settings')).toBe('open');

        // Closed again by the user, even though it was open
        await userEvent.click(settings);
        await expect(settings).toHaveAttribute('aria-expanded', 'false');
        await expect(settingsLinks).toHaveStyle({ display: 'none' });
        await expect(window.localStorage.getItem('panneau:nav-group:Settings')).toBe('closed');

        const articles = navigation.getByRole('link', { name: 'Articles' });
        await expect(Number(getComputedStyle(articles).fontWeight)).toBeGreaterThan(
            Number(getComputedStyle(navigation.getByRole('link', { name: 'Pages' })).fontWeight),
        );
    },
};

/** The button next to the appearance's logs the user out. */
export const LogOut: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Log out' }));
        await expect(args.onLogOut).toHaveBeenCalledTimes(1);
    },
};

/** The language button, next to the appearance's, switches the interface (decision 0082). */
export const Languages: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Language: English' }));
        const menu = await body.findByRole('menu', { name: 'Language: English' });
        await expect(within(menu).getByRole('menuitemradio', { name: 'English' })).toHaveAttribute(
            'aria-checked',
            'true',
        );
        await userEvent.click(within(menu).getByRole('menuitemradio', { name: 'Français' }));
        await expect(args.onLocaleChange).toHaveBeenCalledWith('fr');
    },
};

export const Collapsed: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Collapse the sidebar' }));
        await expect(canvas.getByRole('button', { name: 'Expand the sidebar' })).toHaveAttribute(
            'aria-expanded',
            'false',
        );
    },
};

export const Phone: Story = {
    globals: { viewport: { value: 'mobile1' } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const open = canvas.queryByRole('button', { name: 'Open the menu' });
        // Only shown below the `lg` width of the root.
        if (open !== null && open.checkVisibility()) {
            await userEvent.click(open);
            const drawer = await body.findByRole('dialog', { name: 'Main navigation' });
            await expect(within(drawer).getByRole('link', { name: 'Articles' })).toHaveAttribute(
                'aria-current',
                'page',
            );
        }
    },
};

/** "Go to…" opens the command palette, with the navigation and the app's actions. */
export const GoTo: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(
            within(canvas.getByRole('complementary')).getByRole('button', { name: /Go to…/ }),
        );
        const field = await body.findByRole('searchbox', { name: 'Go to…' });
        await userEvent.type(field, 'arti');
        await expect(body.getByRole('menuitem', { name: 'Articles' })).toBeInTheDocument();
    },
};
