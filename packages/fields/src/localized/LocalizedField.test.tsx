import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';
import { describe, expect, it, vi } from 'vitest';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { TextField } from '../text/TextField';
import { LocalizedField } from './LocalizedField';

describe('LocalizedField', () => {
    it('shows one locale at a time, switched at the end of the label', async () => {
        const onChange = vi.fn();
        renderField(
            <LocalizedField<string>
                label="Title"
                locales={['fr', 'en']}
                value={{ fr: 'Été' }}
                onChange={onChange}
            >
                {(input) => (
                    <TextField
                        aria-label={input.label}
                        value={input.value}
                        onChange={input.onChange}
                    />
                )}
            </LocalizedField>,
        );
        expect(screen.getByRole('group', { name: 'Title' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'French' })).toHaveValue('Été');
        expect(screen.queryByRole('textbox', { name: 'English' })).toBeNull();
        // An empty locale of a field that isn't required is a translation to add.
        await userEvent.click(screen.getByRole('radio', { name: 'Add a translation: English' }));
        expect(screen.queryByRole('textbox', { name: 'French' })).toBeNull();
        await userEvent.type(screen.getByRole('textbox', { name: 'English' }), 'S');
        expect(onChange).toHaveBeenLastCalledWith({ fr: 'Été', en: 'S' });
    });

    it('marks the empty locales of a required field, and those in error', () => {
        renderField(
            <LocalizedField<string>
                label="Title"
                locales={['fr', 'en', 'es']}
                value={{ fr: 'Été' }}
                invalidLocales={['es']}
                required
            >
                {(input) => <TextField aria-label={input.label} value={input.value} />}
            </LocalizedField>,
        );
        expect(screen.getByRole('radio', { name: 'French' })).toBeChecked();
        expect(screen.getByRole('radio', { name: 'English, empty' })).toBeInTheDocument();
        expect(screen.getByRole('radio', { name: 'Spanish, has errors' })).toBeInTheDocument();
    });

    it('shows a single locale without a switch', () => {
        renderField(
            <LocalizedField<string> label="Title" locales={['fr']} value={{ fr: 'Été' }}>
                {(input) => <TextField aria-label={input.label} value={input.value} />}
            </LocalizedField>,
        );
        expect(screen.queryByRole('radiogroup')).toBeNull();
        expect(screen.getByRole('textbox', { name: 'French' })).toHaveValue('Été');
    });

    it('is null when no locale is filled', async () => {
        const onChange = vi.fn();
        renderField(
            <LocalizedField<string>
                label="Title"
                locales={['fr']}
                value={{ fr: 'a' }}
                onChange={onChange}
            >
                {(input) => (
                    <TextField
                        aria-label={input.label}
                        value={input.value}
                        onChange={input.onChange}
                    />
                )}
            </LocalizedField>,
        );
        await userEvent.clear(screen.getByRole('textbox'));
        expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('renders localized fields of the definition with the locales of the context', async () => {
        const onChange = vi.fn();
        renderField(
            <IntlProvider locale="fr">
                <Controlled<unknown> initial={{ fr: 'Été', en: 'Summer' }} onChange={onChange}>
                    {(value, setValue) => (
                        <DefinitionField
                            field={{
                                name: 'title',
                                type: 'text',
                                label: 'Titre',
                                localized: true,
                                rules: [{ rule: 'required' }],
                            }}
                            path="title"
                            value={value}
                            onChange={setValue}
                        />
                    )}
                </Controlled>
            </IntlProvider>,
            { locales: ['fr', 'en'] },
        );
        expect(screen.getByRole('textbox', { name: 'Français' })).toHaveValue('Été');
        // The label of the field, not one per locale.
        expect(screen.getByRole('group', { name: 'Titre' })).toBeInTheDocument();
        await userEvent.click(screen.getByRole('radio', { name: 'Anglais' }));
        expect(screen.getByRole('textbox', { name: 'Anglais' })).toBeRequired();
        await userEvent.type(screen.getByRole('textbox', { name: 'Anglais' }), '!');
        expect(onChange).toHaveBeenLastCalledWith({ fr: 'Été', en: 'Summer!' });
    });
});
