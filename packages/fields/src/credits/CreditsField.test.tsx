import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import type { FieldBindingProps } from '../shared/context';
import type { RelationReference, RelationSource } from '../shared/relation';
import { CreditsField } from './CreditsField';
import { type Credit, formatCredits, toCredits } from './credits';

const PEOPLE: RelationReference[] = [
    { id: '1', label: 'Ada Lovelace' },
    { id: '2', label: 'Grace Hopper' },
];
const ROLES: RelationReference[] = [
    { id: '10', label: 'Director' },
    { id: '11', label: 'Music' },
];

function createSource({ create = false }: { create?: boolean } = {}) {
    const items: Record<string, RelationReference[]> = { people: PEOPLE, roles: ROLES };
    const source: RelationSource = {
        search: vi.fn(async (resource: string, query: string) =>
            (items[resource] ?? []).filter((item) =>
                item.label.toLowerCase().includes(query.toLowerCase()),
            ),
        ),
        resolve: vi.fn(async (resource: string, ids: readonly string[]) =>
            (items[resource] ?? []).filter((item) => ids.includes(item.id)),
        ),
    };
    if (create) {
        source.create = vi.fn(async (_resource: string, text: string) => ({
            id: '9',
            label: text,
        }));
    }
    return source;
}

function renderCredits(
    props: Partial<Parameters<typeof CreditsField>[0]> & { initial?: Credit[] | null },
    options: Parameters<typeof renderField>[1] = {},
) {
    const onChange = vi.fn();
    const { initial = null, ...rest } = props;
    renderField(
        <Controlled<Credit[] | null> initial={initial} onChange={onChange}>
            {(value, setValue) => (
                <CreditsField
                    label="Credits"
                    name="credits"
                    value={value}
                    onChange={setValue}
                    {...rest}
                />
            )}
        </Controlled>,
        options,
    );
    return { onChange };
}

describe('CreditsField', () => {
    it('picks a person in the resource, and types the name of a role', async () => {
        const { onChange } = renderCredits(
            { resource: 'people' },
            { relationSource: createSource() },
        );
        expect(screen.getByText('No credits yet.')).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Add a credit' }));
        expect(onChange).toHaveBeenLastCalledWith([{ person: null, roles: [] }]);

        await userEvent.type(screen.getByRole('combobox', { name: 'Person' }), 'ada');
        await userEvent.click(await screen.findByRole('option', { name: 'Ada Lovelace' }));
        await userEvent.click(screen.getByRole('button', { name: 'Add a role' }));
        await userEvent.type(screen.getByRole('textbox', { name: 'Role 1' }), 'Text');
        expect(onChange).toHaveBeenLastCalledWith([
            { person: { id: '1', label: 'Ada Lovelace' }, roles: [{ name: { en: 'Text' } }] },
        ]);
        // The credit is named by its person.
        expect(screen.getByRole('listitem', { name: '1Ada Lovelace' })).toBeInTheDocument();
    });

    it('keeps a person who isn’t in the resource as a name', async () => {
        const { onChange } = renderCredits(
            { resource: 'people', initial: [{ person: null, roles: [] }] },
            { relationSource: createSource() },
        );
        await userEvent.type(screen.getByRole('combobox', { name: 'Person' }), 'Jane Doe');
        await userEvent.click(
            await screen.findByRole('option', { name: 'Add “Jane Doe” as a name' }),
        );
        expect(onChange).toHaveBeenLastCalledWith([{ person: { name: 'Jane Doe' }, roles: [] }]);
        expect(screen.getByRole('combobox', { name: 'Person' })).toHaveValue('Jane Doe');
        expect(screen.getByText('Name only')).toBeInTheDocument();
    });

    it('creates a person from the picker when the source can', async () => {
        const source = createSource({ create: true });
        const { onChange } = renderCredits(
            { resource: 'people', names: false, initial: [{ person: null, roles: [] }] },
            { relationSource: source },
        );
        await userEvent.type(screen.getByRole('combobox', { name: 'Person' }), 'Jane Doe');
        expect(
            await screen.findByRole('option', { name: 'Create “Jane Doe”' }),
        ).toBeInTheDocument();
        // `names: false`: a person must be in the resource.
        expect(screen.queryByRole('option', { name: /as a name/ })).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('option', { name: 'Create “Jane Doe”' }));
        expect(source.create).toHaveBeenCalledWith('people', 'Jane Doe');
        expect(onChange).toHaveBeenLastCalledWith([
            { person: { id: '9', label: 'Jane Doe' }, roles: [] },
        ]);
    });

    it('types names without a resource of people', async () => {
        const { onChange } = renderCredits({ initial: [{ person: null, roles: [] }] });
        await userEvent.type(screen.getByRole('textbox', { name: 'Person' }), 'Jane');
        expect(onChange).toHaveBeenLastCalledWith([{ person: { name: 'Jane' }, roles: [] }]);
    });

    it('picks roles in the resource of roles, and resolves the labels of ids', async () => {
        const { onChange } = renderCredits(
            {
                resource: 'people',
                roles: 'roles',
                initial: toCredits([{ person: '2', roles: [] }]),
            },
            { relationSource: createSource() },
        );
        expect(await screen.findByRole('combobox', { name: 'Person' })).toHaveValue('Grace Hopper');
        await userEvent.type(screen.getByRole('combobox', { name: 'Roles' }), 'mus');
        await userEvent.click(await screen.findByRole('option', { name: 'Music' }));
        expect(onChange).toHaveBeenLastCalledWith([
            { person: { id: '2', label: '2' }, roles: [{ id: '11', label: 'Music' }] },
        ]);
    });

    it('names roles in each locale', async () => {
        const { onChange } = renderCredits({
            locales: ['fr', 'en'],
            initial: [{ person: { name: 'Jane' }, roles: [{ name: { fr: 'Musique' } }] }],
        });
        expect(screen.getByRole('textbox', { name: 'Role 1 (French)' })).toHaveValue('Musique');
        await userEvent.click(screen.getByRole('radio', { name: 'English' }));
        const english = screen.getByRole('textbox', { name: 'Role 1 (English)' });
        // The name in another locale is a hint until it is translated.
        expect(english).toHaveValue('');
        expect(english).toHaveAttribute('placeholder', 'Musique');
        await userEvent.type(english, 'Music');
        expect(onChange).toHaveBeenLastCalledWith([
            { person: { name: 'Jane' }, roles: [{ name: { fr: 'Musique', en: 'Music' } }] },
        ]);
        await userEvent.click(screen.getByRole('button', { name: 'Remove role 1' }));
        expect(onChange).toHaveBeenLastCalledWith([{ person: { name: 'Jane' }, roles: [] }]);
    });

    it('marks featured credits, and leaves the flag out otherwise', async () => {
        const { onChange } = renderCredits({
            featured: true,
            initial: [{ person: { name: 'Jane' }, roles: [] }],
        });
        const checkbox = screen.getByRole('checkbox', { name: 'Featured' });
        await userEvent.click(checkbox);
        expect(onChange).toHaveBeenLastCalledWith([
            { person: { name: 'Jane' }, roles: [], featured: true },
        ]);
        await userEvent.click(checkbox);
        expect(onChange).toHaveBeenLastCalledWith([{ person: { name: 'Jane' }, roles: [] }]);
    });

    it('moves and removes credits, within min and max', async () => {
        const { onChange } = renderCredits({
            min: 1,
            max: 2,
            initial: [
                { person: { name: 'Jane' }, roles: [] },
                { person: { name: 'John' }, roles: [] },
            ],
        });
        expect(screen.getByRole('button', { name: 'Add a credit' })).toBeDisabled();
        await userEvent.click(screen.getByRole('button', { name: 'Move credit 2 up' }));
        expect(onChange).toHaveBeenLastCalledWith([
            { person: { name: 'John' }, roles: [] },
            { person: { name: 'Jane' }, roles: [] },
        ]);
        await userEvent.click(screen.getByRole('button', { name: 'Remove credit 1' }));
        expect(onChange).toHaveBeenLastCalledWith([{ person: { name: 'Jane' }, roles: [] }]);
        expect(screen.getByRole('button', { name: 'Remove credit 1' })).toBeDisabled();
    });

    it('shows the credits without controls when read-only', () => {
        renderCredits({
            readOnly: true,
            initial: [{ person: { name: 'Jane' }, roles: [{ name: { en: 'Music' } }] }],
        });
        expect(screen.queryByRole('button', { name: 'Add a credit' })).not.toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'Person' })).toHaveAttribute('readonly');
    });
});

describe('CreditsFieldEntry', () => {
    it('reads the settings of the field, and binds each part of a credit to its path', async () => {
        const setValue = vi.fn();
        const values: Record<string, unknown> = {
            credits: [{ person: { name: 'Jane' }, roles: [], note: 'Hi' }],
            'credits.0.person': { name: 'Jane' },
            'credits.0.roles': [],
            'credits.0.featured': undefined,
            'credits.0.note': 'Hi',
        };
        function Binding({ path, render }: FieldBindingProps) {
            return render({
                value: values[path],
                onChange: (value) => setValue(path, value),
                errors: path === 'credits.0.person' ? ['A person is required.'] : [],
            });
        }
        renderField(
            <DefinitionField
                field={{
                    name: 'credits',
                    type: 'credits',
                    label: 'Credits',
                    settings: { featured: true },
                    fields: [{ name: 'note', type: 'text', label: 'Note' }],
                }}
                path="credits"
                value={values.credits}
                onChange={() => undefined}
            />,
            { binding: Binding },
        );
        const person = screen.getByRole('textbox', { name: 'Person' });
        expect(person).toHaveAccessibleDescription('A person is required.');
        await userEvent.type(person, '!');
        expect(setValue).toHaveBeenLastCalledWith('credits.0.person', { name: 'Jane!' });
        await userEvent.click(screen.getByRole('checkbox', { name: 'Featured' }));
        expect(setValue).toHaveBeenLastCalledWith('credits.0.featured', true);
        expect(screen.getByRole('textbox', { name: 'Note' })).toHaveValue('Hi');
        const item = screen.getByRole('listitem', { name: '1Jane' });
        expect(within(item).getByRole('button', { name: 'Add a role' })).toBeInTheDocument();
    });
});

describe('formatCredits', () => {
    it('lists the people with their roles, sharing the roles of consecutive credits', () => {
        expect(
            formatCredits(
                [
                    {
                        person: { id: '1', label: 'Ada Lovelace' },
                        roles: [{ id: '10', label: 'Director' }],
                        featured: true,
                    },
                    {
                        person: { name: 'Jane Doe' },
                        roles: [{ name: { fr: 'Musique', en: 'Music' } }],
                    },
                    {
                        person: { name: 'John Roe' },
                        roles: [{ name: { fr: 'Musique', en: 'Music' } }],
                    },
                    { person: { name: 'Lou' }, roles: [{ name: { fr: 'Texte' } }] },
                    { person: { name: 'Grace' }, roles: [] },
                    { person: null, roles: [] },
                ],
                'en-CA',
            ),
        ).toBe('Ada Lovelace (Director), Jane Doe, John Roe (Music), Lou (Texte), Grace');
        expect(formatCredits(null, 'en')).toBe('');
    });

    it('reads ids and drops what isn’t a credit', () => {
        expect(
            toCredits([{ person: '3', roles: ['4', { name: { fr: 'Texte' } }, 5] }, 'x']),
        ).toEqual([
            {
                person: { id: '3', label: '3' },
                roles: [
                    { id: '4', label: '4' },
                    { name: { fr: 'Texte' } },
                    { id: '5', label: '5' },
                ],
            },
        ]);
    });
});
