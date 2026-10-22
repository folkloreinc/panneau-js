import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilePlus, FileText, Moon, Newspaper, PanelLeftClose, Users } from 'lucide-react';
import { useState } from 'react';
import { RouterProvider } from 'react-aria-components';
import { expect, userEvent, within } from 'storybook/test';

import { Button } from '../button/Button';
import { CommandPalette } from './CommandPalette';
import type { CommandPaletteGroup } from './match';
import { useCommandShortcut } from './useCommandShortcut';

const groups: CommandPaletteGroup[] = [
    {
        id: 'recent',
        label: 'Recent',
        items: [
            {
                id: 'article-1',
                label: 'The river festival returns',
                description: 'Article · City',
                icon: Newspaper,
                href: '/articles/1/edit',
            },
        ],
    },
    {
        id: 'navigation',
        label: 'Navigation',
        items: [
            { id: 'pages', label: 'Pages', icon: FileText, href: '/pages' },
            { id: 'articles', label: 'Articles', icon: Newspaper, href: '/articles' },
            { id: 'users', label: 'Users', icon: Users, href: '/users', keywords: ['people'] },
        ],
    },
    {
        id: 'create',
        label: 'Create',
        items: [
            { id: 'new-page', label: 'New page', icon: FilePlus, href: '/pages/create' },
            { id: 'new-article', label: 'New article', icon: FilePlus, href: '/articles/create' },
        ],
    },
    {
        id: 'actions',
        label: 'Actions',
        items: [
            { id: 'sidebar', label: 'Collapse the sidebar', icon: PanelLeftClose },
            { id: 'dark', label: 'Dark appearance', icon: Moon, keywords: ['theme'] },
        ],
    },
];

function Palette({ results = false, scoped = false }: { results?: boolean; scoped?: boolean }) {
    const [isOpen, setOpen] = useState(true);
    const [query, setQuery] = useState('');
    const [scope, setScope] = useState<string | null>(scoped ? 'Articles' : null);
    useCommandShortcut(() => setOpen((open) => !open), { isOpen });
    const searched: CommandPaletteGroup[] =
        results && query.length >= 2
            ? [
                  {
                      id: 'articles-results',
                      label: 'Articles',
                      matched: true,
                      items: [
                          {
                              id: '7',
                              label: `Bike lanes, one year later`,
                              description: 'Outdoors · Oct 10, 2026',
                              icon: Newspaper,
                              href: '/articles/7/edit',
                          },
                      ],
                  },
              ]
            : [];
    return (
        <RouterProvider navigate={() => undefined}>
            <Button onPress={() => setOpen(true)}>Go to… (⌘K)</Button>
            <CommandPalette
                isOpen={isOpen}
                onOpenChange={setOpen}
                groups={scope !== null ? searched : [...groups, ...searched]}
                inputValue={query}
                onInputChange={setQuery}
                aria-label="Go to…"
                placeholder={scope !== null ? 'Search…' : undefined}
                scope={scope}
                onScopeRemove={() => setScope(null)}
                status={
                    scope !== null && query.length < 2 ? 'Type at least 2 characters.' : undefined
                }
            />
        </RouterProvider>
    );
}

/**
 * A command palette: a search field over groups of items to go to or run. It matches the items
 * itself, without case or accents, and shows the results of a server after them.
 */
const meta = {
    title: 'UI/Command palette',
    component: Palette,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Palette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const field = await body.findByRole('searchbox', { name: 'Go to…' });
        await userEvent.type(field, 'new');
        await expect(body.getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
            'New page',
            'New article',
        ]);
    },
};

/** With results of a server, after the items the palette matches itself. */
export const WithServerResults: Story = {
    args: { results: true },
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.type(await body.findByRole('searchbox', { name: 'Go to…' }), 'bike');
        await expect(
            body.getByRole('menuitem', { name: /Bike lanes, one year later/ }),
        ).toBeInTheDocument();
    },
};

/** Narrowed to one resource: a chip before the field, removed by Backspace in the empty field. */
export const Scoped: Story = {
    args: { results: true, scoped: true },
    play: async ({ canvasElement }) => {
        const body = within(canvasElement.ownerDocument.body);
        const field = await body.findByRole('searchbox', { name: 'Go to…: Articles' });
        await expect(body.getByRole('menu')).toHaveTextContent('Type at least 2 characters.');
        await userEvent.type(field, 'bike');
        await expect(
            body.getByRole('menuitem', { name: /Bike lanes, one year later/ }),
        ).toBeInTheDocument();
        await userEvent.clear(field);
        await userEvent.type(field, '{Backspace}');
        await expect(body.getByRole('searchbox', { name: 'Go to…' })).toBeInTheDocument();
    },
};
