import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { Field } from '@panneau/protocol';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { builtInFields } from '../shared/builtIn';
import { defineCompoundField, summarizeCompound } from './compound';

const PARTS: Field[] = [
    { name: 'name', type: 'text', label: 'Name' },
    { name: 'role', type: 'text', label: 'Role' },
];

const team: Field = { name: 'team', type: 'team', label: 'Team', multiple: true, fields: PARTS };

const TeamFieldEntry = defineCompoundField({
    layout: ({ parts }) => (
        <div data-testid="layout">
            {parts.role}
            {parts.name}
        </div>
    ),
    summarize: (member) =>
        typeof member.name === 'string' && member.name !== '' ? member.name : null,
});

describe('compound fields without their plugin', () => {
    it('render as a repeater with multiple', async () => {
        const onChange = vi.fn();
        renderField(
            <Controlled<unknown> initial={[{ name: 'Ada' }]} onChange={onChange}>
                {(value, setValue) => (
                    <DefinitionField field={team} path="team" value={value} onChange={setValue} />
                )}
            </Controlled>,
        );
        expect(screen.getByRole('group', { name: 'Team' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('Ada');
        await userEvent.click(screen.getByRole('button', { name: 'Add' }));
        expect(onChange).toHaveBeenLastCalledWith([{ name: 'Ada' }, {}]);
    });

    it('render as a group without multiple', () => {
        renderField(
            <DefinitionField
                field={{ ...team, multiple: false }}
                path="team"
                value={{ name: 'Ada' }}
                onChange={() => undefined}
            />,
        );
        expect(screen.getByRole('group', { name: 'Team' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute('name', 'team.name');
        expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument();
    });

    it('name the missing plugin without fields', () => {
        renderField(
            <DefinitionField
                field={{ name: 'team', type: 'team', label: 'Team' }}
                path="team"
                value={null}
                onChange={() => undefined}
            />,
        );
        expect(screen.queryByRole('group', { name: 'Team' })).not.toBeInTheDocument();
    });
});

describe('defineCompoundField', () => {
    it('lays out the sub-fields of each item, titled by their summary', () => {
        renderField(
            <DefinitionField
                field={team}
                path="team"
                value={[{ name: 'Ada', role: 'Lead' }, { role: 'Design' }]}
                onChange={() => undefined}
            />,
            { components: { ...builtInFields, team: TeamFieldEntry } },
        );
        const items = screen.getAllByRole('listitem');
        expect(items[0]).toHaveAccessibleName(/^1\s*Ada$/);
        expect(items[1]).toHaveAccessibleName(/^2\s*Item 2$/);
        const layout = within(items[0] as HTMLElement).getByTestId('layout');
        const inputs = within(layout).getAllByRole('textbox');
        expect(inputs.map((input) => input.getAttribute('name'))).toEqual([
            'team.0.role',
            'team.0.name',
        ]);
    });

    it('gives its summary to lists, joined for a list', () => {
        const context = { field: team, locale: 'en' };
        expect(
            summarizeCompound(
                TeamFieldEntry,
                [{ name: 'Ada' }, { name: '' }, { name: 'Grace' }],
                context,
            ),
        ).toBe('Ada, Grace');
        expect(summarizeCompound(TeamFieldEntry, { name: 'Ada' }, context)).toBe('Ada');
        expect(summarizeCompound(TeamFieldEntry, null, context)).toBeNull();
        expect(summarizeCompound(builtInFields.group, [{ name: 'Ada' }], context)).toBeNull();
    });
});
