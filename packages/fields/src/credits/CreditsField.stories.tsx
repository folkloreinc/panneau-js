import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import type { Field } from '@panneau/protocol';

import { exampleRelationSource } from '../__fixtures__/fields';
import { DefinitionField } from '../shared/DefinitionField';
import { builtInFields } from '../shared/builtIn';
import { FieldsProvider } from '../shared/context';
import { CreditsFieldEntry } from './CreditsField';

/** A `credits` field as laravel-panneau's `Credits` builder describes it (decision 0065). */
const CREDITS: Field = {
    name: 'credits',
    type: 'credits',
    label: 'Credits',
    multiple: true,
    fields: [
        { name: 'person', type: 'relation', resource: 'people', label: 'Person' },
        {
            name: 'name',
            type: 'text',
            label: 'Name',
            help: 'For a person who isn’t in the list.',
            visibleWhen: { field: 'person', filled: false },
        },
        { name: 'roles', type: 'relation', resource: 'roles', multiple: true, label: 'Roles' },
        { name: 'featured', type: 'boolean', label: 'Featured' },
    ],
};

const meta = {
    title: 'Fields/Credits',
    component: DefinitionField,
    args: { field: CREDITS, path: 'credits', value: null, onChange: () => undefined },
} satisfies Meta<typeof DefinitionField>;

export default meta;
type Story = StoryObj<typeof meta>;

function Credits({ components }: { components: typeof builtInFields }) {
    const [value, setValue] = useState<unknown>([
        { person: { id: '1', label: 'Ada Lovelace' }, roles: [{ id: '2', label: 'Director' }] },
    ]);
    return (
        <FieldsProvider components={components} relationSource={exampleRelationSource}>
            <DefinitionField field={CREDITS} path="credits" value={value} onChange={setValue} />
        </FieldsProvider>
    );
}

export const Default: Story = {
    render: () => <Credits components={{ ...builtInFields, credits: CreditsFieldEntry }} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.getByRole('listitem', { name: /Ada Lovelace \(Director\)$/ }),
        ).toBeInTheDocument();
        await userEvent.click(canvas.getByRole('button', { name: 'Add' }));
        await userEvent.type(canvas.getByRole('textbox', { name: /Name/ }), 'Jane Doe');
        await expect(canvas.getByRole('listitem', { name: /Jane Doe$/ })).toBeInTheDocument();
    },
};

/** Without the plugin: the credits are a repeater of their fields. */
export const WithoutPlugin: Story = {
    render: () => <Credits components={builtInFields} />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('group', { name: 'Credits' })).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    },
};
