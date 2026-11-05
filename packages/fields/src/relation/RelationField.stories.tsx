import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { createEditableRelationSource, exampleRelationSource } from '../__fixtures__/fields';
import type { RelationReference, RelationSource } from '../shared/relation';
import { RelationField } from './RelationField';

const meta = {
    title: 'Fields/Relation',
    component: RelationField,
    args: { label: 'Author', resource: 'authors', source: exampleRelationSource },
} satisfies Meta<typeof RelationField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<RelationReference | null>(null);
        return (
            <RelationField
                resource="authors"
                source={args.source ?? null}
                label={args.label}
                multiple={false}
                value={value}
                onChange={setValue}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const input = canvas.getByRole('combobox', { name: 'Author' });
        await userEvent.type(input, 'hop');
        await userEvent.click(await canvas.findByRole('option', { name: 'Grace Hopper' }));
        // The chosen item shows as a card, which keeps the focus
        await expect(canvas.getByRole('listitem')).toHaveTextContent('Grace Hopper');
        await expect(canvas.getByRole('button', { name: 'Change Grace Hopper' })).toHaveFocus();
        // From the keyboard: Change, then Escape keeps the item
        await userEvent.keyboard('{Enter}');
        await expect(canvas.getByRole('combobox', { name: 'Author' })).toHaveFocus();
        await userEvent.keyboard('{Escape}');
        await expect(canvas.getByRole('button', { name: 'Change Grace Hopper' })).toHaveFocus();
        await userEvent.click(canvas.getByRole('button', { name: 'Remove Grace Hopper' }));
        await expect(canvas.getByRole('combobox', { name: 'Author' })).toHaveFocus();
    },
};

/** A square image, inline, so that stories don't load anything. */
function swatch(color: string): string {
    return `data:image/svg+xml,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="${color}"/></svg>`,
    )}`;
}

const PEOPLE: RelationReference[] = [
    { id: '1', label: 'Ada Lovelace', description: 'Mathematician', imageUrl: swatch('#2563eb') },
    { id: '2', label: 'Grace Hopper', description: 'Computer scientist' },
    {
        id: '3',
        label: 'Katherine Johnson',
        description: 'Mathematician',
        imageUrl: swatch('#db2777'),
    },
];

/** A source whose items have an image and a description, and open in the app. */
const describedSource: RelationSource = {
    async search(_resource, query) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return PEOPLE.filter((person) => person.label.toLowerCase().includes(query.toLowerCase()));
    },
    async resolve(_resource, ids) {
        return PEOPLE.filter((person) => ids.includes(person.id));
    },
    describe: () => ({ icon: 'users', image: true, description: true }),
    getItemHref: (resource, id) => `#/${resource}/${id}`,
};

/**
 * The chosen items as cards (decision 0067): their image, or a placeholder, their description, a
 * link to each one, and the buttons that change or remove them. References from items (`{ id, label }`)
 * get their image and description from the source.
 */
export const Cards: Story = {
    args: { source: describedSource },
    render: function Render(args) {
        const [single, setSingle] = useState<RelationReference | null>({
            id: '1',
            label: 'Ada Lovelace',
        });
        const [multiple, setMultiple] = useState<RelationReference[] | null>([
            { id: '2', label: 'Grace Hopper' },
            { id: '3', label: 'Katherine Johnson' },
        ]);
        return (
            <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '28rem' }}>
                <RelationField
                    resource="people"
                    source={args.source ?? null}
                    label="Parent"
                    value={single}
                    onChange={setSingle}
                />
                <RelationField
                    resource="people"
                    source={args.source ?? null}
                    label="Guests"
                    multiple
                    value={multiple}
                    onChange={setMultiple}
                />
                <RelationField
                    resource="people"
                    source={args.source ?? null}
                    label="Read-only"
                    readOnly
                    value={{ id: '1', label: 'Ada Lovelace' }}
                />
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const parent = canvas.getByRole('group', { name: 'Parent' });
        await expect(await within(parent).findByText('Mathematician')).toBeVisible();
        await expect(within(parent).getByRole('link', { name: 'Ada Lovelace' })).toHaveAttribute(
            'href',
            '#/people/1',
        );
        const guests = canvas.getByRole('group', { name: 'Guests' });
        await expect(within(guests).getAllByRole('listitem')).toHaveLength(2);
        await userEvent.click(within(guests).getByRole('button', { name: 'Remove Grace Hopper' }));
        await expect(within(guests).getAllByRole('listitem')).toHaveLength(1);
        // The focus goes to the next card, to remove several in a row
        await expect(
            within(guests).getByRole('button', { name: 'Remove Katherine Johnson' }),
        ).toHaveFocus();
        // Read-only: the card, without its buttons
        const readOnly = canvas.getByRole('group', { name: 'Read-only' });
        await expect(within(readOnly).queryByRole('button')).not.toBeInTheDocument();
    },
};

export const Multiple: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<RelationReference[] | null>([
            { id: '1', label: 'Ada Lovelace' },
        ]);
        return (
            <RelationField
                resource="authors"
                source={args.source ?? null}
                label="Guests"
                multiple
                value={value}
                onChange={setValue}
            />
        );
    },
};

export const WithoutSource: Story = {
    args: { source: null },
    render: (args) => (
        <RelationField
            resource="authors"
            source={args.source ?? null}
            label={args.label}
            multiple={false}
            value={{ id: '1', label: 'Ada Lovelace' }}
        />
    ),
};

/** Values that are only ids, as a product's own API gives them: the source resolves their labels. */
export const PlainIds: Story = {
    args: { source: createEditableRelationSource() },
    render: (args) => (
        <RelationField
            resource="authors"
            source={args.source ?? null}
            label="Guests"
            multiple
            value={[
                { id: '1', label: '1' },
                { id: '2', label: '2' },
            ]}
        />
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(await canvas.findByText('Ada Lovelace')).toBeVisible();
        await expect(canvas.getByText('Grace Hopper')).toBeVisible();
    },
};

/** "Create “…”" in the picker, when the source can create items. */
export const CreateFromThePicker: Story = {
    args: { source: createEditableRelationSource() },
    render: function Render(args) {
        const [value, setValue] = useState<RelationReference[] | null>(null);
        return (
            <RelationField
                resource="authors"
                source={args.source ?? null}
                label="Guests"
                multiple
                value={value}
                onChange={setValue}
            />
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(canvas.getByRole('combobox', { name: 'Guests' }), 'Hedy Lamarr');
        await userEvent.click(await canvas.findByRole('option', { name: 'Create “Hedy Lamarr”' }));
        await waitFor(() => expect(canvas.getByText('Hedy Lamarr')).toBeVisible());
        // The picker stays open to add more: close it.
        await userEvent.keyboard('{Escape}');
        await expect(
            await canvas.findByRole('button', { name: 'Remove Hedy Lamarr' }),
        ).toBeVisible();
    },
};
