import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { createEditableRelationSource, exampleRelationSource } from '../__fixtures__/fields';
import type { RelationReference } from '../shared/relation';
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
        await expect(input).toHaveValue('Grace Hopper');
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
