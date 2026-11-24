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
import { type DefinitionInput, type DefinitionTheme, validateDefinition } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';
import { Heading, Text, ThemeScope } from '@panneau/ui';

import { AppLayout } from './AppLayout';
import type { ColorSchemePreference } from './UserMenu';
import { useDensityPreference } from './density';

const input: DefinitionInput = {
    protocol: 1,
    name: 'Northwind Journal',
    locale: 'en',
    locales: ['en'],
    // The languages of the interface, with a switcher (decision 0083)
    interfaceLocales: [
        { locale: 'en', label: 'English', url: '/admin/api/locale/en' },
        { locale: 'fr', label: 'Français', url: '/admin/api/locale/fr' },
    ],
    api: { baseUrl: '/api' },
    // With the users, the user's menu links to their profile
    resources: ['pages', 'articles', 'categories', 'authors', 'tags', 'redirects', 'users'].map(
        (id) => ({
            id,
            label: { singular: id.slice(0, -1), plural: id },
            fields: [],
        }),
    ),
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
    // A long email, whole in the user's menu
    user: { id: '1', name: 'Ada Lovelace', email: 'ada.lovelace@northwind-journal.example.com' },
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
    theme,
}: {
    onLogOut?: () => void;
    onLocaleChange?: (locale: string) => void;
    /** The definition's theme. With one, the layout is in the density the app would give it. */
    theme?: DefinitionTheme;
}) {
    const [colorScheme, setColorScheme] = useState<ColorSchemePreference>('light');
    // The density of the app: the user's choice, or the definition's (decision 0104)
    const density = useDensityPreference(theme);
    // The "Go to…" palette searches through the data adapter.
    const [{ adapter, client }] = useState(createData);
    const layout = (
        <QueryClientProvider client={client}>
            <DataAdapterProvider adapter={adapter}>
                <RouterProvider navigate={() => undefined}>
                    <ActionRunnerProvider adapter={adapter}>
                        <AppLayout
                            definition={{
                                ...getDefinition(),
                                ...(theme !== undefined ? { theme } : {}),
                            }}
                            basePath="/admin"
                            route={{ name: 'resource.index', resource: 'articles' }}
                            colorScheme={colorScheme}
                            onColorSchemeChange={setColorScheme}
                            density={density.choice}
                            onDensityChange={density.onChange}
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
    return theme !== undefined ? (
        <ThemeScope density={density.density} className="density-scope">
            {layout}
        </ThemeScope>
    ) : (
        layout
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
        window.localStorage.removeItem('panneau:density');
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

/**
 * The user's menu (decision 0086), the only button of the footer: who is logged in, their profile,
 * the language (decision 0083) with a check on the current one, and "Log out", then the appearance
 * and the density as rows of icons named by their tooltips (#487), which leave it open.
 */
export const UserMenu: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const account = canvas.getByRole('button', { name: 'Your account (Ada Lovelace)' });
        await userEvent.click(account);
        const popover = within(
            await body.findByRole('dialog', { name: 'Your account (Ada Lovelace)' }),
        );
        const menu = within(popover.getByRole('menu', { name: 'Your account (Ada Lovelace)' }));
        await expect(menu.getByRole('menuitem', { name: 'Profile' })).toHaveAttribute(
            'href',
            '/admin/resources/users/1/edit',
        );
        // Top to bottom: who is logged in, the preferences, the other items, and "Log out" last
        const top = (element: Element) => element.getBoundingClientRect().top;
        const identity = popover.getByText('Ada Lovelace');
        const preferences = popover.getByRole('radiogroup', { name: 'Appearance' });
        const items = menu.getAllByRole('menuitem');
        await expect(top(identity)).toBeLessThan(top(preferences));
        await expect(top(preferences)).toBeLessThan(top(items[0] ?? preferences));
        await expect(items.at(-1)).toHaveAccessibleName('Log out');
        await expect(
            popover.getByRole('menu', { name: 'Your account (Ada Lovelace)' }),
        ).toHaveAccessibleDescription(/^Ada Lovelace/);
        const appearance = within(preferences);
        await expect(appearance.getByRole('radio', { name: 'Light' })).toHaveAttribute(
            'aria-checked',
            'true',
        );
        // Each icon is named by its tooltip
        const dark = appearance.getByRole('radio', { name: 'Dark' });
        await expect(dark).toHaveTextContent('');
        await userEvent.hover(dark);
        await expect(await body.findByRole('tooltip')).toHaveTextContent('Dark');
        await userEvent.click(dark);
        await expect(dark).toHaveAttribute('aria-checked', 'true');
        // Both choices fit on one line each, beside their label
        const density = popover.getByRole('radiogroup', { name: 'Density' });
        await expect(density.getBoundingClientRect().height).toBeLessThan(48);
        await userEvent.keyboard('{Escape}');

        await userEvent.click(account);
        const reopened = within(await body.findByRole('dialog'));
        await expect(reopened.getByRole('radio', { name: 'Dark' })).toHaveAttribute(
            'aria-checked',
            'true',
        );
        const language = within(reopened.getByRole('group', { name: 'Language' }));
        await expect(language.getByRole('menuitemradio', { name: 'English' })).toHaveAttribute(
            'aria-checked',
            'true',
        );
        await userEvent.click(language.getByRole('menuitemradio', { name: 'Français' }));
        await expect(args.onLocaleChange).toHaveBeenCalledWith('fr');

        await userEvent.click(account);
        await userEvent.click(
            within(await body.findByRole('menu')).getByRole('menuitem', { name: 'Log out' }),
        );
        await expect(args.onLogOut).toHaveBeenCalledTimes(1);
    },
};

/** The rail: the user's avatar alone opens the same menu. */
export const Collapsed: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('button', { name: 'Collapse the sidebar' }));
        await expect(canvas.getByRole('button', { name: 'Expand the sidebar' })).toHaveAttribute(
            'aria-expanded',
            'false',
        );
        await userEvent.click(canvas.getByRole('button', { name: 'Your account (Ada Lovelace)' }));
        const menu = within(await body.findByRole('menu', { name: 'Your account (Ada Lovelace)' }));
        await expect(menu.getByRole('menuitem', { name: 'Log out' })).toBeInTheDocument();
        await userEvent.keyboard('{Escape}');
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

/**
 * "Go to…" opens the command palette, with the navigation and the app's actions. Its keys are in
 * its tooltip, not on the button (decision 0112), and the sidebar's toggle has its own.
 */
export const GoTo: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const sidebar = within(canvas.getByRole('complementary'));
        const goTo = sidebar.getByRole('button', { name: 'Go to…' });
        await expect(goTo).toHaveTextContent(/^Go to…$/);
        await expect(goTo.getAttribute('aria-keyshortcuts')).toMatch(/^(Meta|Control)\+K$/);
        await userEvent.hover(goTo);
        await expect(await body.findByRole('tooltip')).toHaveTextContent(/^Go to…(⌘K|Ctrl\+K)$/);
        await userEvent.unhover(goTo);
        const toggle = sidebar.getByRole('button', { name: 'Collapse the sidebar' });
        await expect(toggle.getAttribute('aria-keyshortcuts')).toMatch(/^(Meta|Control)\+\\$/);
        await userEvent.click(goTo);
        const field = await body.findByRole('searchbox', { name: 'Go to…' });
        await userEvent.type(field, 'arti');
        await expect(body.getByRole('menuitem', { name: 'Articles' })).toBeInTheDocument();
    },
};

/**
 * The density (decision 0104): the definition's, "touch" here, until the user picks another in
 * their menu, next to the appearance. The browser remembers it.
 */
export const Density: Story = {
    args: { theme: { density: 'touch' } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const scope = canvasElement.querySelector('.density-scope');
        // Without a choice, the definition's density
        await expect(scope).toHaveAttribute('data-density', 'touch');
        const account = canvas.getByRole('button', { name: 'Your account (Ada Lovelace)' });
        await userEvent.click(account);
        const menu = within(await body.findByRole('dialog'));
        const density = within(menu.getByRole('radiogroup', { name: 'Density' }));
        await expect(density.getByRole('radio', { name: 'Default' })).toHaveAttribute(
            'aria-checked',
            'true',
        );
        await userEvent.click(density.getByRole('radio', { name: 'Compact' }));
        await expect(scope).toHaveAttribute('data-density', 'compact');
        await expect(window.localStorage.getItem('panneau:density')).toBe('compact');
    },
};

/** A density the user chose earlier: it applies as the page loads, over the definition's. */
export const RememberedDensity: Story = {
    args: { theme: { density: 'touch' } },
    beforeEach: () => {
        window.localStorage.setItem('panneau:density', 'comfortable');
        return () => window.localStorage.removeItem('panneau:density');
    },
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        await expect(canvasElement.querySelector('.density-scope')).toHaveAttribute(
            'data-density',
            'comfortable',
        );
        await userEvent.click(
            within(canvasElement).getByRole('button', { name: 'Your account (Ada Lovelace)' }),
        );
        const menu = within(await body.findByRole('dialog'));
        await expect(menu.getByRole('radio', { name: 'Comfortable' })).toHaveAttribute(
            'aria-checked',
            'true',
        );
    },
};

/** A definition that locks its density (`lockDensity`): the menu has no choice of a density. */
export const LockedDensity: Story = {
    args: { theme: { density: 'compact', lockDensity: true } },
    beforeEach: () => {
        window.localStorage.setItem('panneau:density', 'comfortable');
        return () => window.localStorage.removeItem('panneau:density');
    },
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        await expect(canvasElement.querySelector('.density-scope')).toHaveAttribute(
            'data-density',
            'compact',
        );
        await userEvent.click(
            within(canvasElement).getByRole('button', { name: 'Your account (Ada Lovelace)' }),
        );
        const menu = within(await body.findByRole('dialog'));
        await expect(menu.getByRole('radiogroup', { name: 'Appearance' })).toBeInTheDocument();
        await expect(menu.queryByRole('radiogroup', { name: 'Density' })).toBeNull();
    },
};
