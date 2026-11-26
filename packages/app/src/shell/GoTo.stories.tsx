/**
 * The "Go to…" palette over a page of the app (decision 0116): "On this page" offers the actions
 * of the current item, as its header runs them, and the commands of plugins that apply to the
 * item or the selection of the page.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient } from '@tanstack/react-query';
import { expect, fn, userEvent, within } from 'storybook/test';

import { type PanneauPlugin, hasSelection } from '@panneau/core';
import { createRestAdapter } from '@panneau/data';
import { validateBootConfig } from '@panneau/protocol';
import { createMockBackend } from '@panneau/protocol/mock';

import { Panneau } from '../Panneau';
import { createBootConfig, createDefinition } from '../__fixtures__/definition';

const definition = createDefinition({
    resources: [
        {
            id: 'pages',
            label: { singular: 'page', plural: 'pages' },
            itemTitle: 'title',
            fields: [{ name: 'title', type: 'text', label: 'Title' }],
            list: { selectable: true },
        },
    ],
});

function App({ path, onPerform }: { path: string; onPerform: (ids: string) => void }) {
    const backend = createMockBackend({
        definition,
        items: {
            pages: [
                { id: '1', title: 'About us' },
                { id: '2', title: 'Contact' },
            ],
        },
    });
    const result = validateBootConfig(createBootConfig({ definition }));
    if (!result.success) {
        throw new Error(JSON.stringify(result.issues));
    }
    const plugin: PanneauPlugin = {
        id: 'site',
        commands: [
            {
                id: 'export',
                label: 'Export the selection',
                when: ({ page }) => hasSelection(page?.selection),
                perform: ({ page }) =>
                    onPerform(page?.selection?.mode === 'ids' ? page.selection.ids.join() : 'all'),
            },
        ],
    };
    window.history.replaceState(null, '', path);
    return (
        <Panneau
            config={result.data}
            adapter={createRestAdapter({ baseUrl: '/panneau/api', fetch: backend.fetch })}
            queryClient={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
            plugins={[plugin]}
            iconLoader={null}
            onUnauthorized={() => undefined}
        />
    );
}

const meta = {
    title: 'App/Go to/In context',
    component: App,
    parameters: { layout: 'fullscreen' },
    args: { path: '/panneau', onPerform: fn() },
    beforeEach: () => {
        const previous = `${window.location.pathname}${window.location.search}`;
        return () => window.history.replaceState(null, '', previous);
    },
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

const openGoTo = async (canvasElement: HTMLElement) => {
    const canvas = within(canvasElement);
    await userEvent.click(
        within(canvas.getByRole('complementary')).getByRole('button', { name: /Go to…/ }),
    );
    return within(within(canvasElement.ownerDocument.body).getByRole('dialog', { name: 'Go to…' }));
};

/** The form of an item: its actions come first, and Delete asks as its button does. */
export const OnAnItem: Story = {
    args: { path: '/panneau/resources/pages/1/edit' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await canvas.findByRole('heading', { name: 'About us' });
        const palette = await openGoTo(canvasElement);
        const group = within(palette.getByRole('group', { name: 'On this page' }));
        await expect(group.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
        // No selection on a form: the command doesn't apply
        await expect(group.queryByRole('menuitem', { name: 'Export the selection' })).toBeNull();
        await userEvent.click(group.getByRole('menuitem', { name: 'Delete' }));
        const body = within(canvasElement.ownerDocument.body);
        await expect(await body.findByRole('alertdialog')).toHaveTextContent('About us');
        await userEvent.click(body.getByRole('button', { name: 'Cancel' }));
    },
};

/** A list with a selection: the command of the plugin applies to the selected items. */
export const OnASelection: Story = {
    args: { path: '/panneau/resources/pages' },
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        await userEvent.click(await canvas.findByRole('button', { name: 'Select' }));
        await userEvent.click(canvas.getByRole('checkbox', { name: 'Select Contact' }));
        const palette = await openGoTo(canvasElement);
        const group = within(palette.getByRole('group', { name: 'On this page' }));
        await userEvent.click(group.getByRole('menuitem', { name: 'Export the selection' }));
        await expect(args.onPerform).toHaveBeenCalledWith('2');
    },
};
