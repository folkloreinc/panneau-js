import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from 'react-intl';
import { describe, expect, it, vi } from 'vitest';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { TextField } from '../text/TextField';
import { LocalizedField } from './LocalizedField';

describe('LocalizedField', () => {
    it('renders an input per locale, labelled with the name of the locale', async () => {
        const onChange = vi.fn();
        renderField(
            <LocalizedField<string>
                label="Title"
                locales={['fr', 'en']}
                value={{ fr: 'Été' }}
                onChange={onChange}
            >
                {(input) => (
                    <TextField label={input.label} value={input.value} onChange={input.onChange} />
                )}
            </LocalizedField>,
        );
        expect(screen.getByRole('group', { name: 'Title' })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: 'French' })).toHaveValue('Été');
        await userEvent.type(screen.getByRole('textbox', { name: 'English' }), 'S');
        expect(onChange).toHaveBeenLastCalledWith({ fr: 'Été', en: 'S' });
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
                    <TextField label={input.label} value={input.value} onChange={input.onChange} />
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
        expect(screen.getByRole('textbox', { name: /Français/ })).toHaveValue('Été');
        expect(screen.getByRole('textbox', { name: /Anglais/ })).toBeRequired();
        await userEvent.type(screen.getByRole('textbox', { name: /Anglais/ }), '!');
        expect(onChange).toHaveBeenLastCalledWith({ fr: 'Été', en: 'Summer!' });
    });
});
