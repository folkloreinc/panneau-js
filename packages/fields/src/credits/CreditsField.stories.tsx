import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import type { RelationReference, RelationSource } from '../shared/relation';
import { CreditsField, type CreditsFieldProps } from './CreditsField';
import type { Credit } from './credits';

/** People and roles in memory, with a short delay: the source creates both. */
function createCreditsSource(): RelationSource {
    const items: Record<string, RelationReference[]> = {
        people: [
            { id: '1', label: 'Ada Lovelace' },
            { id: '2', label: 'Grace Hopper' },
            { id: '3', label: 'Margaret Hamilton' },
        ],
        roles: [
            { id: '10', label: 'Director' },
            { id: '11', label: 'Screenplay' },
            { id: '12', label: 'Music' },
        ],
    };
    const wait = () => new Promise((resolve) => setTimeout(resolve, 150));
    return {
        async search(resource, query, { signal }) {
            await wait();
            signal.throwIfAborted();
            return (items[resource] ?? []).filter((item) =>
                item.label.toLowerCase().includes(query.toLowerCase()),
            );
        },
        async resolve(resource, ids) {
            await wait();
            return (items[resource] ?? []).filter((item) => ids.includes(item.id));
        },
        async create(resource, text) {
            await wait();
            const list = items[resource] ?? [];
            const item = { id: String(100 + list.length), label: text };
            items[resource] = [...list, item];
            return item;
        },
    };
}

function Controlled({ initial, ...props }: CreditsFieldProps & { initial: Credit[] | null }) {
    const [value, setValue] = useState<Credit[] | null>(initial);
    return <CreditsField {...props} value={value} onChange={setValue} />;
}

const meta = {
    title: 'Fields/Credits',
    component: CreditsField,
    args: { label: 'Credits', name: 'credits', resource: 'people' },
} satisfies Meta<typeof CreditsField>;

export default meta;
type Story = StoryObj<typeof meta>;

/** People of a resource, or names, with roles in two locales, and featured credits. */
export const PeopleAndNames: Story = {
    args: { source: createCreditsSource(), featured: true, locales: ['fr', 'en'] },
    render: (args) => (
        <Controlled
            {...args}
            initial={[
                {
                    person: { id: '1', label: 'Ada Lovelace' },
                    roles: [{ name: { fr: 'Mise en scène', en: 'Director' } }],
                    featured: true,
                },
                { person: { name: 'Jane Doe' }, roles: [{ name: { fr: 'Musique' } }] },
            ]}
        />
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('listitem', { name: '1Ada Lovelace' })).toBeVisible();
        await expect(canvas.getByRole('listitem', { name: '2Jane Doe' })).toBeVisible();
        await expect(canvas.getByText('Name only')).toBeVisible();
        await userEvent.click(canvas.getByRole('button', { name: 'Add a credit' }));
        const people = canvas.getAllByRole('combobox', { name: 'Person' });
        const person = people[2];
        if (person === undefined) {
            throw new Error('No third person.');
        }
        await userEvent.type(person, 'Hedy Lamarr');
        await userEvent.click(
            await canvas.findByRole('option', { name: 'Add “Hedy Lamarr” as a name' }),
        );
        // Leave the picker, which searches the name it shows.
        await userEvent.tab();
        await expect(person).toHaveValue('Hedy Lamarr');
        await expect(canvas.getAllByText('Name only')).toHaveLength(2);
        await userEvent.click(canvas.getByRole('radio', { name: 'English' }));
        const first = canvas.getByRole('listitem', { name: '1Ada Lovelace' });
        await expect(within(first).getByRole('textbox', { name: 'Role 1 (English)' })).toHaveValue(
            'Director',
        );
    },
};

/** Roles of a resource of roles: the picker creates people and roles. */
export const ResourceOfRoles: Story = {
    args: { source: createCreditsSource(), roles: 'roles', names: false },
    render: (args) => (
        <Controlled
            {...args}
            initial={[{ person: { id: '2', label: '2' }, roles: [{ id: '10', label: '10' }] }]}
        />
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        // Plain ids get their labels from the source.
        await waitFor(() =>
            expect(canvas.getByRole('combobox', { name: 'Person' })).toHaveValue('Grace Hopper'),
        );
        await expect(await canvas.findByText('Director')).toBeVisible();
        await userEvent.type(canvas.getByRole('combobox', { name: 'Roles' }), 'Editing');
        await userEvent.click(await canvas.findByRole('option', { name: 'Create “Editing”' }));
        await waitFor(() => expect(canvas.getByText('Editing')).toBeVisible());
        await userEvent.keyboard('{Escape}');
    },
};

/** Without a resource of people: every person is a name. */
export const NamesOnly: Story = {
    args: { resource: null },
    render: (args) => <Controlled {...args} initial={null} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('No credits yet.')).toBeVisible();
        await userEvent.click(canvas.getByRole('button', { name: 'Add a credit' }));
        await userEvent.type(canvas.getByRole('textbox', { name: 'Person' }), 'Jane Doe');
        await userEvent.click(canvas.getByRole('button', { name: 'Add a role' }));
        await userEvent.type(canvas.getByRole('textbox', { name: 'Role 1' }), 'Music');
        await expect(canvas.getByRole('listitem', { name: '1Jane Doe' })).toBeVisible();
    },
};

/** With the fields of each credit, and errors. */
export const FieldsAndErrors: Story = {
    args: {
        source: createCreditsSource(),
        fields: [{ name: 'note', type: 'text', label: 'Note' }],
        errors: ['Add at least two credits.'],
        required: true,
    },
    render: (args) => (
        <Controlled
            {...args}
            initial={[
                { person: { id: '3', label: 'Margaret Hamilton' }, roles: [], note: 'Guest' },
            ]}
        />
    ),
};

export const ReadOnly: Story = {
    args: { readOnly: true, featured: true },
    render: (args) => (
        <Controlled
            {...args}
            initial={[
                {
                    person: { id: '1', label: 'Ada Lovelace' },
                    roles: [{ name: { en: 'Director' } }],
                    featured: true,
                },
            ]}
        />
    ),
};
