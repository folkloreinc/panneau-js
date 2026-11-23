import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
    DefinitionField,
    FieldsProvider,
    type RelationSource,
    builtInFields,
} from '@panneau/fields';
import type { Field } from '@panneau/protocol';
import { PanneauRoot, useCommandShortcut } from '@panneau/ui';

import { RichTextField } from './RichTextField';
import { ckeditor5 } from './__fixtures__/ckeditor';
import './__fixtures__/layout';
import { Logo, logoButton } from './__fixtures__/logo';
import { createEditorPlugin, editorPlugin } from './plugin';

function renderInRoot(ui: ReactElement) {
    return render(<PanneauRoot>{ui}</PanneauRoot>);
}

function renderDefinition(
    field: Field,
    value: unknown,
    onChange: (value: unknown) => void,
    plugin = editorPlugin,
    relationSource: RelationSource | null = null,
) {
    return renderInRoot(
        <FieldsProvider
            components={{ ...builtInFields, ...plugin.fields }}
            relationSource={relationSource}
        >
            <DefinitionField field={field} path={field.name} value={value} onChange={onChange} />
        </FieldsProvider>,
    );
}

/** Selects the whole text, as Ctrl+A does in the editor. */
async function selectAll(textbox: HTMLElement) {
    await userEvent.click(textbox);
    await userEvent.keyboard('{Control>}a{/Control}');
}

describe('RichTextField', () => {
    it('shows HTML written by CKEditor, and gives nothing back until it is edited', async () => {
        const onChange = vi.fn();
        renderInRoot(<RichTextField label="Body" value={ckeditor5} onChange={onChange} />);
        const textbox = screen.getByRole('textbox', { name: 'Body' });
        expect(within(textbox).getByRole('heading', { name: 'A heading' })).toBeInTheDocument();
        expect(within(textbox).getByText('A big paragraph, with', { exact: false })).toHaveClass(
            'big',
        );
        // Embeds are shown by what they point to, never rendered
        expect(
            within(textbox).getByRole('img', {
                name: 'Embedded video, Vimeo, https://vimeo.com/123456',
            }),
        ).toBeInTheDocument();
        expect(textbox.querySelector('iframe')).toBeNull();
        await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
        expect(onChange).not.toHaveBeenCalled();
    });

    it('breaks lines with Shift Enter, and leaves Ctrl Enter to the form', async () => {
        const onChange = vi.fn();
        const onKeyDown = vi.fn();
        renderInRoot(
            <div onKeyDown={(event) => onKeyDown(event.key, event.ctrlKey)}>
                <RichTextField label="Body" value={null} onChange={onChange} />
            </div>,
        );
        await userEvent.click(screen.getByRole('textbox', { name: 'Body' }));
        await userEvent.keyboard('Hello');
        expect(onChange).toHaveBeenLastCalledWith('<p>Hello</p>');
        const changes = onChange.mock.calls.length;
        await userEvent.keyboard('{Control>}{Enter}{/Control}');
        expect(onKeyDown).toHaveBeenLastCalledWith('Enter', true);
        expect(onChange).toHaveBeenCalledTimes(changes);
        await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
        expect(onChange).toHaveBeenLastCalledWith('<p>Hello<br></p>');
    });

    it('gives HTML once edited, and null once empty', async () => {
        const onChange = vi.fn();
        renderInRoot(
            <RichTextField
                label="Body"
                value="<p>Hello</p>"
                onChange={onChange}
                toolbar={['bold']}
            />,
        );
        const textbox = screen.getByRole('textbox', { name: 'Body' });
        await selectAll(textbox);
        await userEvent.click(screen.getByRole('button', { name: 'Bold' }));
        expect(onChange).toHaveBeenLastCalledWith('<p><strong>Hello</strong></p>');
        expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute(
            'aria-pressed',
            'true',
        );
        await selectAll(textbox);
        await userEvent.keyboard('{Backspace}');
        expect(onChange).toHaveBeenLastCalledWith(null);
    });

    it('replaces its content with a value from elsewhere, without giving it back', () => {
        const onChange = vi.fn();
        const { rerender } = renderInRoot(
            <RichTextField label="Body" value="<p>First</p>" onChange={onChange} />,
        );
        rerender(
            <PanneauRoot>
                <RichTextField label="Body" value="<p>Second</p>" onChange={onChange} />
            </PanneauRoot>,
        );
        expect(screen.getByRole('textbox', { name: 'Body' })).toHaveTextContent('Second');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('never puts what would run a script in the page', () => {
        renderInRoot(
            <RichTextField
                label="Body"
                value={
                    '<p onmouseover="alert(1)" class="intro">Text <strong onclick="alert(2)">bold</strong> <a href="/x" onfocus="alert(3)">link</a><img src="x" onerror="alert(4)"></p><figure class="media"><iframe src="javascript:alert(5)"></iframe></figure><script>alert(6)</script>'
                }
            />,
        );
        const textbox = screen.getByRole('textbox', { name: 'Body' });
        expect(textbox.querySelector('[onmouseover], [onclick], [onfocus], [onerror]')).toBeNull();
        // ProseMirror's own separators aside
        expect(textbox.querySelector('img:not(.ProseMirror-separator), iframe, script')).toBeNull();
        expect(within(textbox).getByText('Text', { exact: false })).toHaveClass('intro');
    });

    it('never puts kept HTML in the page, even when it unmounts', async () => {
        const added: string[] = [];
        const observer = new MutationObserver((records) => {
            records.forEach((record) =>
                record.addedNodes.forEach((node) => {
                    if (node instanceof Element) {
                        [node, ...Array.from(node.querySelectorAll('*'))]
                            .filter((element) =>
                                element.matches(
                                    'img:not(.ProseMirror-separator), iframe, script, [onerror]',
                                ),
                            )
                            .forEach((element) => added.push(element.outerHTML));
                    }
                }),
            );
        });
        observer.observe(document.body, { childList: true, subtree: true });
        const { unmount } = renderInRoot(
            <RichTextField
                label="Body"
                value={
                    '<p>x<img src="/nope.png" onerror="alert(1)"></p><figure class="media"><iframe src="javascript:alert(2)"></iframe></figure>'
                }
            />,
        );
        unmount();
        await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
        observer.disconnect();
        expect(added).toEqual([]);
    });

    it('has no toolbar when read-only', () => {
        renderInRoot(<RichTextField label="Body" value="<p>Text</p>" readOnly />);
        expect(screen.queryByRole('toolbar')).toBeNull();
        expect(screen.getByRole('textbox', { name: 'Body' })).toHaveAttribute(
            'contenteditable',
            'false',
        );
    });
});

describe('RichTextFieldEntry', () => {
    it('shows the toolbar of the settings, without the names it doesn’t know', () => {
        renderDefinition(
            {
                name: 'body',
                type: 'richtext',
                label: 'Body',
                settings: { toolbar: ['|', 'bold', 'italic', '|', '|', 'unknown', 'style', '|'] },
            },
            null,
            () => undefined,
        );
        const toolbar = screen.getByRole('toolbar', { name: 'Formatting' });
        expect(
            within(toolbar)
                .getAllByRole('button')
                .map((button) => button.getAttribute('aria-label')),
        ).toEqual(['Bold', 'Italic']);
        // `style` without styles, and separators at the ends, don't show
        expect(within(toolbar).queryAllByRole('separator')).toHaveLength(0);
    });

    it('turns a paragraph into a heading, and back', async () => {
        const onChange = vi.fn();
        renderDefinition(
            {
                name: 'body',
                type: 'richtext',
                label: 'Body',
                settings: { toolbar: ['heading'] },
            },
            '<p>Text</p>',
            onChange,
        );
        await userEvent.click(screen.getByRole('textbox', { name: 'Body' }));
        const select = screen.getByRole('button', { name: /Text style/ });
        expect(select).toBeEnabled();
        await userEvent.click(select);
        await userEvent.click(screen.getByRole('option', { name: 'Heading 2' }));
        expect(onChange).toHaveBeenLastCalledWith('<h2>Text</h2>');
        await userEvent.click(screen.getByRole('button', { name: /Text style/ }));
        await userEvent.click(screen.getByRole('option', { name: 'Paragraph' }));
        expect(onChange).toHaveBeenLastCalledWith('<p>Text</p>');
    });

    it('puts a block style on a paragraph, and takes it off', async () => {
        const onChange = vi.fn();
        renderDefinition(
            {
                name: 'body',
                type: 'richtext',
                label: 'Body',
                settings: {
                    toolbar: ['style'],
                    styles: [
                        { label: 'Big paragraph', class: 'big' },
                        { label: 'Small heading', class: 'small', element: 'h2' },
                    ],
                },
            },
            '<p class="intro">Text</p>',
            onChange,
        );
        await userEvent.click(screen.getByRole('textbox', { name: 'Body' }));
        await userEvent.click(screen.getByRole('button', { name: /Style/ }));
        expect(screen.getByRole('option', { name: 'Small heading' })).toHaveAttribute(
            'aria-disabled',
            'true',
        );
        await userEvent.click(screen.getByRole('option', { name: 'Big paragraph' }));
        expect(onChange).toHaveBeenLastCalledWith('<p class="intro big">Text</p>');
        await userEvent.click(screen.getByRole('button', { name: /Style/ }));
        await userEvent.click(screen.getByRole('option', { name: 'No style' }));
        expect(onChange).toHaveBeenLastCalledWith('<p class="intro">Text</p>');
    });

    it('opens links to other sites in a new tab with `newTab: external`', async () => {
        const onChange = vi.fn();
        renderDefinition(
            {
                name: 'body',
                type: 'richtext',
                label: 'Body',
                settings: { toolbar: ['link'], links: { newTab: 'external' } },
            },
            '<p>Site</p>',
            onChange,
        );
        await selectAll(screen.getByRole('textbox', { name: 'Body' }));
        await userEvent.click(screen.getByRole('button', { name: 'Link' }));
        const dialog = screen.getByRole('dialog', { name: 'Link' });
        expect(within(dialog).queryByRole('checkbox')).toBeNull();
        await userEvent.type(
            within(dialog).getByRole('textbox', { name: 'URL' }),
            'https://example.com',
        );
        await userEvent.click(within(dialog).getByRole('button', { name: 'Apply' }));
        expect(onChange).toHaveBeenLastCalledWith(
            '<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">Site</a></p>',
        );
    });

    it('takes the extensions and buttons of a plugin', async () => {
        const onChange = vi.fn();
        renderDefinition(
            {
                name: 'body',
                type: 'richtext',
                label: 'Body',
                settings: { toolbar: ['bold', 'logo'] },
            },
            '<p>Made by <span class="logo" data-logo=""></span></p>',
            onChange,
            createEditorPlugin({ extensions: [Logo], buttons: [logoButton] }),
        );
        const textbox = screen.getByRole('textbox', { name: 'Body' });
        expect(within(textbox).getByLabelText('Logo')).toHaveClass('logo');
        await selectAll(textbox);
        await userEvent.click(screen.getByRole('button', { name: 'Logo' }));
        expect(onChange).toHaveBeenLastCalledWith(
            '<p><span class="logo" data-logo="" aria-label="Logo"></span></p>',
        );
    });

    it('opens the link dialog with Ctrl+K in the editor, and leaves the palette alone', async () => {
        const onPalette = vi.fn();
        function Palette() {
            useCommandShortcut(onPalette);
            return <button type="button">Elsewhere</button>;
        }
        renderInRoot(
            <>
                <Palette />
                <RichTextField label="Body" value="<p>Site</p>" toolbar={['bold', 'link']} />
            </>,
        );
        await selectAll(screen.getByRole('textbox', { name: 'Body' }));
        await userEvent.keyboard('{Control>}k{/Control}');
        expect(screen.getByRole('dialog', { name: 'Link' })).toBeInTheDocument();
        expect(onPalette).not.toHaveBeenCalled();
        await userEvent.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).toBeNull();
        // Outside the editor, the palette opens
        await userEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
        await userEvent.keyboard('{Control>}k{/Control}');
        expect(onPalette).toHaveBeenCalledTimes(1);
    });

    it('leaves Ctrl+K to the palette without a link button', async () => {
        const onPalette = vi.fn();
        function Palette() {
            useCommandShortcut(onPalette);
            return null;
        }
        renderInRoot(
            <>
                <Palette />
                <RichTextField label="Body" value="<p>Site</p>" toolbar={['bold']} />
            </>,
        );
        await selectAll(screen.getByRole('textbox', { name: 'Body' }));
        await userEvent.keyboard('{Control>}k{/Control}');
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(onPalette).toHaveBeenCalledTimes(1);
    });

    it('names the shortcuts of its buttons', () => {
        renderInRoot(
            <RichTextField
                label="Body"
                value={null}
                toolbar={['bold', 'link', 'bulletList', 'clear', 'redo']}
            />,
        );
        expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute(
            'aria-keyshortcuts',
            'Control+B',
        );
        expect(screen.getByRole('button', { name: 'Link' })).toHaveAttribute(
            'aria-keyshortcuts',
            'Control+K',
        );
        expect(screen.getByRole('button', { name: 'Bulleted list' })).toHaveAttribute(
            'aria-keyshortcuts',
            'Control+Shift+8',
        );
        expect(screen.getByRole('button', { name: 'Redo' })).toHaveAttribute(
            'aria-keyshortcuts',
            'Control+Shift+Z',
        );
        expect(screen.getByRole('button', { name: 'Clear formatting' })).not.toHaveAttribute(
            'aria-keyshortcuts',
        );
    });

    it('links to an item of the site, searched with the relation source', async () => {
        const onChange = vi.fn();
        const search = vi.fn((resource: string, query: string) =>
            Promise.resolve(
                [
                    { id: '12', label: 'About us' },
                    { id: '13', label: 'Contact' },
                ].filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
            ),
        );
        renderDefinition(
            {
                name: 'body',
                type: 'richtext',
                label: 'Body',
                resource: 'pages',
                settings: { toolbar: ['link'] },
            },
            '<p>Site</p>',
            onChange,
            editorPlugin,
            { search },
        );
        await selectAll(screen.getByRole('textbox', { name: 'Body' }));
        await userEvent.click(screen.getByRole('button', { name: 'Link' }));
        const dialog = screen.getByRole('dialog', { name: 'Link' });
        expect(within(dialog).getByRole('radio', { name: 'Page' })).toBeChecked();
        await userEvent.type(within(dialog).getByRole('combobox', { name: 'Page' }), 'abo');
        await userEvent.click(await screen.findByRole('option', { name: 'About us' }));
        expect(search).toHaveBeenLastCalledWith('pages', 'abo', expect.anything());
        await userEvent.click(within(dialog).getByRole('button', { name: 'Apply' }));
        expect(onChange).toHaveBeenLastCalledWith(
            '<p><a href="#" data-page-id="12" data-page-resource="pages">Site</a></p>',
        );
    });

    it('opens on the item of a link, keeps its URL, and turns it into a URL', async () => {
        const onChange = vi.fn();
        renderDefinition(
            {
                name: 'body',
                type: 'richtext',
                label: 'Body',
                resource: ['pages', 'events'],
                settings: { toolbar: ['link'] },
            },
            '<p><a href="/en/about" data-page-id="12" data-page-resource="pages">About</a></p>',
            onChange,
            editorPlugin,
            { search: () => Promise.resolve([]) },
        );
        const textbox = screen.getByRole('textbox', { name: 'Body' });
        await selectAll(textbox);
        await userEvent.keyboard('{Control>}k{/Control}');
        let dialog = screen.getByRole('dialog', { name: 'Link' });
        expect(within(dialog).getByRole('combobox', { name: 'Page' })).toHaveValue('About');
        // The same item keeps the URL the backend wrote: nothing changed
        await userEvent.click(within(dialog).getByRole('button', { name: 'Apply' }));
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(onChange).not.toHaveBeenCalled();
        await selectAll(textbox);
        await userEvent.keyboard('{Control>}k{/Control}');
        dialog = screen.getByRole('dialog', { name: 'Link' });
        await userEvent.click(within(dialog).getByRole('radio', { name: 'URL' }));
        await userEvent.type(
            within(dialog).getByRole('textbox', { name: 'URL' }),
            'https://example.com',
        );
        await userEvent.click(within(dialog).getByRole('button', { name: 'Apply' }));
        expect(onChange).toHaveBeenLastCalledWith('<p><a href="https://example.com">About</a></p>');
    });

    it('links to URLs only without a relation source', async () => {
        renderDefinition(
            {
                name: 'body',
                type: 'richtext',
                label: 'Body',
                resource: 'pages',
                settings: { toolbar: ['link'] },
            },
            '<p>Site</p>',
            vi.fn(),
        );
        await selectAll(screen.getByRole('textbox', { name: 'Body' }));
        await userEvent.click(screen.getByRole('button', { name: 'Link' }));
        const dialog = screen.getByRole('dialog', { name: 'Link' });
        expect(within(dialog).queryByRole('radio')).toBeNull();
        expect(within(dialog).getByRole('textbox', { name: 'URL' })).toHaveFocus();
    });

    it('says what kept HTML is, with its element for developers', () => {
        renderInRoot(
            <RichTextField
                label="Body"
                value={[
                    '<figure class="media"><oembed url="https://www.youtube.com/watch?v=abc123"></oembed></figure>',
                    '<blockquote class="twitter-tweet"><p>A post</p><a href="https://twitter.com/user/status/1">Link</a></blockquote>',
                    '<figure class="media"><oembed url="https://example.com/widget"></oembed></figure>',
                    '<table><tbody><tr><td>A cell</td></tr></tbody></table>',
                    '<figure class="image"><img src="https://example.com/a.jpg" alt="A lake"></figure>',
                    '<div class="box">Some text</div>',
                ].join('')}
            />,
        );
        const textbox = screen.getByRole('textbox', { name: 'Body' });
        const video = within(textbox).getByRole('img', {
            name: 'Embedded video, YouTube, https://www.youtube.com/watch?v=abc123',
        });
        expect(video).toHaveAttribute('title', 'figure.media');
        expect(video).toHaveTextContent('Embedded video');
        expect(video.querySelector('[data-player]')).not.toBeNull();
        expect(
            within(textbox).getByRole('img', {
                name: 'Embedded post, X, https://twitter.com/user/status/1',
            }),
        ).toHaveAttribute('title', 'blockquote.twitter-tweet');
        expect(
            within(textbox)
                .getByRole('img', {
                    name: 'Embedded content, https://example.com/widget',
                })
                .querySelector('[data-player]'),
        ).toBeNull();
        expect(within(textbox).getByRole('img', { name: 'Table, A cell' })).toBeInTheDocument();
        expect(within(textbox).getByRole('img', { name: 'Image, A lake' })).toBeInTheDocument();
        expect(
            within(textbox).getByRole('img', { name: 'HTML kept as is, Some text' }),
        ).toHaveAttribute('title', 'div.box');
    });
});
