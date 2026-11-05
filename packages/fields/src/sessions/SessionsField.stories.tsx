import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import type { Field } from '@panneau/protocol';

import { exampleRelationSource } from '../__fixtures__/fields';
import { DefinitionField } from '../shared/DefinitionField';
import { builtInFields } from '../shared/builtIn';
import { FieldsProvider } from '../shared/context';
import { SessionsFieldEntry } from './SessionsField';

/** A `sessions` field as laravel-panneau's `Sessions` builder describes it (decision 0065). */
const SESSIONS: Field = {
    name: 'sessions',
    type: 'sessions',
    label: 'Sessions',
    multiple: true,
    fields: [
        { name: 'dates', type: 'daterange', label: 'Dates', settings: { time: true } },
        { name: 'venue', type: 'relation', resource: 'venues', label: 'Venue' },
        { name: 'tickets', type: 'url', label: 'Tickets' },
    ],
};

const meta = {
    title: 'Fields/Sessions',
    component: DefinitionField,
    args: { field: SESSIONS, path: 'sessions', value: null, onChange: () => undefined },
} satisfies Meta<typeof DefinitionField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: function Render() {
        const [value, setValue] = useState<unknown>([
            {
                dates: { start: '2026-11-12T19:30:00-05:00', end: '2026-11-12T21:30:00-05:00' },
                venue: { id: '1', label: 'Salle Wilfrid-Pelletier' },
            },
        ]);
        return (
            <FieldsProvider
                components={{ ...builtInFields, sessions: SessionsFieldEntry }}
                relationSource={exampleRelationSource}
            >
                <DefinitionField
                    field={SESSIONS}
                    path="sessions"
                    value={value}
                    onChange={setValue}
                />
            </FieldsProvider>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.getByRole('listitem', { name: /Salle Wilfrid-Pelletier$/ }),
        ).toBeInTheDocument();
        // A saved session starts collapsed under its summary (decision 0068).
        await userEvent.click(canvas.getByRole('button', { name: /Salle Wilfrid-Pelletier$/ }));
        await expect(canvas.getByRole('textbox', { name: 'Tickets' })).toBeVisible();
    },
};
