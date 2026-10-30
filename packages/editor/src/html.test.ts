import { Node, getSchema, mergeAttributes } from '@tiptap/core';
import { describe, expect, it } from 'vitest';

import { ckeditor4, ckeditor5 } from './__fixtures__/ckeditor';
import { equivalent } from './__fixtures__/equivalent';
import { createRichTextExtensions } from './extensions/index';
import { createCopySerializer, createPasteParser, getCopyToken } from './extensions/paste';
import { normalizeRichText, parseRichText, serializeRichText } from './html';

const normalizeDocument = parseRichText;

/** The HTML that pasting this HTML gives. */
function paste(html: string): string | null {
    const schema = getSchema(createRichTextExtensions());
    const body = new window.DOMParser().parseFromString(html, 'text/html').body;
    const slice = createPasteParser(schema).parseSlice(body);
    return serializeRichText(schema.topNodeType.create(null, slice.content), schema);
}

describe('normalizeRichText', () => {
    it('writes HTML of CKEditor 5 as it was', () => {
        expect(normalizeRichText(ckeditor5)).toBe(ckeditor5);
    });

    it('writes HTML of CKEditor 4 in a form that renders the same', () => {
        const html = normalizeRichText(ckeditor4);
        expect(equivalent(html)).toBe(equivalent(ckeditor4));
        // What the field doesn't edit stays as it was written, whitespace included.
        expect(html).toContain(
            '<p><img alt="" src="https://example.com/image.jpg" style="height:200px; width:300px"></p>',
        );
        expect(html).toContain('<pre>Preformatted   text,\n  kept as is.</pre>');
        expect(html).toContain(
            '<script async="" src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>',
        );
        expect(html).toContain('<td>Other cell</td>');
    });

    it('writes the same HTML again', () => {
        [ckeditor4, ckeditor5].forEach((html) => {
            const once = normalizeRichText(html);
            expect(normalizeRichText(once)).toBe(once);
        });
    });

    it('keeps the elements marks were written with', () => {
        expect(normalizeRichText('<p><b>a</b> <strong>b</strong> <i>c</i> <em>d</em></p>')).toBe(
            '<p><b>a</b> <strong>b</strong> <i>c</i> <em>d</em></p>',
        );
        // Google Docs wraps pasted content in a `<b>` that isn't bold.
        expect(normalizeRichText('<p><b style="font-weight: normal">a</b></p>')).toBe('<p>a</p>');
    });

    it('writes list items as they were written', () => {
        expect(normalizeRichText('<ul><li>a</li><li><p>b</p></li></ul>')).toBe(
            '<ul><li>a</li><li><p>b</p></li></ul>',
        );
        expect(normalizeRichText('<ul><li class="x" lang="fr">a</li></ul>')).toBe(
            '<ul><li class="x" lang="fr">a</li></ul>',
        );
    });

    it('is null for empty content', () => {
        expect(normalizeRichText(null)).toBeNull();
        expect(normalizeRichText('')).toBeNull();
        expect(normalizeRichText('<p></p>')).toBeNull();
        expect(normalizeRichText('<p>&nbsp;</p>')).toBe('<p>&nbsp;</p>');
    });

    it('drops links to scripts', () => {
        expect(normalizeRichText('<p><a href="javascript:alert(1)">a</a></p>')).toBe('<p>a</p>');
    });

    it('reads the nodes of extensions before the HTML it keeps', () => {
        const Logo = Node.create({
            name: 'logo',
            group: 'inline',
            inline: true,
            atom: true,
            parseHTML: () => [{ tag: 'span[data-logo]' }],
            renderHTML: ({ HTMLAttributes }) => [
                'span',
                mergeAttributes(HTMLAttributes, { 'data-logo': '' }),
            ],
        });
        const html = '<p>Made by <span data-logo=""></span>.</p>';
        expect(normalizeRichText(html, [Logo])).toBe(html);
        expect(normalizeRichText(html)).toBe(html);
    });
});

describe('createPasteParser', () => {
    it('brings the text, structure and marks of pasted content, not its styles', () => {
        expect(
            paste(
                '<meta charset="utf-8"><b style="font-weight:normal;" id="docs-internal-guid-1"><h2 dir="ltr" style="line-height:1.38"><span style="font-size:16pt">Title</span></h2><p dir="ltr" style="line-height:1.38;margin-top:0pt;"><span style="font-size:11pt;font-family:Arial;font-weight:700;">Bold</span><span style="font-size:11pt;font-style:italic;"> italic</span><span style="font-size:11pt;"> and <a href="https://example.com" style="color:#1155cc">a link</a></span></p></b><div class="wrapper"><p class="lead">In a div</p></div>',
            ),
        ).toBe(
            '<h2>Title</h2><p><strong>Bold</strong><em> italic</em> and <a href="https://example.com">a link</a></p><p>In a div</p>',
        );
    });

    it('reads content copied from a rich text field of this page in full', () => {
        const html =
            '<p class="big">Big</p><figure class="media"><oembed url="https://example.com/v"></oembed></figure>';
        expect(paste(html)).toBe('<p>Big</p>');
        // What the field copies, as ProseMirror puts it in the clipboard
        const schema = getSchema(createRichTextExtensions());
        const container = document.createElement('div');
        container.append(
            createCopySerializer(schema).serializeFragment(normalizeDocument(html, schema).content),
        );
        container.firstElementChild?.setAttribute('data-pm-slice', '0 0 []');
        expect(container.innerHTML).toContain(`data-panneau-copy="${getCopyToken()}"`);
        expect(paste(container.innerHTML)).toBe(html);
    });

    it('doesn’t trust HTML that claims to come from a ProseMirror editor', () => {
        expect(
            paste(
                '<div data-pm-slice="0 0 []"><p onmouseover="alert(1)" style="position:fixed">Text<img src="x" onerror="alert(2)"></p></div>',
            ),
        ).toBe('<p>Text</p>');
        expect(
            paste(
                '<p data-pm-slice="1 1 []" data-panneau-copy="forged" onclick="alert(1)">Text</p><script>alert(2)</script>',
            ),
        ).toBe('<p>Text</p>');
    });
});

describe('kept HTML', () => {
    it('is never made of an attribute of the content', () => {
        const html = normalizeRichText(
            '<p><span data-panneau-html="&lt;img src=x onerror=alert(1)&gt;">text</span></p><div data-panneau-html="&lt;script&gt;alert(2)&lt;/script&gt;"></div>',
        );
        const body = new window.DOMParser().parseFromString(html ?? '', 'text/html').body;
        expect(body.querySelector('img, script')).toBeNull();
        expect(body.querySelector('p')?.outerHTML).toBe('<p>text</p>');
    });
});

describe('script attributes', () => {
    it('are only event handlers and script URLs', () => {
        const html =
            '<p class="javascript-intro" title="JavaScript: the good parts">A <a href="/js" title="javascript:">link</a></p>';
        expect(normalizeRichText(html)).toBe(html);
    });

    it('are dropped from the elements the field edits, and from kept marks', () => {
        expect(
            normalizeRichText(
                '<p onmouseover="a()" class="intro">A <strong onclick="b()">b</strong> <a href="/page" onclick="c()" title="Page">link</a> <span onfocus="d()" style="color:red">span</span> <q cite=" JaVa&#x0A;script:e()">bare</q> <abbr title="x" onClick="f()">abbr</abbr></p>',
            ),
        ).toBe(
            '<p class="intro">A <strong>b</strong> <a href="/page" title="Page">link</a> <span style="color: red;">span</span> <q>bare</q> <abbr title="x">abbr</abbr></p>',
        );
        expect(
            normalizeRichText('<p><span data-src="javascript:x" cite="javascript:y">a</span></p>'),
        ).toBe('<p><span data-src="javascript:x">a</span></p>');
    });
});
