import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderField } from '../__fixtures__/render';
import { NestedField } from './DefinitionField';
import { builtInFields, fieldsPlugin } from './builtIn';
import type { FieldBinding } from './context';

describe('NestedField', () => {
    it('hides itself when its condition on the parent value is false', () => {
        renderField(
            <NestedField
                field={{
                    name: 'note',
                    type: 'text',
                    label: 'Note',
                    visibleWhen: { field: 'on', equals: true },
                }}
                path="note"
                parentValue={{ on: false }}
            />,
        );
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('binds the fields inside a repeater', async () => {
        const setValue = vi.fn();
        const Binding: FieldBinding = ({ path, render }) =>
            render({
                value: path === 'blocks' ? [{ text: 'stored elsewhere' }] : `value of ${path}`,
                onChange: (value) => setValue(path, value),
                errors: path === 'blocks.0.text' ? ['Required.'] : [],
            });
        renderField(
            <NestedField
                field={{
                    name: 'blocks',
                    type: 'repeater',
                    label: 'Blocks',
                    fields: [{ name: 'text', type: 'text', label: 'Text' }],
                }}
                path="blocks"
            />,
            { binding: Binding },
        );
        const input = screen.getByRole('textbox', { name: 'Text' });
        expect(input).toHaveValue('value of blocks.0.text');
        expect(input).toHaveAccessibleDescription('Required.');
        await userEvent.type(input, '!');
        expect(setValue).toHaveBeenLastCalledWith('blocks.0.text', 'value of blocks.0.text!');
    });
});

describe('fieldsPlugin', () => {
    it('provides the built-in types and the French messages of every package', () => {
        expect(Object.keys(builtInFields).sort()).toEqual(
            [
                'boolean',
                'color',
                'date',
                'datetime',
                'file',
                'group',
                'number',
                'relation',
                'repeater',
                'select',
                'slug',
                'text',
                'textarea',
                'time',
                'url',
                'email',
                'tel',
                'range',
                'duration',
                'json',
                'tags',
                'embed',
                'location',
            ].sort(),
        );
        expect(fieldsPlugin.fields).toBe(builtInFields);
        expect(fieldsPlugin.locales.fr?.['panneau.fields.add']).toBe('Ajouter');
        expect(fieldsPlugin.locales.fr?.['panneau.ui.close']).toBe('Fermer');
        expect(fieldsPlugin.locales.fr?.['panneau.forms.save']).toBe('Enregistrer');
    });
});
