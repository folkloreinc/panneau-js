import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { FieldsProvider, type RelationSource } from '@panneau/fields';
import { isApplePlatform } from '@panneau/ui';

import { RichTextField } from './RichTextField';
import { ckeditor5 } from './__fixtures__/ckeditor';
import { Logo, logoButton } from './__fixtures__/logo';

const STYLES = [
    { label: 'Big paragraph', class: 'big' },
    { label: 'Lead', class: 'lead' },
];

/** The keys of ⌘K or Ctrl+K, as `userEvent.keyboard()` writes them. */
const modKey = (key: string) => {
    const modifier = isApplePlatform() ? 'Meta' : 'Control';
    return `{${modifier}>}${key}{/${modifier}}`;
};

const PAGES = [
    { id: '1', label: 'Home' },
    { id: '12', label: 'About us' },
    { id: '13', label: 'Contact' },
];

/** The pages of a site, searched as the app's relation source would. */
const pageSource: RelationSource = {
    search: (_resource, query) =>
        Promise.resolve(
            PAGES.filter((page) => page.label.toLowerCase().includes(query.toLowerCase())),
        ),
};

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
            within(textbox).getByRole('img', {
                name: 'Embedded video, Vimeo, https://vimeo.com/123456',
            }),
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

/**
 * ⌘K (Ctrl+K elsewhere) opens the link dialog on the selection, rather than the app's "Go to…"
 * palette. The tooltips of the toolbar name the shortcuts of their buttons.
 */
export const Shortcuts: Story = {
    args: { toolbar: ['bold', 'italic', 'link', '|', 'bulletList', 'undo', 'redo'] },
    render: function Render(args) {
        const [value, setValue] = useState<string | null>('<p>Read the documentation.</p>');
        return (
            <div style={{ maxWidth: '48rem' }}>
                <RichTextField {...args} value={value} onChange={setValue} />
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const bold = canvas.getByRole('button', { name: 'Bold' });
        await expect(bold).toHaveAttribute(
            'aria-keyshortcuts',
            isApplePlatform() ? 'Meta+B' : 'Control+B',
        );
        await userEvent.hover(bold);
        await expect(await body.findByRole('tooltip')).toHaveTextContent(
            isApplePlatform() ? 'Bold⌘B' : 'BoldCtrl+B',
        );
        await userEvent.unhover(bold);
        await userEvent.tripleClick(canvas.getByText('Read the documentation.'));
        await userEvent.keyboard(modKey('k'));
        const dialog = await body.findByRole('dialog', { name: 'Link' });
        await userEvent.type(
            within(dialog).getByRole('textbox', { name: 'URL' }),
            'https://example.com/docs',
        );
        await userEvent.click(within(dialog).getByRole('button', { name: 'Apply' }));
        await waitFor(() =>
            expect(canvas.getByRole('link', { name: 'Read the documentation.' })).toHaveAttribute(
                'href',
                'https://example.com/docs',
            ),
        );
    },
};

/**
 * Links to pages of the site: with the `resource` of the field and the relation source of the
 * app, the link dialog searches its items, and still takes a URL.
 */
export const LinksToPages: Story = {
    args: { toolbar: ['bold', 'italic', 'link'], pages: ['pages'] },
    render: function Render(args) {
        const [value, setValue] = useState<string | null>(
            '<p>Write to us.</p><p>Or read <a href="/en/about" data-page-id="12" data-page-resource="pages">who we are</a>.</p>',
        );
        return (
            <FieldsProvider relationSource={pageSource}>
                <div style={{ maxWidth: '48rem' }}>
                    <RichTextField {...args} value={value} onChange={setValue} />
                </div>
            </FieldsProvider>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const body = within(canvasElement.ownerDocument.body);
        const textbox = canvas.getByRole('textbox', { name: 'Body' });
        await userEvent.tripleClick(within(textbox).getByText('Write to us.'));
        await userEvent.click(canvas.getByRole('button', { name: 'Link' }));
        const dialog = await body.findByRole('dialog', { name: 'Link' });
        await expect(within(dialog).getByRole('radio', { name: 'Page' })).toBeChecked();
        await userEvent.type(within(dialog).getByRole('combobox', { name: 'Page' }), 'cont');
        await userEvent.click(await body.findByRole('option', { name: 'Contact' }));
        await userEvent.click(within(dialog).getByRole('button', { name: 'Apply' }));
        await waitFor(() =>
            expect(within(textbox).getByRole('link', { name: 'Write to us.' })).toHaveAttribute(
                'data-page-id',
                '13',
            ),
        );
    },
};

/**
 * HTML the field keeps as it was written, named in words: a video, a post, other embedded
 * content, a table, an image, and a `<div>`. Their element is in a tooltip, for developers.
 */
export const KeptHtml: Story = {
    args: { toolbar: ['bold', 'italic', 'link'] },
    render: function Render(args) {
        const [value, setValue] = useState<string | null>(
            [
                '<p>A video:</p>',
                '<figure class="media"><oembed url="https://www.youtube.com/watch?v=abc123"></oembed></figure>',
                '<blockquote class="twitter-tweet"><p>A post</p><a href="https://twitter.com/user/status/1">Link</a></blockquote>',
                '<figure class="media"><oembed url="https://example.com/widget"></oembed></figure>',
                '<table><tbody><tr><td>A cell</td></tr></tbody></table>',
                '<figure class="image"><img src="https://example.com/a.jpg" alt="A lake"></figure>',
                '<div class="box">Some text in a box</div>',
            ].join(''),
        );
        return (
            <div style={{ maxWidth: '48rem' }}>
                <RichTextField {...args} value={value} onChange={setValue} />
            </div>
        );
    },
    play: async ({ canvasElement }) => {
        const textbox = within(canvasElement).getByRole('textbox', { name: 'Body' });
        const video = within(textbox).getByRole('img', {
            name: 'Embedded video, YouTube, https://www.youtube.com/watch?v=abc123',
        });
        await expect(video).toBeVisible();
        await expect(video).toHaveAttribute('title', 'figure.media');
        await expect(
            within(textbox).getByRole('img', {
                name: 'Embedded post, X, https://twitter.com/user/status/1',
            }),
        ).toBeVisible();
        await expect(within(textbox).getByRole('img', { name: 'Table, A cell' })).toBeVisible();
        await expect(
            within(textbox).getByRole('img', { name: 'HTML kept as is, Some text in a box' }),
        ).toBeVisible();
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
