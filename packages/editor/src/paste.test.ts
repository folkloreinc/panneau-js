import { Editor } from '@tiptap/core';
import { afterEach, describe, expect, it } from 'vitest';

import './__fixtures__/layout';
import { createRichTextExtensions } from './extensions/index';
import { getCopyToken } from './extensions/paste';
import { serializeRichText } from './html';

let editor: Editor | null = null;

afterEach(() => {
    editor?.destroy();
    editor = null;
});

/** Pastes HTML between the two paragraphs of an editor, as the browser does it. */
function paste(html: string): Editor {
    const element = document.createElement('div');
    document.body.append(element);
    editor = new Editor({
        element,
        extensions: createRichTextExtensions(),
        content: '<p>Before</p><p>After</p>',
    });
    editor.commands.setTextSelection(editor.state.doc.firstChild?.nodeSize ?? 0);
    // jsdom has no ClipboardEvent
    editor.view.pasteHTML(html, new Event('paste') as ClipboardEvent);
    return editor;
}

describe('pasting in the editor', () => {
    it('drops the context of a slice that wasn’t copied from this page', () => {
        const pasted = paste(
            `<p data-pm-slice='0 0 ["blockquote",{"htmlAttributes":{"onmouseover":"alert(1)","style":"position:fixed;inset:0"}}]'>Text</p>`,
        );
        const html = serializeRichText(pasted.state.doc, pasted.schema);
        expect(html).not.toContain('onmouseover');
        expect(html).not.toContain('position');
        expect(pasted.view.dom.querySelector('[onmouseover], [style]')).toBeNull();
    });

    it('never renders script attributes, even from a slice of this page', () => {
        const pasted = paste(
            `<p data-panneau-copy="${getCopyToken()}" data-pm-slice='0 0 ["blockquote",{"htmlAttributes":{"onmouseover":"alert(1)","class":"note"}}]'>Text</p>`,
        );
        expect(serializeRichText(pasted.state.doc, pasted.schema)).toContain(
            '<blockquote class="note"><p>Text</p></blockquote>',
        );
        expect(pasted.view.dom.querySelector('[onmouseover]')).toBeNull();
    });
});
