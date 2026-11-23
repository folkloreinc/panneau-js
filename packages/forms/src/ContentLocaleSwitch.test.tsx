import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Field } from '@panneau/protocol';

import { Form } from './Form';
import { renderForm } from './__fixtures__/render';

const FIELDS: Field[] = [
    {
        name: 'title',
        type: 'text',
        label: 'Title',
        localized: true,
        rules: [{ rule: 'required' }],
    },
    { name: 'summary', type: 'textarea', label: 'Summary', localized: true },
    { name: 'slug', type: 'text', label: 'Slug' },
];

const LOCALES = ['fr', 'en'];

/** The switch loads with `import()`, after the form. */
function getSwitch() {
    return screen.findByRole('radiogroup', { name: 'Language of the content' });
}

afterEach(() => {
    window.localStorage.clear();
});

describe('The language switch of a form', () => {
    it('sets the language of every localized field at once', async () => {
        renderForm(
            <Form
                languageSwitch
                fields={FIELDS}
                locales={LOCALES}
                values={{ title: { fr: 'Été', en: 'Summer' }, summary: { fr: 'Chaud' } }}
                onSubmit={vi.fn()}
            />,
        );
        const title = screen.getByRole('group', { name: 'Title' });
        const summary = screen.getByRole('group', { name: 'Summary' });
        expect(within(await getSwitch()).getByRole('radio', { name: 'French' })).toBeChecked();
        expect(within(title).getByRole('textbox', { name: 'French' })).toHaveValue('Été');
        await userEvent.click(within(await getSwitch()).getByRole('radio', { name: 'English' }));
        expect(within(title).getByRole('textbox', { name: 'English' })).toHaveValue('Summer');
        expect(within(summary).getByRole('textbox', { name: 'English' })).toHaveValue('');
        expect(within(title).queryByRole('textbox', { name: 'French' })).toBeNull();
    });

    it('is remembered by the browser for the next forms', async () => {
        const { unmount } = renderForm(
            <Form languageSwitch fields={FIELDS} locales={LOCALES} onSubmit={vi.fn()} />,
        );
        await userEvent.click(within(await getSwitch()).getByRole('radio', { name: /English/ }));
        expect(window.localStorage.getItem('panneau:content-locale')).toBe('en');
        unmount();
        renderForm(<Form languageSwitch fields={FIELDS} locales={LOCALES} onSubmit={vi.fn()} />);
        expect(within(await getSwitch()).getByRole('radio', { name: /English/ })).toBeChecked();
        expect(
            within(screen.getByRole('group', { name: 'Title' })).getByRole('textbox', {
                name: 'English',
            }),
        ).toBeInTheDocument();
    });

    it('shows only with localized fields and more than one locale', () => {
        const { unmount } = renderForm(
            <Form languageSwitch fields={FIELDS} locales={['fr']} onSubmit={vi.fn()} />,
        );
        expect(screen.queryByRole('radiogroup', { name: 'Language of the content' })).toBeNull();
        unmount();
        renderForm(
            <Form
                languageSwitch
                fields={[{ name: 'slug', type: 'text', label: 'Slug' }]}
                locales={LOCALES}
                onSubmit={vi.fn()}
            />,
        );
        expect(screen.queryByRole('radiogroup', { name: 'Language of the content' })).toBeNull();
    });

    it('shows for localized fields inside blocks', async () => {
        renderForm(
            <Form
                languageSwitch
                fields={[
                    {
                        name: 'blocks',
                        type: 'repeater',
                        label: 'Blocks',
                        types: [
                            {
                                id: 'text',
                                label: 'Text',
                                fields: [
                                    { name: 'body', type: 'text', label: 'Body', localized: true },
                                ],
                            },
                        ],
                    },
                ]}
                locales={LOCALES}
                onSubmit={vi.fn()}
            />,
        );
        expect(await getSwitch()).toBeInTheDocument();
    });

    it('says which languages miss required values or have errors', async () => {
        renderForm(
            <Form
                languageSwitch
                fields={FIELDS}
                locales={LOCALES}
                values={{ title: { fr: 'Été' }, summary: { en: 'Hot' } }}
                onSubmit={vi.fn()}
            />,
        );
        expect(
            within(await getSwitch()).getByRole('radio', { name: 'French' }),
        ).toBeInTheDocument();
        expect(
            within(await getSwitch()).getByRole('radio', {
                name: 'English, required values missing',
            }),
        ).toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(async () =>
            expect(
                within(await getSwitch()).getByRole('radio', { name: 'English, has errors' }),
            ).toBeChecked(),
        );
        // Filled, the locale has nothing to say any more
        await userEvent.type(
            within(screen.getByRole('group', { name: 'Title' })).getByRole('textbox', {
                name: 'English',
            }),
            'Summer',
        );
        await waitFor(async () =>
            expect(within(await getSwitch()).getByRole('radio', { name: 'English' })).toBeChecked(),
        );
    });

    it('lets a field switch on its own until the form switches again', async () => {
        renderForm(
            <Form
                languageSwitch
                fields={FIELDS}
                locales={LOCALES}
                values={{ title: { fr: 'Été', en: 'Summer' }, summary: { fr: 'Chaud' } }}
                onSubmit={vi.fn()}
            />,
        );
        const title = screen.getByRole('group', { name: 'Title' });
        const summary = screen.getByRole('group', { name: 'Summary' });
        await userEvent.click(within(title).getByRole('radio', { name: 'English' }));
        expect(within(title).getByRole('textbox', { name: 'English' })).toBeInTheDocument();
        expect(within(summary).getByRole('textbox', { name: 'French' })).toBeInTheDocument();
        expect(within(await getSwitch()).getByRole('radio', { name: 'French' })).toBeChecked();
        // The form's switch changes: every field follows it, the one switched on its own too
        await userEvent.click(within(await getSwitch()).getByRole('radio', { name: 'English' }));
        await userEvent.click(within(await getSwitch()).getByRole('radio', { name: 'French' }));
        expect(within(title).getByRole('textbox', { name: 'French' })).toBeInTheDocument();
        expect(within(summary).getByRole('textbox', { name: 'French' })).toBeInTheDocument();
    });

    it('moves to the language of an error picked in the summary', async () => {
        renderForm(
            <Form
                languageSwitch
                fields={FIELDS}
                locales={LOCALES}
                values={{ title: { fr: 'Été' } }}
                onSubmit={vi.fn()}
            />,
        );
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        const summary = await screen.findByRole('alert');
        await waitFor(async () =>
            expect(within(await getSwitch()).getByRole('radio', { name: /English/ })).toBeChecked(),
        );
        await userEvent.click(within(await getSwitch()).getByRole('radio', { name: 'French' }));
        expect(within(await getSwitch()).getByRole('radio', { name: 'French' })).toBeChecked();
        await userEvent.click(within(summary).getByRole('button', { name: /Title/ }));
        await waitFor(async () =>
            expect(within(await getSwitch()).getByRole('radio', { name: /English/ })).toBeChecked(),
        );
        await waitFor(() =>
            expect(
                within(screen.getByRole('group', { name: 'Title' })).getByRole('textbox', {
                    name: 'English',
                }),
            ).toHaveFocus(),
        );
    });
});

describe('A form without a language switch (the default)', () => {
    it('shows none: each localized field has its own, on its first locale', async () => {
        // A language the user chose in a form with the switch isn't applied here
        window.localStorage.setItem('panneau:content-locale', 'en');
        renderForm(
            <Form
                fields={FIELDS}
                locales={LOCALES}
                values={{ title: { fr: 'Été', en: 'Summer' } }}
                onSubmit={vi.fn()}
            />,
        );
        const title = screen.getByRole('group', { name: 'Title' });
        expect(within(title).getByRole('textbox', { name: 'French' })).toHaveValue('Été');
        expect(within(title).getByRole('radiogroup', { name: 'Languages' })).toBeInTheDocument();
        await waitFor(() =>
            expect(
                screen.queryByRole('radiogroup', { name: 'Language of the content' }),
            ).toBeNull(),
        );
    });

    it('moves nothing but the field in error: a field switched on its own stays', async () => {
        renderForm(
            <Form
                fields={[
                    ...FIELDS.slice(0, 1),
                    {
                        name: 'summary',
                        type: 'textarea',
                        label: 'Summary',
                        localized: true,
                        rules: [{ rule: 'required' }],
                    },
                ]}
                locales={LOCALES}
                values={{ title: { fr: 'Été', en: 'Summer' }, summary: { fr: 'Chaud' } }}
                onSubmit={vi.fn()}
            />,
        );
        const title = screen.getByRole('group', { name: 'Title' });
        const summary = screen.getByRole('group', { name: 'Summary' });
        await userEvent.click(within(title).getByRole('radio', { name: 'English' }));
        await userEvent.click(within(summary).getByRole('radio', { name: /French/ }));
        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        // The error is in the summary's English: the summary moves to it, the title stays
        await waitFor(() =>
            expect(within(summary).getByRole('textbox', { name: 'English' })).toHaveFocus(),
        );
        expect(within(title).getByRole('textbox', { name: 'English' })).toBeInTheDocument();
        await userEvent.click(within(title).getByRole('radio', { name: 'French' }));
        await userEvent.click(
            within(await screen.findByRole('alert')).getByRole('button', { name: /Summary/ }),
        );
        expect(within(title).getByRole('textbox', { name: 'French' })).toBeInTheDocument();
    });

    it('copies a value from another language, as an edit of the form', async () => {
        renderForm(
            <Form
                fields={FIELDS}
                locales={LOCALES}
                values={{ title: { fr: 'Été', en: 'Summer' }, summary: { fr: 'Chaud' } }}
                version="1"
                onSubmit={vi.fn()}
            />,
        );
        expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
            'aria-disabled',
            'true',
        );
        const summary = screen.getByRole('group', { name: 'Summary' });
        await userEvent.click(
            within(summary).getByRole('radio', { name: 'Add a translation: English' }),
        );
        await userEvent.click(
            await within(summary).findByRole('button', { name: 'Copy from French' }),
        );
        expect(within(summary).getByRole('textbox', { name: 'English' })).toHaveValue('Chaud');
        expect(within(summary).queryByRole('button', { name: /Copy from/ })).toBeNull();
        expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute('aria-disabled');
    });
});
