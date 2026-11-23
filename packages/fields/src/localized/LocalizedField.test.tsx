import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { IntlProvider } from 'react-intl';
import { describe, expect, it, vi } from 'vitest';

import { Controlled, renderField } from '../__fixtures__/render';
import { DefinitionField } from '../shared/DefinitionField';
import { type ContentLocale, ContentLocaleContext } from '../shared/contentLocale';
import { RevealContext, createRevealRegistry } from '../shared/reveal';
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

    it('follows the locale of the form, unless switched on its own until it changes', async () => {
        const setLocale = vi.fn();
        function Harness() {
            const [changes, setChanges] = useState(0);
            return (
                <ContentLocaleContext value={{ locale: 'en', setLocale, changes }}>
                    <button type="button" onClick={() => setChanges(changes + 1)}>
                        Switch the form
                    </button>
                    <LocalizedField<string>
                        label="Title"
                        locales={['fr', 'en']}
                        value={{ fr: 'Été', en: 'Summer' }}
                    >
                        {(input) => <TextField aria-label={input.label} value={input.value} />}
                    </LocalizedField>
                </ContentLocaleContext>
            );
        }
        renderField(<Harness />);
        expect(screen.getByRole('textbox', { name: 'English' })).toHaveValue('Summer');
        await userEvent.click(screen.getByRole('radio', { name: 'French' }));
        expect(screen.getByRole('textbox', { name: 'French' })).toBeInTheDocument();
        // Switched on its own: the form's switch didn't move
        expect(setLocale).not.toHaveBeenCalled();
        // The form's switch changes again, even to the locale it had: the field follows it
        await userEvent.click(screen.getByRole('button', { name: 'Switch the form' }));
        expect(screen.getByRole('textbox', { name: 'English' })).toBeInTheDocument();
    });

    it('moves the switch of the form to the locale of an error it reveals', () => {
        const registry = createRevealRegistry();
        const content: ContentLocale = { locale: 'fr', setLocale: vi.fn(), changes: 0 };
        renderField(
            <RevealContext value={registry}>
                <ContentLocaleContext value={content}>
                    <DefinitionField
                        field={{ name: 'title', type: 'text', label: 'Title', localized: true }}
                        path="title"
                        value={{ fr: 'Été' }}
                        onChange={vi.fn()}
                    />
                </ContentLocaleContext>
            </RevealContext>,
            { locales: ['fr', 'en'] },
        );
        act(() => registry.reveal('summary.en'));
        expect(content.setLocale).not.toHaveBeenCalled();
        act(() => registry.reveal('title.en'));
        expect(content.setLocale).toHaveBeenCalledWith('en');
    });

    it('copies an empty locale from the filled one', async () => {
        const onChange = vi.fn();
        renderField(
            <LocalizedField<string>
                label="Title"
                locales={['fr', 'en']}
                locale="en"
                value={{ fr: 'Été' }}
                onChange={onChange}
            >
                {(input) => <TextField aria-label={input.label} value={input.value} />}
            </LocalizedField>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Copy from French' }));
        expect(onChange).toHaveBeenLastCalledWith({ fr: 'Été', en: 'Été' });
    });

    it('copies an empty locale from one of the filled ones, in a menu', async () => {
        const onChange = vi.fn();
        renderField(
            <LocalizedField<string>
                label="Title"
                locales={['fr', 'en', 'es']}
                locale="en"
                value={{ fr: 'Été', es: 'Verano' }}
                onChange={onChange}
            >
                {(input) => <TextField aria-label={input.label} value={input.value} />}
            </LocalizedField>,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Copy from…' }));
        await userEvent.click(await screen.findByRole('menuitem', { name: 'Spanish' }));
        expect(onChange).toHaveBeenLastCalledWith({ fr: 'Été', en: 'Verano', es: 'Verano' });
    });

    it('copies nothing into a filled locale, nor in a read-only field', () => {
        const { unmount } = renderField(
            <LocalizedField<string> label="Title" locales={['fr', 'en']} value={{ fr: 'Été' }}>
                {(input) => <TextField aria-label={input.label} value={input.value} />}
            </LocalizedField>,
        );
        expect(screen.queryByRole('button', { name: /Copy from/ })).toBeNull();
        unmount();
        renderField(
            <LocalizedField<string>
                label="Title"
                locales={['fr', 'en']}
                locale="en"
                value={{ fr: 'Été' }}
                readOnly
            >
                {(input) => <TextField aria-label={input.label} value={input.value} />}
            </LocalizedField>,
        );
        expect(screen.queryByRole('button', { name: /Copy from/ })).toBeNull();
    });
});
