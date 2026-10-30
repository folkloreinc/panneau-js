import { type AnyExtension, getSchema } from '@tiptap/core';
import {
    DOMParser,
    DOMSerializer,
    type Node as ProseMirrorNode,
    type Schema,
} from '@tiptap/pm/model';

import { IMPLICIT_PARAGRAPH } from './extensions/attributes';
import { createRichTextExtensions } from './extensions/index';
import { restoreKeptHtml } from './extensions/raw';

/**
 * Reads HTML into a document of the schema. Unlike TipTap's `setContent()`, it keeps the
 * whitespace of the elements it keeps as written (`<pre>`, embeds).
 */
export function parseRichText(html: string | null, schema: Schema): ProseMirrorNode {
    const body = new window.DOMParser().parseFromString(
        `<!doctype html><body>${html ?? ''}</body>`,
        'text/html',
    ).body;
    return DOMParser.fromSchema(schema).parse(body);
}

/** Whether a document has no content: one empty paragraph. */
export function isEmptyDocument(doc: ProseMirrorNode): boolean {
    const first = doc.firstChild;
    return (
        doc.childCount === 1 &&
        first !== null &&
        first.type.name === 'paragraph' &&
        first.content.size === 0
    );
}

/**
 * Writes a document as HTML, or `null` when it is empty. A list item with one paragraph, that
 * wasn't written as a `<p>`, is written without it: `<li>Text</li>`.
 */
export function serializeRichText(doc: ProseMirrorNode, schema: Schema): string | null {
    if (isEmptyDocument(doc)) {
        return null;
    }
    // An inert document: images and iframes of the content don't load.
    const inert = document.implementation.createHTMLDocument();
    const container = inert.createElement('div');
    container.append(
        DOMSerializer.fromSchema(schema).serializeFragment(doc.content, { document: inert }),
    );
    restoreKeptHtml(container);
    container.querySelectorAll('li').forEach((item) => {
        const [first, ...others] = Array.from(item.children);
        if (
            first?.tagName === 'P' &&
            first.hasAttribute(IMPLICIT_PARAGRAPH) &&
            first.attributes.length === 1 &&
            others.every((other) => other.tagName === 'UL' || other.tagName === 'OL')
        ) {
            first.replaceWith(...Array.from(first.childNodes));
        }
    });
    container.querySelectorAll(`[${IMPLICIT_PARAGRAPH}]`).forEach((paragraph) => {
        paragraph.removeAttribute(IMPLICIT_PARAGRAPH);
    });
    return container.innerHTML;
}

/**
 * The HTML that the rich text field saves for this HTML once its content is edited, without
 * editing it: to check that existing content round-trips before a migration. `extensions` are
 * those of the project's plugins. Needs a DOM (a browser, or jsdom).
 */
export function normalizeRichText(
    html: string | null,
    extensions: readonly AnyExtension[] = [],
): string | null {
    const schema = getSchema(createRichTextExtensions({ extensions }));
    return serializeRichText(parseRichText(html, schema), schema);
}
