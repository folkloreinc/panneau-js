import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Field } from '@panneau/protocol';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { GroupField } from './GroupField';

const FIELDS: Field[] = [
    { name: 'title', type: 'text', label: 'Share title' },
    { name: 'custom', type: 'boolean', label: 'Custom image' },
    {
        name: 'note',
        type: 'text',
        label: 'Note',
        visibleWhen: { field: 'custom', equals: true },
    },
];

describe('GroupField', () => {
    it('renders its fields and sets the whole object', async () => {
        const onChange = vi.fn();
        renderField(
            <Controlled<Record<string, unknown> | null>
                initial={{ title: 'A' }}
                onChange={onChange}
            >
                {(value, setValue) => (
                    <GroupField
                        label="Sharing"
                        name="sharing"
                        fields={FIELDS}
                        value={value}
                        onChange={setValue}
                    />
                )}
            </Controlled>,
        );
        expect(screen.getByRole('group', { name: 'Sharing' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Share title' })).toHaveAttribute(
            'name',
            'sharing.title',
        );
        expect(screen.queryByRole('textbox', { name: 'Note' })).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('checkbox', { name: 'Custom image' }));
        expect(onChange).toHaveBeenLastCalledWith({ title: 'A', custom: true });
        expect(screen.getByRole('textbox', { name: 'Note' })).toBeInTheDocument();
    });

    it('renders from a definition, read-only for its fields too', () => {
        renderField(
            <DefinitionField
                field={{
                    name: 'sharing',
                    type: 'group',
                    label: 'Sharing',
                    fields: FIELDS,
                    readOnly: true,
                }}
                path="sharing"
                value={{ title: 'A' }}
                onChange={() => undefined}
            />,
        );
        expect(screen.getByRole('textbox', { name: 'Share title' })).toHaveAttribute('readonly');
    });
});
