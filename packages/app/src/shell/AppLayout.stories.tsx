/**
 * The frame of the app: the sidebar from the `main` menu of a definition, collapsible to a rail of
 * icons, and the page on a raised panel. Below the `lg` width, a bar opens the sidebar as a drawer.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { RouterProvider } from 'react-aria-components';
import { expect, userEvent, within } from 'storybook/test';

import { type DefinitionInput, validateDefinition } from '@panneau/protocol';
import { Heading, Text } from '@panneau/ui';

import { AppLayout } from './AppLayout';
import type { ColorSchemePreference } from './Sidebar';

const input: DefinitionInput = {
    protocol: 1,
    name: 'Northwind Journal',
    locale: 'en',
    locales: ['en'],
    api: { baseUrl: '/api' },
    resources: ['pages', 'articles', 'categories', 'authors'].map((id) => ({
        id,
        label: { singular: id.slice(0, -1), plural: id },
        fields: [],
    })),
    menus: {
        main: [
            {
                type: 'group',
                label: 'Content',
                children: [
                    { type: 'resource', resource: 'pages' },
                    { type: 'resource', resource: 'articles' },
                    { type: 'resource', resource: 'categories' },
                ],
            },
            {
                type: 'group',
                label: 'People',
                children: [{ type: 'resource', resource: 'authors' }],
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

function Layout() {
    const [colorScheme, setColorScheme] = useState<ColorSchemePreference>('light');
    return (
        <RouterProvider navigate={() => undefined}>
            <AppLayout
                definition={getDefinition()}
                basePath="/admin"
                route={{ name: 'resource.index', resource: 'articles' }}
                colorScheme={colorScheme}
                onColorSchemeChange={setColorScheme}
            >
                <Heading level={1}>Articles</Heading>
                <Text muted>The page of the current route.</Text>
            </AppLayout>
        </RouterProvider>
    );
}

const meta = {
    title: 'App/Layout',
    component: Layout,
    parameters: { layout: 'fullscreen' },
    beforeEach: () => {
        window.localStorage.removeItem('panneau:sidebar');
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
            await expect(
                await body.findByRole('dialog', { name: 'Main navigation' }),
            ).toBeVisible();
        }
    },
};
