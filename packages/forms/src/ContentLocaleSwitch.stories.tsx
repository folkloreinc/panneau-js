import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import type { Field, LayoutNode } from '@panneau/protocol';

import { Form } from './Form';

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
    { name: 'featured', type: 'boolean', label: 'Featured' },
];

const SIDEBAR_LAYOUT: LayoutNode[] = [
    { type: 'field', name: 'title' },
    { type: 'field', name: 'summary' },
    {
        type: 'sidebar',
        label: 'Settings',
        children: [
            { type: 'field', name: 'slug' },
            { type: 'field', name: 'featured' },
        ],
    },
];

/**
 * A form that asks for it (`languageSwitch`, `form.languageSwitch` of a resource) has one language
 * switch above its fields, which sets the language of every localized field at once, when it has
 * localized fields and more than one locale (decision 0108). Without it, the default, each
 * localized field has its own switch only.
 */
const meta = {
    title: 'Forms/Language switch',
    component: Form,
    args: {
        fields: FIELDS,
        languageSwitch: true,
        locales: ['fr', 'en'],
        values: { title: { fr: 'Été', en: 'Summer' }, summary: { fr: 'Chaud' } },
        version: '1',
        onSubmit: fn(async () => undefined),
    },
    beforeEach: () => {
        try {
            window.localStorage.removeItem('panneau:content-locale');
        } catch {
            // Storage can be blocked
        }
    },
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

const SWITCH = { name: 'Language of the content' };

/** The default: no switch for the form, each field switched on its own, and copied. */
export const WithoutTheSetting: Story = {
    args: { languageSwitch: false },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const title = canvas.getByRole('group', { name: 'Title' });
        const summary = canvas.getByRole('group', { name: 'Summary' });
        await expect(canvas.queryByRole('radiogroup', SWITCH)).toBeNull();
        await userEvent.click(within(title).getByRole('radio', { name: 'English' }));
        await expect(within(title).getByRole('textbox', { name: 'English' })).toHaveValue('Summer');
        // The other fields stay on their own language
        await expect(within(summary).getByRole('textbox', { name: 'French' })).toBeVisible();
        await userEvent.click(
            within(summary).getByRole('radio', { name: 'Add a translation: English' }),
        );
        await userEvent.click(
            await within(summary).findByRole('button', { name: 'Copy from French' }),
        );
        await expect(within(summary).getByRole('textbox', { name: 'English' })).toHaveValue(
            'Chaud',
        );
        await expect(canvas.queryByRole('radiogroup', SWITCH)).toBeNull();
    },
};

export const SwitchesEveryField: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const languages = await canvas.findByRole('radiogroup', SWITCH);
        const title = canvas.getByRole('group', { name: 'Title' });
        const summary = canvas.getByRole('group', { name: 'Summary' });
        await expect(within(title).getByRole('textbox', { name: 'French' })).toHaveValue('Été');
        await userEvent.click(within(languages).getByRole('radio', { name: 'English' }));
        await expect(within(title).getByRole('textbox', { name: 'English' })).toHaveValue('Summer');
        await expect(within(summary).getByRole('textbox', { name: 'English' })).toHaveValue('');
        // A field switched on its own keeps its language until the form's switch changes again
        await userEvent.click(within(title).getByRole('radio', { name: 'French' }));
        await expect(within(title).getByRole('textbox', { name: 'French' })).toBeVisible();
        await expect(within(summary).getByRole('textbox', { name: 'English' })).toBeVisible();
        await userEvent.click(within(languages).getByRole('radio', { name: 'French' }));
        await userEvent.click(within(languages).getByRole('radio', { name: 'English' }));
        await expect(within(title).getByRole('textbox', { name: 'English' })).toBeVisible();
    },
};

export const CopyFromAnotherLanguage: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const save = canvas.getByRole('button', { name: 'Save' });
        await expect(save).toHaveAttribute('aria-disabled', 'true');
        await userEvent.click(
            within(await canvas.findByRole('radiogroup', SWITCH)).getByRole('radio', {
                name: 'English',
            }),
        );
        const summary = canvas.getByRole('group', { name: 'Summary' });
        await userEvent.click(
            await within(summary).findByRole('button', { name: 'Copy from French' }),
        );
        await expect(within(summary).getByRole('textbox', { name: 'English' })).toHaveValue(
            'Chaud',
        );
        // A copy is an edit: the form has something to save
        await expect(save).not.toHaveAttribute('aria-disabled');
    },
};

/** With a sidebar, the switch stays above the fields; its marks come from the form's state. */
export const MarksAndErrors: Story = {
    args: {
        layout: SIDEBAR_LAYOUT,
        values: { title: { fr: 'Été' }, summary: { fr: 'Chaud' } },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const languages = await canvas.findByRole('radiogroup', SWITCH);
        await expect(
            within(languages).getByRole('radio', { name: 'English, required values missing' }),
        ).toBeInTheDocument();
        await userEvent.type(
            within(canvas.getByRole('group', { name: 'Title' })).getByRole('textbox', {
                name: 'French',
            }),
            '!',
        );
        await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
        // The first error is in English: the form's switch moves to it
        await waitFor(() =>
            expect(
                within(languages).getByRole('radio', { name: 'English, has errors' }),
            ).toBeChecked(),
        );
        await userEvent.click(within(languages).getByRole('radio', { name: 'French' }));
        // Picking the error in the summary moves the switch again
        const summary = await canvas.findByRole('alert');
        await userEvent.click(within(summary).getByRole('button', { name: /Title/ }));
        await waitFor(() =>
            expect(
                within(languages).getByRole('radio', { name: 'English, has errors' }),
            ).toBeChecked(),
        );
    },
};
