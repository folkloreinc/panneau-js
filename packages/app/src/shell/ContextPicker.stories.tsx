/**
 * The current context (decision 0043): a field per param, at the top of the sidebar, with inline
 * choices or choices searched through the adapter. Picking a value loads the app for it.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import type { ContextParam } from '@panneau/protocol';

import { CurrentContextProvider } from '../currentContext';
import { ContextPage } from '../pages/ContextPage';
import { ContextPicker, ContextPickerButton } from './ContextPicker';

const CONTESTS = ['Summer 2026', 'Winter 2026', 'Spring 2027'];

function Story({
    params,
    select,
    view,
}: {
    params: ContextParam[];
    select: (name: string, value: string | null) => void;
    view: 'sidebar' | 'rail' | 'page';
}) {
    const [client] = useState(() => new QueryClient());
    const value = {
        params,
        getOptions: (_name: string, q: string) =>
            Promise.resolve(
                CONTESTS.filter((label) => label.toLowerCase().includes(q.toLowerCase())).map(
                    (label) => ({
                        value: label.toLowerCase().replace(' ', '-'),
                        label,
                        description: 'Northwind',
                    }),
                ),
            ),
        select,
    };
    return (
        <QueryClientProvider client={client}>
            <CurrentContextProvider value={value}>
                {view === 'page' ? (
                    <ContextPage />
                ) : view === 'rail' ? (
                    <ContextPickerButton />
                ) : (
                    <div style={{ width: '15rem' }}>
                        <ContextPicker />
                    </div>
                )}
            </CurrentContextProvider>
        </QueryClientProvider>
    );
}

const client: ContextParam = {
    name: 'client',
    label: 'Client',
    allLabel: 'All clients',
    options: [
        { value: '4', label: 'Northwind' },
        { value: '7', label: 'Contoso' },
    ],
    value: '4',
    valueLabel: 'Northwind',
};

const meta = {
    title: 'App/Context picker',
    component: Story,
    args: {
        view: 'sidebar',
        select: fn(),
        params: [
            client,
            {
                name: 'contest',
                label: 'Contest',
                required: true,
                value: 'summer-2026',
                valueLabel: 'Summer 2026',
            },
        ],
    },
} satisfies Meta<typeof Story>;

export default meta;
type Story = StoryObj<typeof meta>;

/** In the sidebar: the inline choices of the client, then the contests, searched. */
export const Sidebar: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const contest = canvas.getByRole('combobox', { name: /Contest/ });
        await expect(contest).toHaveValue('Summer 2026');
        await userEvent.clear(contest);
        await userEvent.type(contest, 'win');
        await userEvent.click(await body.findByRole('option', { name: /Winter 2026/ }));
        await expect(args.select).toHaveBeenCalledWith('contest', 'winter-2026');
        // The app loads again for the new value: here, the list closes.
        await userEvent.click(canvasElement.ownerDocument.body);
        await waitFor(() => expect(body.queryByRole('listbox')).toBeNull());
    },
};

/** An optional param picks no value with its `allLabel`. */
export const NoValue: Story = {
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(canvas.getByRole('combobox', { name: 'Client' }));
        await userEvent.click(await body.findByRole('option', { name: 'All clients' }));
        await expect(args.select).toHaveBeenCalledWith('client', null);
        // The app loads again for the new value: here, the list closes.
        await userEvent.click(canvasElement.ownerDocument.body);
        await waitFor(() => expect(body.queryByRole('listbox')).toBeNull());
    },
};

/** In the rail of icons: a button whose tooltip says the values, which opens the fields. */
export const Rail: Story = {
    args: { view: 'rail' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(
            canvas.getByRole('button', {
                name: 'Change the context (Client: Northwind, Contest: Summer 2026)',
            }),
        );
        const popover = await body.findByRole('dialog', { name: 'Context' });
        await expect(within(popover).getByRole('combobox', { name: 'Client' })).toHaveValue(
            'Northwind',
        );
    },
};

/** A required param without a value: the page in place of every route asks for it. */
export const Required: Story = {
    args: {
        view: 'page',
        params: [client, { name: 'contest', label: 'Contest', required: true, value: null }],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { name: 'Choose where to work' })).toBeVisible();
        await expect(canvas.getByRole('combobox', { name: /Contest/ })).toHaveValue('');
    },
};
