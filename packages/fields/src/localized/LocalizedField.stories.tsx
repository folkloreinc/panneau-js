import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { ContentLocaleContext } from '../shared/contentLocale';
import { TextField } from '../text/TextField';
import { LocalizedField, type LocalizedValue } from './LocalizedField';

const meta = {
    title: 'Fields/Localized',
    component: LocalizedField<string>,
    args: { label: 'Title', locales: ['fr', 'en'], children: () => null },
} satisfies Meta<typeof LocalizedField<string>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<LocalizedValue<string> | null>({ fr: 'Été' });
        return (
            <LocalizedField<string> {...args} value={value} onChange={setValue}>
                {(input) => (
                    <TextField
                        aria-label={input.label}
                        value={input.value}
                        onChange={input.onChange}
                    />
                )}
            </LocalizedField>
        );
    },
};

/** An empty locale copies the value of the filled one, then is edited from there. */
export const CopyFromAnotherLanguage: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<LocalizedValue<string> | null>({ fr: 'Été' });
        return (
            <LocalizedField<string> {...args} value={value} onChange={setValue}>
                {(input) => (
                    <TextField
                        aria-label={input.label}
                        value={input.value}
                        onChange={input.onChange}
                    />
                )}
            </LocalizedField>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.queryByRole('button', { name: /Copy from/ })).toBeNull();
        await userEvent.click(canvas.getByRole('radio', { name: 'Add a translation: English' }));
        await userEvent.click(canvas.getByRole('button', { name: 'Copy from French' }));
        await expect(canvas.getByRole('textbox', { name: 'English' })).toHaveValue('Été');
        await expect(canvas.queryByRole('button', { name: /Copy from/ })).toBeNull();
    },
};

/**
 * In a form with a language switch, the field shows the form's locale. Switched on its own, it
 * keeps its locale until the form's switch changes again.
 */
export const FollowsTheForm: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<LocalizedValue<string> | null>({
            fr: 'Été',
            en: 'Summer',
        });
        const [locale, setLocale] = useState('en');
        const [changes, setChanges] = useState(0);
        const switchForm = (next: string) => {
            setLocale(next);
            setChanges(changes + 1);
        };
        return (
            <ContentLocaleContext value={{ locale, setLocale: switchForm, changes }}>
                <p>
                    <button type="button" onClick={() => switchForm(locale === 'fr' ? 'en' : 'fr')}>
                        Switch the form ({locale})
                    </button>
                </p>
                <LocalizedField<string> {...args} value={value} onChange={setValue}>
                    {(input) => (
                        <TextField
                            aria-label={input.label}
                            value={input.value}
                            onChange={input.onChange}
                        />
                    )}
                </LocalizedField>
            </ContentLocaleContext>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('textbox', { name: 'English' })).toHaveValue('Summer');
        await userEvent.click(canvas.getByRole('radio', { name: 'French' }));
        await expect(canvas.getByRole('textbox', { name: 'French' })).toHaveValue('Été');
        await userEvent.click(canvas.getByRole('button', { name: 'Switch the form (en)' }));
        await expect(canvas.getByRole('textbox', { name: 'French' })).toBeInTheDocument();
        await userEvent.click(canvas.getByRole('button', { name: 'Switch the form (fr)' }));
        await expect(canvas.getByRole('textbox', { name: 'English' })).toBeInTheDocument();
    },
};
