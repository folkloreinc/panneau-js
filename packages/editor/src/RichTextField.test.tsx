import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { DefinitionField, FieldsProvider, builtInFields } from '@panneau/fields';
import type { Field } from '@panneau/protocol';
import { PanneauRoot } from '@panneau/ui';

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
) {
    return renderInRoot(
        <FieldsProvider components={{ ...builtInFields, ...plugin.fields }}>
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
            within(textbox).getByRole('img', { name: /figure\.media, https:\/\/vimeo\.com/ }),
        ).toBeInTheDocument();
        expect(textbox.querySelector('iframe')).toBeNull();
        await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
        expect(onChange).not.toHaveBeenCalled();
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
});
