import { describe, expect, it } from 'vitest';

import { sanitizeRichText } from './sanitize';

describe('sanitizeRichText', () => {
    it('keeps the formatting of rich text', () => {
        const html =
            '<h2>Title</h2><p>Some <strong>bold</strong>, <em>italic</em> and <a href="https://example.com">a link</a>.</p><ul><li>One</li></ul>';
        expect(sanitizeRichText(html)).toBe(html);
    });

    it('removes scripts', () => {
        expect(sanitizeRichText('<p>Text</p><script>alert(1)</script>')).toBe('<p>Text</p>');
    });

    it('removes event handlers', () => {
        expect(sanitizeRichText('<p onclick="alert(1)" onmouseover="alert(2)">Text</p>')).toBe(
            '<p>Text</p>',
        );
    });

    it('removes an image error handler and keeps the image', () => {
        expect(sanitizeRichText('<img src="x" onerror="alert(1)">')).toBe('<img src="x">');
    });

    it('removes script URLs from links', () => {
        for (const href of [
            'javascript:alert(1)',
            'JaVaScRiPt:alert(1)',
            ' javascript:alert(1)',
            'java\tscript:alert(1)',
            'vbscript:msgbox(1)',
            'data:text/html,<script>alert(1)</script>',
        ]) {
            const link = document.createElement('div');
            link.innerHTML = sanitizeRichText(`<a href="${href}">Link</a>`);
            expect(link.querySelector('a')?.hasAttribute('href')).toBe(false);
        }
    });

    it('limits links to http, https, mailto, tel and relative URLs', () => {
        for (const href of [
            'https://example.com',
            'http://example.com',
            'mailto:ada@example.com',
            'tel:+15145550123',
            '/pages/about',
            'about',
            '#top',
        ]) {
            expect(sanitizeRichText(`<a href="${href}">Link</a>`)).toBe(
                `<a href="${href}">Link</a>`,
            );
        }
        for (const href of ['ftp://example.com/file', 'sms:+15145550123', 'xmpp:ada@example.com']) {
            expect(sanitizeRichText(`<a href="${href}">Link</a>`)).toBe('<a>Link</a>');
        }
    });

    it('removes style blocks, style and class attributes', () => {
        expect(
            sanitizeRichText(
                '<style>body { display: none }</style><p style="position: fixed" class="panneau-dialog">Text</p>',
            ),
        ).toBe('<p>Text</p>');
    });

    it('removes frames, forms, SVG and MathML', () => {
        expect(
            sanitizeRichText(
                '<iframe src="https://example.com"></iframe><form action="/x"><input name="a"><button>Go</button></form><svg><circle r="1"></circle></svg><math><mi>x</mi></math><p>Text</p>',
            ),
        ).toBe('Go<p>Text</p>');
    });

    it('opens links in a new tab without an opener, and never in another frame', () => {
        expect(sanitizeRichText('<a href="https://example.com" target="_blank">Link</a>')).toBe(
            '<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a>',
        );
        expect(sanitizeRichText('<a href="https://example.com" target="_top">Link</a>')).toBe(
            '<a href="https://example.com">Link</a>',
        );
    });
});
