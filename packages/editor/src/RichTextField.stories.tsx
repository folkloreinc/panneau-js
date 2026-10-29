import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { RichTextField } from './RichTextField';
import { ckeditor5 } from './__fixtures__/ckeditor';
import { Logo, logoButton } from './__fixtures__/logo';

const STYLES = [
    { label: 'Big paragraph', class: 'big' },
    { label: 'Lead', class: 'lead' },
];

const PLUGIN_EXTENSIONS = [Logo];
const PLUGIN_BUTTONS = [logoButton];

const meta = {
    title: 'Editor/RichText',
    component: RichTextField,
    args: { label: 'Body' },
    parameters: {
        a11y: {
            config: {
                rules: [
                    // The text is content: its headings follow the page it is written for (an
                    // `h4` after an `h2`), not the admin page around the field.
                    { id: 'heading-order', enabled: false },
                    // As in `.storybook/preview.tsx`, which this list replaces.
                    { id: 'label-content-name-mismatch', enabled: false },
                ],
            },
        },
    },
} satisfies Meta<typeof RichTextField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * HTML written by CKEditor 5, with the toolbar of a v4 project: text styles, a block style, marks,
 * links and lists. Embeds are kept as they were written, and shown by what they point to.
 */
export const Default: Story = {
    render: function Render(args) {
        const [value, setValue] = useState<string | null>(ckeditor5);
        return (
            <div style={{ maxWidth: '48rem' }}>
                <RichTextField
                    {...args}
                    value={value}
                    onChange={setValue}
                    toolbar={[
                        'heading',
                        'style',
                        '|',
                        'bold',
                        'italic',
                        'link',
                        '|',
                        'bulletList',
                        'orderedList',
                        'blockquote',
                        '|',
                        'undo',
                        'redo',
                    ]}
                    headings={[2, 3, 4]}
                    styles={STYLES}
                    newTab="external"
                />
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const textbox = canvas.getByRole('textbox', { name: 'Body' });
        await expect(
            within(textbox).getByRole('img', { name: /figure\.media, https:\/\/vimeo\.com/ }),
        ).toBeVisible();
        await userEvent.click(within(textbox).getByText('A big paragraph', { exact: false }));
        await waitFor(() =>
            expect(canvas.getByRole('button', { name: /Style$/ })).toHaveTextContent(
                'Big paragraph',
            ),
        );
        await userEvent.tripleClick(within(textbox).getByText('A quote.'));
        await userEvent.click(canvas.getByRole('button', { name: 'Bold' }));
        await expect(canvas.getByRole('button', { name: 'Bold' })).toHaveAttribute(
            'aria-pressed',
            'true',
        );
        await expect(within(textbox).getByText('A quote.').tagName).toBe('STRONG');
    },
};

/** Every button of the toolbar. */
export const FullToolbar: Story = {
    args: {
        toolbar: [
            'heading',
            'style',
            '|',
            'bold',
            'italic',
            'underline',
            'strike',
            'superscript',
            'subscript',
            'code',
            'link',
            '|',
            'bulletList',
            'orderedList',
            'blockquote',
            'horizontalRule',
            '|',
            'clear',
            'undo',
            'redo',
        ],
        headings: [1, 2, 3, 4, 5, 6],
        styles: STYLES,
    },
    render: function Render(args) {
        const [value, setValue] = useState<string | null>(
            '<h2>A heading</h2><p>Some <strong>bold</strong>, <em>italic</em>, <u>underlined</u> and <s>struck</s> text, x<sup>2</sup> and H<sub>2</sub>O.</p>',
        );
        return (
            <div style={{ maxWidth: '48rem' }}>
                <RichTextField {...args} value={value} onChange={setValue} />
            </div>
        );
    },
};

/** An inline logo, as a project adds it with a plugin: its TipTap node and its button. */
export const WithPlugin: Story = {
    args: { toolbar: ['bold', 'italic', '|', 'logo'] },
    render: function Render(args) {
        const [value, setValue] = useState<string | null>(
            '<p>Made by <span class="logo" data-logo=""></span> in Montréal.</p>',
        );
        return (
            <div style={{ maxWidth: '48rem' }}>
                <style>{'.logo::before { content: "★"; font-weight: bold; }'}</style>
                <RichTextField
                    {...args}
                    value={value}
                    onChange={setValue}
                    extensions={PLUGIN_EXTENSIONS}
                    buttons={PLUGIN_BUTTONS}
                />
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const textbox = canvas.getByRole('textbox', { name: 'Body' });
        await expect(within(textbox).getAllByLabelText('Logo')).toHaveLength(1);
        await userEvent.tripleClick(within(textbox).getByText('in Montréal.', { exact: false }));
        await userEvent.click(canvas.getByRole('button', { name: 'Logo' }));
        await waitFor(() => expect(within(textbox).getAllByLabelText('Logo')).toHaveLength(1));
        await expect(textbox).not.toHaveTextContent('Made by');
    },
};

/** Empty, with a placeholder, required and with an error. */
export const Invalid: Story = {
    args: {
        placeholder: 'Write the article…',
        required: true,
        errors: ['The body is required.'],
        toolbar: ['bold', 'italic', 'link'],
    },
    render: function Render(args) {
        const [value, setValue] = useState<string | null>(null);
        return (
            <div style={{ maxWidth: '48rem' }}>
                <RichTextField {...args} value={value} onChange={setValue} />
            </div>
        );
    },
};

/** Read-only: no toolbar, and the text can't be edited. */
export const ReadOnly: Story = {
    args: { readOnly: true },
    render: (args) => (
        <div style={{ maxWidth: '48rem' }}>
            <RichTextField
                {...args}
                value='<p class="big">A big paragraph.</p><p>And a <a href="https://example.com">link</a>.</p>'
            />
        </div>
    ),
};
